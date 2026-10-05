import { Networks } from "@stellar/stellar-sdk";

/** Public address of the deployed `ks-checkin` contract (testnet). Not a secret. */
export const CONTRACT_ID = "CAPTO3FIZBPPIGJHUHY5UWUCAFHKOIJKJH3SYUM3MACL5UZSYNOYLR2F";
export const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const FRIENDBOT_URL = "https://friendbot.stellar.org";
export const EXPLORER_URL = "https://stellar.expert/explorer/testnet";

export const ATTENDEES_POLL_INTERVAL_MS = 5000;
export const NAME_MAX_LENGTH = 32;
export const TX_TIMEOUT_SECONDS = 60;
export const DEFAULT_SEND_AMOUNT = "1";
