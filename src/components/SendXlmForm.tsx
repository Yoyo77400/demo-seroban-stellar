import { useState, type FormEvent } from "react";
import { DEFAULT_SEND_AMOUNT } from "../config";
import { shortenAddress } from "../lib/checkin";
import type { Attendee } from "../lib/contract";

type Props = {
  recipients: Attendee[];
  disabled: boolean;
  onSend: (destination: string, amount: string) => void;
};

/** Lets the connected wallet pay test XLM to another checked-in attendee. */
export function SendXlmForm({ recipients, disabled, onSend }: Props) {
  const [selected, setSelected] = useState("");
  const [amount, setAmount] = useState(DEFAULT_SEND_AMOUNT);

  // The list is polled: fall back to the first recipient until the user picks one.
  const destination = recipients.some((r) => r.address === selected) ? selected : recipients[0]?.address;

  if (destination === undefined) {
    return <p className="muted">Dès qu'un·e autre participant·e s'enregistre, tu pourras lui envoyer des XLM.</p>;
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSend(destination, amount);
  };

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="recipient">Envoyer des XLM de test à</label>
      <select id="recipient" value={destination} onChange={(e) => setSelected(e.target.value)} disabled={disabled}>
        {recipients.map(({ address, name }) => (
          <option key={address} value={address}>
            {name} · {shortenAddress(address)}
          </option>
        ))}
      </select>
      <label htmlFor="amount">Montant (XLM)</label>
      <input
        id="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
      />
      <button className="primary" type="submit" disabled={disabled}>
        Envoyer
      </button>
    </form>
  );
}
