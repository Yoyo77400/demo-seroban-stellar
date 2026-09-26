import { shortenAddress } from "../lib/checkin";
import type { Attendee } from "../lib/contract";

type Props = { attendees: Attendee[]; highlight?: string };

/** Most recent check-ins first. */
export function AttendeeList({ attendees, highlight }: Props) {
  if (attendees.length === 0) {
    return <p className="muted">Personne pour l'instant. Sois le premier !</p>;
  }
  return (
    <ol className="attendees" reversed>
      {[...attendees].reverse().map(({ address, name }) => (
        <li key={address} className={address === highlight ? "me" : undefined}>
          <span className="name">{name}</span>
          <code>{shortenAddress(address)}</code>
        </li>
      ))}
    </ol>
  );
}
