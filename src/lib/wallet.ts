import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { Networks } from "@creit.tech/stellar-wallets-kit/types";
import { FRIENDBOT_URL, NETWORK_PASSPHRASE } from "../config";
import { errorMessage } from "./checkin";

const MODAL_CLOSED_PATTERN = /closed the modal/i;

StellarWalletsKit.init({ modules: defaultModules(), network: Networks.TESTNET });

/** Opens the wallet picker. Resolves to `undefined` if the user closes it. */
export async function connectWallet(): Promise<string | undefined> {
  try {
    const { address } = await StellarWalletsKit.authModal();
    return address;
  } catch (error) {
    if (MODAL_CLOSED_PATTERN.test(errorMessage(error))) return undefined;
    throw error;
  }
}

export function disconnectWallet(): Promise<void> {
  return StellarWalletsKit.disconnect();
}

/** Signs with the connected wallet, always on testnet. */
export function signTransaction(xdr: string, opts?: { address?: string }) {
  return StellarWalletsKit.signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: opts?.address,
  });
}

/** Creates and funds the account on testnet via Friendbot. Fails if it already exists. */
export async function fundWithFriendbot(address: string): Promise<void> {
  const response = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(address)}`);
  if (!response.ok) throw new Error(`Friendbot: ${response.status}`);
}
