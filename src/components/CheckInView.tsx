import { useState, type FormEvent } from "react";
import { CONTRACT_ID, EXPLORER_URL, NAME_MAX_LENGTH } from "../config";
import { describeError, shortenAddress, validateName } from "../lib/checkin";
import { checkIn } from "../lib/contract";
import { connectWallet, disconnectWallet, fundWithFriendbot, signTransaction } from "../lib/wallet";
import { useAttendees } from "../hooks/useAttendees";
import { AttendeeList } from "./AttendeeList";

type Status =
  | { kind: "idle" }
  | { kind: "busy"; label: string }
  | { kind: "success"; hash: string }
  | { kind: "error"; message: string };

export function CheckInView() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { attendees, loaded } = useAttendees(refreshKey);
  const [address, setAddress] = useState<string>();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const alreadyCheckedIn = attendees.some((a) => a.address === address);
  const busy = status.kind === "busy";

  async function run(label: string, action: () => Promise<void>) {
    setStatus({ kind: "busy", label });
    try {
      await action();
    } catch (error) {
      setStatus({ kind: "error", message: describeError(error) });
    }
  }

  const onConnect = () =>
    run("Connexion au wallet…", async () => {
      setAddress(await connectWallet());
      setStatus({ kind: "idle" });
    });

  const onDisconnect = async () => {
    await disconnectWallet();
    setAddress(undefined);
    setStatus({ kind: "idle" });
  };

  const onFund = (account: string) =>
    run("Demande de XLM de test…", async () => {
      try {
        await fundWithFriendbot(account);
      } catch {
        throw new Error("Friendbot a refusé : ton compte est probablement déjà financé.");
      }
      setStatus({ kind: "idle" });
    });

  const onSubmit = (event: FormEvent, account: string) => {
    event.preventDefault();
    const validation = validateName(name);
    if (!validation.ok) {
      setStatus({ kind: "error", message: validation.reason });
      return;
    }
    void run("Signe la transaction dans ton wallet…", async () => {
      const hash = await checkIn(account, validation.name, signTransaction);
      setStatus({ kind: "success", hash });
      setRefreshKey((key) => key + 1);
    });
  };

  return (
    <main className="layout">
      <section className="card">
        <p className="eyebrow">YOUR WAY 2026 · KS ESGI · Testnet</p>
        <h1>Check-in on-chain</h1>
        <p className="muted">
          Enregistre ta présence dans un smart contract Soroban. Ton wallet signe, la blockchain retient.
        </p>

        {address === undefined ? (
          <button className="primary" onClick={() => void onConnect()} disabled={busy}>
            Connecter mon wallet
          </button>
        ) : (
          <>
            <div className="wallet">
              <span>
                Connecté : <code>{shortenAddress(address)}</code>
              </span>
              <button className="link" onClick={() => void onDisconnect()}>
                Déconnecter
              </button>
            </div>

            {alreadyCheckedIn ? (
              <p className="done">✅ Tu es enregistré·e. Bienvenue !</p>
            ) : (
              <form onSubmit={(e) => onSubmit(e, address)}>
                <label htmlFor="name">Ton prénom</label>
                <input
                  id="name"
                  value={name}
                  maxLength={NAME_MAX_LENGTH}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada"
                  autoComplete="given-name"
                  disabled={busy}
                />
                <button className="primary" type="submit" disabled={busy}>
                  Je m'enregistre
                </button>
              </form>
            )}

            <button className="link" onClick={() => void onFund(address)} disabled={busy}>
              Obtenir des XLM de test (nouveau wallet)
            </button>
          </>
        )}

        {status.kind === "busy" && <p className="status">{status.label}</p>}
        {status.kind === "error" && <p className="status error">{status.message}</p>}
        {status.kind === "success" && (
          <p className="status ok">
            Transaction confirmée ·{" "}
            <a href={`${EXPLORER_URL}/tx/${status.hash}`} target="_blank" rel="noreferrer">
              voir sur l'explorer
            </a>
          </p>
        )}
      </section>

      <section className="card">
        <h2>
          Présents <span className="count">{loaded ? attendees.length : "…"}</span>
        </h2>
        <AttendeeList attendees={attendees} highlight={address} />
        <p className="footnote">
          Contrat{" "}
          <a href={`${EXPLORER_URL}/contract/${CONTRACT_ID}`} target="_blank" rel="noreferrer">
            {shortenAddress(CONTRACT_ID)}
          </a>
        </p>
      </section>
    </main>
  );
}
