import { walletExists, createWallet, loadWallet } from '../lib/wallet.js';

const command = process.argv[2];

switch (command) {
  case 'init': {
    if (walletExists()) {
      console.log('Wallet already exists. Delete it first to create a new one.');
      process.exit(1);
    }
    const wallet = createWallet();
    console.log('Wallet initialized!');
    console.log('Public key:', wallet.publicKey);
    console.log('\nKeep your wallet file safe:', process.env.HOME + '/.vector-sphere-wallet.json');
    break;
  }

  case 'show': {
    const wallet = loadWallet();
    console.log('Public key:', wallet.publicKey);
    break;
  }

  default:
    console.log('Usage: npx tsx scripts/wallet.ts <init|show>');
    process.exit(1);
}
