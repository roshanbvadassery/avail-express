import express from 'express';
import dotenv from 'dotenv';
import { Account, SDK, Block, Pallets } from 'avail-js-sdk';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { Provider, Wallet, utils } from 'zksync-web3';

dotenv.config();

const app = express();
app.use(express.json());

// Replace the existing CORS configuration with this
app.use(cors({
    origin: '*', // Be more specific in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Add static file serving - add this near the top with other middleware
app.use(express.static('public'));

// Initialize SDK
let sdk: SDK;

async function initializeSDK() {
  sdk = await SDK.New('wss://turing-rpc.avail.so/ws');
  console.log('Avail SDK initialized');
}

// Initialize SDK when app starts
initializeSDK().catch(console.error);

// Read it using fs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DataMarketplaceABI = JSON.parse(
  fs.readFileSync(path.join(__dirname, './DataMarketplaceABI.json'), 'utf8')
);

// Add contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.ETH_RPC_URL || 'https://rpc.testnet.sophon.xyz';
const zkProvider = new Provider(RPC_URL);
const zkWallet = new Wallet(process.env.PRIVATE_KEY || '', zkProvider);
const contract = new ethers.Contract(CONTRACT_ADDRESS || '', DataMarketplaceABI, zkWallet);

// Add ERC20 token configuration
const TOKEN_ADDRESS = "0x50C9f5DF42cd8B06CAd991942a212B33550398DF";
const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
];

// Submit data to Avail and create a marketplace listing
app.post('/list-data', async (req, res) => {
  try {
    const { data, appId, price, description } = req.body;
    
    if (!data || !appId || !price || !description) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const seed = process.env.SEED;
    if (!seed) {
      throw new Error("SEED environment variable is not set");
    }

    // Submit data to Avail
    const account = Account.new(seed);
    const tx = sdk.tx.dataAvailability.submitData(data);
    
    const result = await tx.executeWaitForInclusion(account, { app_id: appId });
    
    if (!result.isSuccessful()) {
      throw new Error("Transaction failed");
    }

    const event = result.events?.findFirst(Pallets.DataAvailabilityEvents.DataSubmitted);
    
    // Convert H256 objects to hex strings
    const txHashHex = `0x${Buffer.from(result.txHash.value).toString('hex')}`;
    const blockHashHex = `0x${Buffer.from(result.blockHash.value).toString('hex')}`;
    
    // Debug information
    console.log("Avail transaction result:", {
      txHash: txHashHex,
      blockHash: blockHashHex,
      blockNumber: result.blockNumber
    });
    
    // Setup paymaster parameters for Sophon
    const paymasterParams = utils.getPaymasterParams(
      "0x98546B226dbbA8230cf620635a1e4ab01F6A99B2", // Sophon Paymaster address
      {
        type: "General",
        innerInput: new Uint8Array(),
      }
    );
    
    // Create listing on the marketplace with paymaster
    const listDataTx = await contract.populateTransaction.listData(
      ethers.utils.parseEther(price.toString()),
      txHashHex,
      blockHashHex,
      description
    );
    
    // Customize the transaction with paymaster data
    const txHandle = await zkWallet.sendTransaction({
      ...listDataTx,
      customData: {
        paymasterParams: paymasterParams,
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      }
    });
    
    const receipt = await txHandle.wait();
    
    // Handle the events safely with proper type checking
    let listingId: string | undefined;
    
    if (receipt.logs) {
      // Parse the logs manually to find the DataListed event
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog.name === 'DataListed' && parsedLog.args.listingId) {
            listingId = parsedLog.args.listingId.toString();
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed by this interface
          continue;
        }
      }
    }

    res.json({
      success: true,
      blockHash: blockHashHex,
      blockNumber: result.blockNumber,
      txHash: txHashHex,
      dataHash: event?.dataHash ? `0x${Buffer.from(event.dataHash.value).toString('hex')}` : null,
      listingId
    });

  } catch (error) {
    console.error("Error in /list-data:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error // Include full error details for debugging
    });
  }
});

// Read data by listing ID (checks purchase authorization)
app.get('/marketplace/data/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ success: false, error: 'Buyer address is required' });
    }

    // Check if the address has purchased this listing
    const hasPurchased = await contract.hasPurchased(address, listingId);
    
    if (!hasPurchased) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to access this data' 
      });
    }
    
    // Get the Avail transaction details
    const accessDetails = await contract.getDataAccessDetails(listingId);
    const { availTxHash, availBlockHash } = accessDetails;
    
    // Fetch data from Avail
    const block = await Block.New(sdk.client, availBlockHash);
    const blobs = block.dataSubmissions({ txHash: availTxHash });

    res.json({
      success: true,
      submissions: blobs.map(blob => ({
        txHash: blob.txHash,
        txIndex: blob.txIndex,
        data: blob.toAscii(),
        appId: blob.appId,
        signer: blob.txSigner
      }))
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get all marketplace listings
app.get('/marketplace/listings', async (req, res) => {
  try {
    // Add debug headers
    res.header('X-Debug', 'Reached listings endpoint');
    
    // Add console log for debugging
    console.log('Received request for /marketplace/listings');
    
    // Instead of calling nextListingId as a function, we need to find active listings differently
    // We'll try to fetch listings until we encounter an error or a certain limit
    const listings = [];
    let id = 1;
    const MAX_LISTINGS = 100; // Safety limit to prevent infinite loops
    
    while (id <= MAX_LISTINGS) {
      try {
        const listing = await contract.getListingDetails(id);
        if (listing.active) {
          listings.push({
            id: id,
            seller: listing.seller,
            price: ethers.utils.formatEther(listing.price),
            description: listing.description
          });
        }
        id++;
      } catch (e) {
        // If we get an error like "Listing does not exist", we've reached the end
        // or encountered a gap in listing IDs
        if (id > 1 && listings.length > 0) {
          // We've found some listings, so we can break
          break;
        } else if (id >= MAX_LISTINGS) {
          // Safety check to prevent infinite loops
          break;
        } else {
          // Try the next ID in case there are gaps
          id++;
        }
      }
    }
    
    // Add debug info to response
    res.json({ 
      success: true, 
      listings,
      debug: {
        timestamp: new Date().toISOString(),
        requestOrigin: req.headers.origin
      }
    });
  } catch (error) {
    console.error("Error in /marketplace/listings:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }
    });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});