import { useState, useMemo, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Clock, TrendingUp, PiggyBank, Zap, FileText, BarChart3, ShieldCheck, CalendarDays, Info } from "lucide-react";

const EXAMPLE_DOCS = 500;
const EXAMPLE_DPR = 5;
const EXAMPLE_REPORTS = 10;
const EXAMPLE_RATE = 150;
const EXAMPLE_MANUAL_REPORT = true;

const MONTHLY_COST = 500;

// Automated times in Z360 (in minutes)
const AUTO_KPO_MIN = 23 / 60;         // 23s — powielanie KPO
const AUTO_KEO_MIN = 0;               // KEO w pełni automatyczne
const AUTO_DPR_MIN = 15 / 60;         // 15s
const AUTO_REPORT_MIN = 22 / 60;      // 22s — raport per MPD
const AUTO_BDO_REPORT_MIN = 17 / 60;  // 17s — sprawozdanie roczne

// Manual times in BDO (in minutes) — średnie wartości z zakresów
const MANUAL_KPO_MIN = 7.5;           // 5-10 min
const MANUAL_KEO_MIN = 2;             // 1-3 min
const MANUAL_DPR_MIN = 60;            // 5 min – kilka godzin (śr. ~1h)
const MANUAL_REPORT_MIN = 90;         // kilkanaście min – kilka godzin (śr. 1.5h)
const MANUAL_BDO_REPORT_MIN = 720;    // kilka godzin – 1-2 dni robocze (śr. 1.5 dnia × 8h)

function useCalculations(docs: number, dpr: number, reports: number, rate: number, manualReport: boolean) {
  return useMemo(() => {
    const keo = docs * 2; // KEO = 2x KPO

    const docTimeManual = docs * MANUAL_KPO_MIN;
    const docTimeAuto = docs * AUTO_KPO_MIN;
    const docTimeSaved = docTimeManual - docTimeAuto;

    const keoTimeManual = keo * MANUAL_KEO_MIN;
    const keoTimeAuto = keo * AUTO_KEO_MIN;
    const keoTimeSaved = keoTimeManual - keoTimeAuto;

    const dprTimeManual = dpr * MANUAL_DPR_MIN;
    const dprTimeAuto = dpr * AUTO_DPR_MIN;
    const dprTimeSaved = dprTimeManual - dprTimeAuto;

    const reportTimeManual = reports * MANUAL_REPORT_MIN;
    const reportTimeAuto = reports * AUTO_REPORT_MIN;
    const reportTimeSaved = reportTimeManual - reportTimeAuto;

    // Annual BDO report - spread over 12 months
    const annualReportTimeSavedTotal = manualReport ? (MANUAL_BDO_REPORT_MIN - AUTO_BDO_REPORT_MIN) : 0;
    const annualReportMonthlySaved = annualReportTimeSavedTotal / 12;

    const totalTimeSavedMin = docTimeSaved + keoTimeSaved + dprTimeSaved + reportTimeSaved + annualReportMonthlySaved;
    const totalTimeSavedHours = totalTimeSavedMin / 60;
    const totalTimeSavedDays = totalTimeSavedHours / 8;

    const monthlySavings = totalTimeSavedHours * rate;
    const annualSavings = monthlySavings * 12;

    const totalManualMin = docTimeManual + keoTimeManual + dprTimeManual + reportTimeManual + (manualReport ? MANUAL_BDO_REPORT_MIN / 12 : 0);
    const efficiencyPercent = totalManualMin > 0 ? Math.round((totalTimeSavedMin / totalManualMin) * 100) : 0;

    const roiMonths = monthlySavings > 0 ? Math.max(1, Math.ceil(MONTHLY_COST / monthlySavings)) : Infinity;

    const bdoOnlyTimeSaved = annualReportMonthlySaved;
    const bdoOnlyMonthlySavings = (bdoOnlyTimeSaved / 60) * rate;

    return {
      keo,
      totalTimeSavedHours: Math.round(totalTimeSavedHours * 10) / 10,
      totalTimeSavedDays: Math.round(totalTimeSavedDays * 10) / 10,
      monthlySavings: Math.round(monthlySavings),
      annualSavings: Math.round(annualSavings),
      efficiencyPercent,
      roiMonths,
      bdoOnlyTimeSaved: Math.round((bdoOnlyTimeSaved / 60) * 10) / 10,
      bdoOnlyMonthlySavings: Math.round(bdoOnlyMonthlySavings),
      docTimeManual,
      docTimeAuto,
      keoTimeManual,
      keoTimeAuto,
      dprTimeManual,
      dprTimeAuto,
      reportTimeManual,
      reportTimeAuto,
    };
  }, [docs, dpr, reports, rate, manualReport]);
}

function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 600,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutQuart for snappier, smoother feel
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      prevRef.current = display;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = display.toLocaleString("pl-PL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span className="tabular-nums">{prefix}{formatted}{suffix}</span>;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sublabel?: string;
  variant?: "default" | "gradient" | "accent";
}

