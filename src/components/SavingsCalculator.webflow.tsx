import { declareComponent } from "@webflow/react";
import ResponsiveCalculator from "./ResponsiveCalculator";

export default declareComponent(ResponsiveCalculator, {
  name: "ZEME 360 Kalkulator Oszczędności",
  description: "Interaktywny kalkulator oszczędności czasu i pieniędzy z automatyzacji BDO.",
  group: "ZEME 360",
  options: {
    applyTagSelectors: true,
  },
});
