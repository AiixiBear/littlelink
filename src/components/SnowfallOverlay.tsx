import { useEffect, useState } from "react";
import Snowfall from "react-snowfall";

export default function SnowfallOverlay() {
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setMotionAllowed(!preference.matches);

    updateMotionPreference();
    preference.addEventListener("change", updateMotionPreference);
    return () => preference.removeEventListener("change", updateMotionPreference);
  }, []);

  if (!motionAllowed) return null;

  return (
    <div className="snowfall-overlay" aria-hidden="true">
      <Snowfall color="#b4cbd3" snowflakeCount={80} />
    </div>
  );
}
