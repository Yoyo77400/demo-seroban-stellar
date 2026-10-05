import { Asset, BASE_FEE, Operation, TransactionBuilder, rpc } from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASE, RPC_URL, TX_TIMEOUT_SECONDS } from "../config";

type SignTransaction = (xdr: string, opts?: { address?: string }) => Promise<{ signedTxXdr: string }>;

const server = new rpc.Server(RPC_URL);

/**
 * Sends `amount` XLM from `source` to `destination` with a classic payment operation.
 * The destination account must already exist, which holds for any checked-in attendee.
 *
 * @returns the transaction hash
 */
export async function sendXlm(
  source: string,
  destination: string,
  amount: string,
  signTransaction: SignTransaction,
): Promise<string> {
  const account = await server.getAccount(source);
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(Operation.payment({ destination, asset: Asset.native(), amount }))
    .setTimeout(TX_TIMEOUT_SECONDS)
    .build();

  const { signedTxXdr } = await signTransaction(tx.toXDR(), { address: source });
  const sent = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE));
  if (sent.status === "ERROR") {
    throw new Error(`Transaction rejected: ${JSON.stringify(sent.errorResult?.result)}`);
  }

  const result = await server.pollTransaction(sent.hash);
  if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
    // e.g. {"tx_failed":[{"op_inner":{"payment":"underfunded"}}]}
    throw new Error(`Payment failed: ${JSON.stringify(result.resultXdr.result)}`);
  }
  if (result.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error("Transaction not confirmed in time");
  }
  return sent.hash;
}