function MetricCard({ icon, label, value, sublabel, variant = "default" }: MetricCardProps) {
  const bgClass = variant === "gradient"
    ? "gradient-primary text-primary-foreground"
    : variant === "accent"
    ? "bg-accent text-accent-foreground"
    : "bg-card border border-border";

  return (
    <div className={`rounded-lg p-5 ${bgClass} transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-md ${variant === "default" ? "bg-secondary" : "bg-primary-foreground/20"}`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${variant === "default" ? "text-muted-foreground" : ""}`}>{label}</span>
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sublabel && <p className={`text-xs mt-1 ${variant === "default" ? "text-muted-foreground" : "opacity-80"}`}>{sublabel}</p>}
    </div>
  );
}

interface SliderWithInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}

function SliderWithInput({ label, value, min, max, step, unit, onChange }: SliderWithInputProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-3">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!isNaN(n)) onChange(clamp(n));
            }}
            className="h-8 w-24 text-right text-base font-bold text-primary px-2"
          />
          {unit && <span className="text-sm font-bold text-primary">{unit}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min.toLocaleString("pl-PL")}{unit ? ` ${unit}` : ""}</span>
        <span>{max.toLocaleString("pl-PL")}{unit ? ` ${unit}` : ""}</span>
      </div>
    </div>
  );
}

export default function SavingsCalculator() {
  const [isExample, setIsExample] = useState(true);
  const [docs, setDocs] = useState(EXAMPLE_DOCS);
  const [dpr, setDpr] = useState(EXAMPLE_DPR);
  const [reports, setReports] = useState(EXAMPLE_REPORTS);
  const [rate, setRate] = useState(EXAMPLE_RATE);
  const [manualReport, setManualReport] = useState(EXAMPLE_MANUAL_REPORT);

  const calc = useCalculations(docs, dpr, reports, rate, manualReport);

  const handleInteraction = () => {
    if (isExample) setIsExample(false);
  };

  const wrap = (setter: (n: number) => void) => (v: number) => { setter(v); handleInteraction(); };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Kalkulator oszczędności{" "}
          <span className="text-gradient-primary">ZEME360</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sprawdź, ile czasu i pieniędzy możesz zaoszczędzić dzięki automatyzacji BDO, KEO i sprawozdań środowiskowych.
        </p>
        {isExample && (
          <div className="mt-4 inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="w-4 h-4" />
            Przykładowe dane — zacznij wypełniać, aby zobaczyć swoje oszczędności
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-8">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Twoje parametry
            </h2>

            <div className="space-y-2">
              <SliderWithInput
                label="KPO miesięcznie"
                value={docs}
                min={1}
                max={20000}
                step={1}
                onChange={wrap(setDocs)}
              />
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-md px-3 py-2">
                <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>
                  KEO miesięcznie (automatycznie):{" "}
                  <span className="font-semibold text-primary">{calc.keo.toLocaleString("pl-PL")}</span>{" "}
                  — szacujemy 2× liczbę KPO (~1–3 min manualnie / 0 s w Z360).
                </span>
              </div>
            </div>

            <SliderWithInput
              label="Wnioski DPR miesięcznie"
              value={dpr}
              min={1}
              max={50}
              step={1}
              onChange={wrap(setDpr)}
            />

            <SliderWithInput
              label="Raporty miesięcznie"
              value={reports}
              min={1}
              max={500}
              step={1}
              onChange={wrap(setReports)}
            />

            <SliderWithInput
              label="Koszt godziny pracy"
              value={rate}
              min={50}
              max={500}
              step={10}
              unit="zł"
              onChange={wrap(setRate)}
            />

            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="manual-report"
                checked={manualReport}
                onCheckedChange={(v) => { setManualReport(!!v); handleInteraction(); }}
                className="mt-0.5"
              />
              <label htmlFor="manual-report" className="text-sm leading-snug cursor-pointer">
                Sprawozdanie roczne przygotowuję manualnie
              </label>
            </div>
          </div>

          {manualReport && (
            <div className="rounded-xl border-2 border-zeme-yellow bg-zeme-yellow/10 p-5">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zeme-yellow" />
                Dodatkowe oszczędności z automatyzacji BDO
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Automatyczne sprawozdanie roczne oszczędza dodatkowy czas i pieniądze.
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Czas / mc</p>
                  <p className="text-lg font-bold">{calc.bdoOnlyTimeSaved} h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Oszczędność / mc</p>
                  <p className="text-lg font-bold">{calc.bdoOnlyMonthlySavings} zł</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="gradient-primary rounded-xl p-6 text-primary-foreground">
            <p className="text-sm font-medium opacity-90 mb-1">Twoje miesięczne oszczędności</p>
            <div className="flex flex-wrap items-baseline gap-4">
              <span className="text-4xl md:text-5xl font-extrabold">
                <AnimatedNumber value={calc.monthlySavings} suffix=" zł" />
              </span>
              <span className="text-lg opacity-80">
                / <AnimatedNumber value={calc.totalTimeSavedHours} suffix=" h" />
              </span>
            </div>
            <p className="text-sm opacity-80 mt-2">
              rocznie: <AnimatedNumber value={calc.annualSavings} prefix="" suffix=" zł" />
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <MetricCard
              icon={<Clock className="w-4 h-4 text-primary" />}
              label="Oszczędność czasu"
              value={<><AnimatedNumber value={calc.totalTimeSavedHours} suffix=" h" /> <span className="text-base font-normal text-muted-foreground">/ mc</span></>}
              sublabel={`≈ ${calc.totalTimeSavedDays} dni roboczych`}
            />
            <MetricCard
              icon={<PiggyBank className="w-4 h-4 text-primary" />}
              label="Oszczędność finansowa"
              value={<AnimatedNumber value={calc.monthlySavings} suffix=" zł" prefix="" />}
              sublabel={`Rocznie: ${calc.annualSavings.toLocaleString("pl-PL")} zł`}
            />
            <MetricCard
              icon={<TrendingUp className="w-4 h-4 text-primary" />}
              label="Efektywność"
              value={<AnimatedNumber value={calc.efficiencyPercent} suffix="%" />}
              sublabel="Redukcja pracy manualnej"
            />
            <MetricCard
              icon={<CalendarDays className="w-4 h-4 text-primary" />}
              label="Zwrot z inwestycji (ROI)"
              value={
                calc.roiMonths === Infinity
                  ? "—"
                  : <><AnimatedNumber value={calc.roiMonths} /> <span className="text-base font-normal">mc</span></>
              }
              sublabel="System zwróci się w tym czasie"
            />
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Szczegółowy podział oszczędzonego czasu
            </h3>
            {(() => {
              const kpoSaved = calc.docTimeManual - calc.docTimeAuto;
              const keoSaved = calc.keoTimeManual - calc.keoTimeAuto;
              const dprSaved = calc.dprTimeManual - calc.dprTimeAuto;
              const reportSaved = calc.reportTimeManual - calc.reportTimeAuto;
              const bdoSaved = manualReport ? (MANUAL_BDO_REPORT_MIN - AUTO_BDO_REPORT_MIN) / 12 : 0;
              const maxSaved = Math.max(kpoSaved, keoSaved, dprSaved, reportSaved, bdoSaved, 1);
              const pct = (v: number) => Math.round((v / maxSaved) * 100);
              return (
                <div className="space-y-3">
                  <BreakdownRow
                    label="Przetwarzanie KPO"
                    beforeValue={calc.docTimeManual}
                    afterValue={calc.docTimeAuto}
                    unit="min"
                    decimals={1}
                    percent={pct(kpoSaved)}
                  />
                  <BreakdownRow
                    label={`KEO (${calc.keo.toLocaleString("pl-PL")} szt.)`}
                    beforeValue={calc.keoTimeManual}
                    afterValue={calc.keoTimeAuto}
                    unit="min"
                    decimals={0}
                    percent={pct(keoSaved)}
                    afterLabel="automatycznie"
                  />
                  <BreakdownRow
                    label="Wnioski DPR"
                    beforeValue={calc.dprTimeManual}
                    afterValue={calc.dprTimeAuto}
                    unit="min"
                    decimals={1}
                    percent={pct(dprSaved)}
                  />
                  <BreakdownRow
                    label="Tworzenie raportów"
                    beforeValue={calc.reportTimeManual / 60}
                    afterValue={calc.reportTimeAuto / 60}
                    unit="h"
                    decimals={1}
                    percent={pct(reportSaved)}
                  />
                  {manualReport && (
                    <BreakdownRow
                      label="Sprawozdanie roczne (mc)"
                      beforeValue={MANUAL_BDO_REPORT_MIN / 12}
                      afterValue={AUTO_BDO_REPORT_MIN / 12}
                      unit="min"
                      decimals={1}
                      percent={pct(bdoSaved)}
                      afterLabel="automatycznie"
                    />
                  )}
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  beforeValue,
  afterValue,
  unit,
  percent,
  decimals = 0,
  afterLabel,
}: {
  label: string;
  beforeValue: number;
  afterValue: number;
  unit: string;
  percent: number;
  decimals?: number;
  afterLabel?: string;
}) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline text-sm gap-2">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          <span className="line-through">
            <AnimatedNumber value={beforeValue} decimals={decimals} suffix={` ${unit}`} />
          </span>{" "}
          →{" "}
          <span className="font-semibold text-primary">
            {afterLabel ? afterLabel : <AnimatedNumber value={afterValue} decimals={decimals} suffix={` ${unit}`} />}
          </span>
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full gradient-primary rounded-full"
          style={{
            width: `${clampedPercent}%`,
            transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
    </div>
  );
}

