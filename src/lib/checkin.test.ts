import { describe, expect, it } from "vitest";
import { NAME_MAX_LENGTH } from "../config";
import { describeError, shortenAddress, validateName } from "./checkin";

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

  it("returns a generic message otherwise", () => {
    expect(describeError(new Error("boom"))).toContain("Réessaie");
  });
});

describe("shortenAddress", () => {
  it("keeps the first and last four characters", () => {
    expect(shortenAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ")).toBe("GABC…WXYZ");
  });
});
