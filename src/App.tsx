import { useEffect, useState } from "react";
import { CheckInView } from "./components/CheckInView";
import { ScreenView } from "./components/ScreenView";

const SCREEN_HASH = "#/screen";

export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return hash === SCREEN_HASH ? <ScreenView /> : <CheckInView />;
}
