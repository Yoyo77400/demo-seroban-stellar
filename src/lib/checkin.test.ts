import { describe, expect, it } from "vitest";
import { NAME_MAX_LENGTH } from "../config";
import { describeError, shortenAddress, validateAmount, validateName } from "./checkin";

describe("validateName", () => {
  it("trims and collapses whitespace", () => {
    expect(validateName("  Ada   Lovelace ")).toEqual({ ok: true, name: "Ada Lovelace" });
  });

  it("rejects an empty name", () => {
    expect(validateName("   ").ok).toBe(false);
  });

  it("rejects a name longer than the limit", () => {
    expect(validateName("a".repeat(NAME_MAX_LENGTH + 1)).ok).toBe(false);
  });

  it("accepts a name at the limit", () => {
    expect(validateName("a".repeat(NAME_MAX_LENGTH)).ok).toBe(true);
  });
});

describe("validateAmount", () => {
  it("trims and accepts a decimal comma", () => {
    expect(validateAmount(" 1,5 ")).toEqual({ ok: true, amount: "1.5" });
  });

  it("accepts seven decimal places", () => {
    expect(validateAmount("0.0000001").ok).toBe(true);
  });

  it("rejects more than seven decimal places", () => {
    expect(validateAmount("0.00000001").ok).toBe(false);
  });

  it("rejects zero, negative and non-numeric amounts", () => {
    expect(validateAmount("0").ok).toBe(false);
    expect(validateAmount("-1").ok).toBe(false);
    expect(validateAmount("abc").ok).toBe(false);
  });
});

describe("describeError", () => {
  it("maps the duplicate check-in contract error", () => {
    expect(describeError(new Error("HostError: Error(Contract, #1)"))).toBe(
      "Cette adresse est déjà enregistrée.",
    );
  });

  it("falls back on unknown contract error codes", () => {
    expect(describeError(new Error("Error(Contract, #42)"))).toBe("Erreur du contrat #42.");
  });

  it("detects an unfunded testnet account", () => {
    expect(describeError(new Error("Account not found: GABC"))).toContain("XLM de test");
  });

  it("detects a rejected signature", () => {
    expect(describeError("User rejected the request")).toBe("Signature annulée dans le wallet.");
  });

  it("reads the message of a wallets kit error object", () => {
    expect(describeError({ code: -3, message: "User declined access" })).toBe(
      "Signature annulée dans le wallet.",
    );
  });

  it("detects an underfunded payment", () => {
    expect(describeError(new Error('Payment failed: {"tx_failed":[{"op_inner":{"payment":"underfunded"}}]}'))).toBe(
      "Solde insuffisant pour cet envoi.",
    );
  });

  it("returns a generic message otherwise", () => {
    expect(describeError(new Error("boom"))).toContain("Réessaie");
  });
});

describe("shortenAddress", () => {
  it("keeps the first and last four characters", () => {
    expect(shortenAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ")).toBe("GABC…WXYZ");
  });
});
