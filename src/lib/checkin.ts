import { NAME_MAX_LENGTH } from "../config";

/** Contract error codes, mirroring `Error` in contracts/ks-checkin/src/lib.rs. */
export const CONTRACT_ERRORS: Record<number, string> = {
  1: "Cette adresse est déjà enregistrée.",
};

const CONTRACT_ERROR_PATTERN = /Error\(Contract, #(\d+)\)/;
const ACCOUNT_NOT_FOUND_PATTERN = /account not found|does not exist/i;
const USER_REJECTED_PATTERN = /reject|declin|cancel/i;

export type NameValidation = { ok: true; name: string } | { ok: false; reason: string };

/**
 * Normalizes and validates an attendee name before it is sent on-chain.
 *
 * @example validateName("  Ada  ") // { ok: true, name: "Ada" }
 */
export function validateName(raw: string): NameValidation {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length === 0) return { ok: false, reason: "Indique ton prénom." };
  if (name.length > NAME_MAX_LENGTH) {
    return { ok: false, reason: `${NAME_MAX_LENGTH} caractères maximum.` };
  }
  return { ok: true, name };
}

/**
 * Turns an error thrown by the SDK or the wallet into a French message for attendees.
 *
 * @example describeError(new Error("HostError: Error(Contract, #1)")) // "Cette adresse est déjà enregistrée."
 */
export function describeError(error: unknown): string {
  const message = errorMessage(error);

  const contractCode = CONTRACT_ERROR_PATTERN.exec(message)?.[1];
  if (contractCode !== undefined) {
    return CONTRACT_ERRORS[Number(contractCode)] ?? `Erreur du contrat #${contractCode}.`;
  }
  if (ACCOUNT_NOT_FOUND_PATTERN.test(message)) {
    return "Ton compte testnet n'existe pas encore : clique sur « Obtenir des XLM de test ».";
  }
  if (USER_REJECTED_PATTERN.test(message)) return "Signature annulée dans le wallet.";
  return "Une erreur est survenue. Réessaie dans quelques secondes.";
}

/** The wallets kit throws plain `{ code, message }` objects, the SDK throws `Error`s. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return String(error);
}

/**
 * Shortens a Stellar address for display.
 *
 * @example shortenAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ") // "GABC…WXYZ"
 */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
