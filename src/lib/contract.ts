import { contract } from "@stellar/stellar-sdk";
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from "../config";

export type Attendee = { address: string; name: string };

/** Typed view of the `ks-checkin` contract interface (see contracts/ks-checkin/src/lib.rs). */
type KsCheckinClient = contract.Client & {
  count: () => Promise<contract.AssembledTransaction<number>>;
  attendees: () => Promise<contract.AssembledTransaction<Array<[string, string]>>>;
  check_in: (args: { attendee: string; name: string }) => Promise<contract.AssembledTransaction<null>>;
};

function createClient(options: Partial<contract.ClientOptions> = {}): Promise<KsCheckinClient> {
  return contract.Client.from<KsCheckinClient>({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    ...options,
  }) as Promise<KsCheckinClient>;
}

let readClient: Promise<KsCheckinClient> | undefined;

/** Reads the attendee list through a simulation: no wallet, no fee. */
export async function fetchAttendees(): Promise<Attendee[]> {
  readClient ??= createClient();
  const tx = await (await readClient).attendees();
  return tx.result.map(([address, name]) => ({ address, name }));
}

/**
 * Checks `attendee` in on-chain. The wallet signs the transaction, which also
 * satisfies the contract's `attendee.require_auth()`.
 *
 * @returns the transaction hash
 */
export async function checkIn(
  attendee: string,
  name: string,
  signTransaction: contract.ClientOptions["signTransaction"],
): Promise<string> {
  const client = await createClient({ publicKey: attendee, signTransaction });
  const tx = await client.check_in({ attendee, name });
  const sent = await tx.signAndSend();
  return sent.sendTransactionResponse?.hash ?? "";
}
