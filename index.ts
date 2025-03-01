import express from 'express';
import dotenv from 'dotenv';
import { Account, SDK, Block, Pallets } from 'avail-js-sdk';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize SDK
let sdk: SDK;

async function initializeSDK() {
  sdk = await SDK.New('wss://turing-rpc.avail.so/ws');
  console.log('Avail SDK initialized');
}

// Initialize SDK when app starts
initializeSDK().catch(console.error);

// Submit data to Avail
app.post('/submit', async (req, res) => {
  try {
    const { data, appId } = req.body;
    
    const seed = process.env.SEED;
    if (!seed) {
      throw new Error("SEED environment variable is not set");
    }

    const account = Account.new(seed);
    const tx = sdk.tx.dataAvailability.submitData(data);
    
    const result = await tx.executeWaitForInclusion(account, { app_id: appId });
    
    if (!result.isSuccessful()) {
      throw new Error("Transaction failed");
    }

    const event = result.events?.findFirst(Pallets.DataAvailabilityEvents.DataSubmitted);
    
    res.json({
      success: true,
      blockHash: result.blockHash,
      blockNumber: result.blockNumber,
      txHash: result.txHash,
      dataHash: event?.dataHash
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Read data by transaction hash
app.get('/read/:txHash/:blockHash', async (req, res) => {
  try {
    const { txHash, blockHash } = req.params;
    
    const block = await Block.New(sdk.client, blockHash);
    const blobs = block.dataSubmissions({ txHash });

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});