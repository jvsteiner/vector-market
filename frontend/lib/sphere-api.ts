/**
 * Sphere Extension API types and helpers.
 *
 * This module provides TypeScript types for the window.sphere API
 * injected by the Sphere browser extension.
 */

// ALPHA token coin ID (matches sphere-extension constants)
export const ALPHA_COIN_ID = "0x0000000000000000000000000000000000000000000000000000000000000001";

/**
 * Identity information returned by the Sphere extension.
 */
export interface IdentityInfo {
  id: string;
  publicKey: string;
  label: string;
}

/**
 * Token balance information.
 */
export interface TokenBalance {
  coinId: string;
  symbol: string;
  amount: string;
  decimals: number;
}

/**
 * Parameters for sending tokens.
 */
export interface SendTokensParams {
  recipient: string;
  coinId: string;
  amount: string;
  message?: string;
}

/**
 * Result of a token send operation.
 */
export interface SendTokensResult {
  transactionId: string;
}

/**
 * NOSTR public key in both hex and npub formats.
 */
export interface NostrPublicKey {
  hex: string;
  npub: string;
}

/**
 * The Sphere API interface exposed by the browser extension.
 */
export interface SphereAPI {
  /** Check if the extension is installed (always true if API exists) */
  isInstalled(): boolean;

  /** Request connection to the wallet - opens popup for approval */
  connect(): Promise<IdentityInfo>;

  /** Disconnect from the wallet */
  disconnect(): Promise<void>;

  /** Get the currently active identity, or null if not connected */
  getActiveIdentity(): Promise<IdentityInfo | null>;

  /** Get all token balances for the active identity */
  getBalances(): Promise<TokenBalance[]>;

  /** Send tokens - opens popup for approval */
  sendTokens(params: SendTokensParams): Promise<SendTokensResult>;

  /** Sign an arbitrary message - opens popup for approval */
  signMessage(message: string): Promise<string>;

  /** Get the NOSTR public key for the active identity */
  getNostrPublicKey(): Promise<NostrPublicKey>;

  /** Sign a NOSTR event hash - opens popup for approval */
  signNostrEvent(eventHash: string): Promise<string>;
}

// Extend the Window interface
declare global {
  interface Window {
    sphere?: SphereAPI;
  }
}

/**
 * Wait for the Sphere extension to be ready.
 * Returns true if the extension is available, false if timeout.
 *
 * @param timeout - Maximum time to wait in milliseconds (default: 2000)
 */
export function waitForSphere(timeout = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    // Already available
    if (window.sphere) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('sphereReady', handler);
      resolve(false);
    }, timeout);

    const handler = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };

    window.addEventListener('sphereReady', handler, { once: true });
  });
}

/**
 * Get the Sphere API instance if available.
 */
export function getSphere(): SphereAPI | null {
  return window.sphere ?? null;
}

/**
 * Check if the Sphere extension is installed.
 * This is a quick synchronous check.
 */
export function isSphereInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.sphere;
}
