Deployed ZKsync Contract address: 0x3C4E5d11A05f9d5C1204eFde4A2963F8f14392B4


Deployed Optimism Contrct Address: 0xF05B1bE94b9A48918Ac64E8Ee280e076fbE4A8C3
Deployed ZKsync address
# Capable ZK Agents

A decentralized marketplace for AI capabilities powered by zero-knowledge proofs on zkSync Era.

## Overview

Capable ZK Agents is a platform that enables the tokenization, verification, and exchange of AI capabilities across blockchain networks. The platform leverages zero-knowledge proofs to ensure data privacy while enabling seamless discovery and integration of AI capabilities into agent workflows.

## Features

- **Tokenized AI Capabilities**: Convert AI models, tools, and datasets into tradable assets
- **Zero-Knowledge Verification**: Verify capability authenticity without revealing sensitive data
- **Cross-Chain Compatibility**: Deploy and access capabilities across multiple blockchain networks
- **LangChain & Eliza Integration**: Seamlessly integrate purchased capabilities into AI agent frameworks
- **Privacy-Preserving Access Control**: Control who can access your AI capabilities with cryptographic guarantees

## Architecture

The system consists of several key components:

- **Smart Contracts**: Solidity contracts deployed on zkSync Era for marketplace functionality
- **Backend API**: Express server for data submission to Avail and marketplace interactions
- **Frontend Interface**: React-based UI for browsing, purchasing, and managing AI capabilities
- **ZK Verification Layer**: Zero-knowledge proof generation and verification for capability authentication

## Technical Stack

- **Blockchain**: zkSync Era, Solidity
- **Frontend**: HTML, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Data Availability**: Avail
- **Development**: Hardhat, zkSync Hardhat plugins

## Getting Started

### Prerequisites

- Node.js v16+
- Yarn or npm
- MetaMask or another Web3 wallet

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/capable-zk-agents.git
   cd capable-zk-agents
   ```

2. Install dependencies:
   ```
   cd zk-marketplace
   yarn install
   ```

3. Create a `.env` file with the following variables:
   ```
   PRIVATE_KEY=your_private_key
   CONTRACT_ADDRESS=deployed_contract_address
   ETH_RPC_URL=your_rpc_url
   SEED=your_avail_seed
   ```

4. Compile the smart contracts:
   ```
   npx hardhat compile
   ```

5. Deploy to zkSync testnet:
   ```
   npx hardhat deploy-zksync
   ```

### Running the Application

1. Start the backend server:
   ```
   node index.js
   ```

2. Open `public/index.html` in your browser or serve it using a static file server.

## Usage

### Listing an AI Capability

1. Connect your wallet
2. Click "List New Capability"
3. Enter capability details, including data, agent ID, price, and description
4. Submit the transaction

### Purchasing a Capability

1. Browse available capabilities
2. Click "Purchase" on the desired capability
3. Confirm the transaction in your wallet

### Accessing Purchased Capabilities

1. Navigate to "My Capabilities"
2. Select the capability you want to use
3. Download as LangChain Tool or Eliza Plugin for integration with your AI agents

## Smart Contract

The `DataMarketplace` contract provides the following functionality:

- `listData`: List a new AI capability for sale
- `purchaseData`: Purchase a listed capability
- `hasPurchased`: Check if an address has purchased a specific capability
- `getListingDetails`: Get details about a listed capability
- `getDataAccessDetails`: Get access details for a purchased capability

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [zkSync](https://zksync.io/)
- [Avail](https://availproject.org/)
- [LangChain](https://langchain.com/)
- [Eliza Framework](https://eliza.com/)

![3](https://github.com/user-attachments/assets/48db8be6-f96d-463c-8fdd-a57ea1035530)
<img width="1512" alt="Screenshot 2025-02-25 at 6 48 37 PM" src="https://github.com/user-attachments/assets/e4b77c3a-6aa1-4bcd-9430-3156d49a2509" />



