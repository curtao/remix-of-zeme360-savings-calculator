import { useEffect } from "react";

export interface CalculatorData {
  source: "desktop" | "mobile";
  inputs: {
    docs?: number;
    dpr?: number;
    reports?: number;
    rate?: number;
    manualReport?: boolean;
  };
  results: {
    keo?: number;
    monthlySavings?: number;
    annualSavings?: number;
    totalTimeSavedHours?: number;
    efficiencyPercent?: number;
    roiMonths?: number;
  };
}

export function useCalculatorEmit(data: CalculatorData) {
  useEffect(() => {
    console.group(`🧮 ZEME 360 [${data.source}]`);
    console.log("📥 Inputs:");
    Object.entries(data.inputs).forEach(([k, v]) => {
      if (v !== undefined) console.log(`  ${k}:`, v);
    });
    console.log("📊 Results:");
    Object.entries(data.results).forEach(([k, v]) => {
      if (v !== undefined) console.log(`  ${k}:`, v);
    });
    console.groupEnd();

    window.dispatchEvent(new CustomEvent("zeme360:update", { detail: data }));
  }, [
    data.inputs.docs,
    data.inputs.dpr,
    data.inputs.reports,
    data.inputs.rate,
    data.inputs.manualReport,
  ]);
}
