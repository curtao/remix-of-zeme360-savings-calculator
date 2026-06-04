import { useEffect, useState } from "react";
import SavingsCalculator from "./SavingsCalculator";
import MobileCalculator from "../pages/MobileCalculator";

export default function ResponsiveCalculator() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 991);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return isMobile ? <MobileCalculator /> : <SavingsCalculator />;
}
