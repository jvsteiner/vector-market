export const config = {
  serverUrl: process.env.VECTOR_SPHERE_SERVER || 'http://localhost:3001',
  walletPath: process.env.WALLET_PATH || `${process.env.HOME}/.vector-sphere-wallet.json`,
};
