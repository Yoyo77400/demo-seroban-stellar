import { useEffect, useState } from "react";
import { ATTENDEES_POLL_INTERVAL_MS } from "../config";
import { fetchAttendees, type Attendee } from "../lib/contract";

/** Polls the on-chain attendee list. Bump `refreshKey` to force an immediate reload. */
export function useAttendees(refreshKey = 0) {
  const [attendees, setAttendees] = useState<Attendee[]>();

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchAttendees().then((list) => {
        if (!cancelled) setAttendees(list);
      });

    void load();
    const timer = setInterval(() => void load(), ATTENDEES_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [refreshKey]);

  return { attendees: attendees ?? [], loaded: attendees !== undefined };
}
