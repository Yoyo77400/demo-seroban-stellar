import { QRCodeSVG } from "qrcode.react";
import { useAttendees } from "../hooks/useAttendees";
import { AttendeeList } from "./AttendeeList";

const QR_SIZE_PX = 320;

/** Projector view: QR code to the check-in page and the live attendee list. */
export function ScreenView() {
  const { attendees, loaded } = useAttendees();
  const checkInUrl = `${window.location.origin}${window.location.pathname}`;

  return (
    <main className="screen">
      <section className="screen-qr">
        <p className="eyebrow">FIND YOUR WAY → HACKMERIDIAN</p>
        <h1>Ouvre le lien, connecte ton wallet, enregistre-toi.</h1>
        <div className="qr">
          <QRCodeSVG value={checkInUrl} size={QR_SIZE_PX} marginSize={2} />
        </div>
        <p className="url">{checkInUrl}</p>
      </section>
      <section className="screen-list">
        <p className="big-count">{loaded ? attendees.length : "…"}</p>
        <p className="muted">présents on-chain · Stellar testnet</p>
        <AttendeeList attendees={attendees} />
      </section>
    </main>
  );
}
