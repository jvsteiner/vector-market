import * as fs from 'fs';
import { secp256k1 } from '@noble/curves/secp256k1';
import { bytesToHex, randomBytes } from '@noble/hashes/utils';
import { config } from './config.js';

interface WalletData {
  privateKey: string;
  publicKey: string;
}

export function walletExists(): boolean {
  return fs.existsSync(config.walletPath);
}

export function createWallet(): WalletData {
  const privateKeyBytes = randomBytes(32);
  const privateKey = bytesToHex(privateKeyBytes);
  const publicKey = bytesToHex(secp256k1.getPublicKey(privateKeyBytes, true));

  const data: WalletData = { privateKey, publicKey };
  fs.writeFileSync(config.walletPath, JSON.stringify(data, null, 2));
  console.log('Wallet created at:', config.walletPath);

  return data;
}

export function loadWallet(): WalletData {
  if (!walletExists()) {
    throw new Error(`No wallet found. Run: npx tsx scripts/wallet.ts init`);
  }
  const data = JSON.parse(fs.readFileSync(config.walletPath, 'utf-8'));
  return data;
}

export function getPrivateKeyHex(): string {
  return loadWallet().privateKey;
}

export function getPublicKeyHex(): string {
  return loadWallet().publicKey;
}
