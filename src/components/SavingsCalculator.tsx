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

// Automated times (from PDF measurements, in minutes)
const AUTO_KPO_MIN = 24.2 / 60;       // ~0.4 min
const AUTO_KEO_MIN = 24.2 / 60;       // ~0.4 min (same as KPO duplication)
const AUTO_DPR_MIN = 30 / 60;         // 0.5 min
const AUTO_REPORT_MIN = 30.25 / 60;   // ~0.5 min
const AUTO_BDO_REPORT_MIN = 35.22 / 60; // ~0.6 min (annual)

// Manual times (in minutes)
const MANUAL_KPO_MIN = 3;
const MANUAL_KEO_MIN = 4;
const MANUAL_DPR_MIN = 30;
const MANUAL_REPORT_MIN = 120;
const MANUAL_BDO_REPORT_MIN = 360; // total per year

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

function AnimatedNumber({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const duration = 400;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round((start + (end - start) * eased) * 10) / 10);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    prevRef.current = value;
  }, [value]);

  return <span>{prefix}{display.toLocaleString("pl-PL")}{suffix}</span>;
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
                  — szacujemy 2× liczbę KPO (~4 min manualnie / KEO).
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
              Szczegółowy podział oszczędności
            </h3>
            <div className="space-y-3">
              <BreakdownRow
                label="Przetwarzanie KPO"
                before={`${Math.round(calc.docTimeManual)} min`}
                after={`${Math.round(calc.docTimeAuto)} min`}
                percent={Math.round((1 - AUTO_KPO_MIN / MANUAL_KPO_MIN) * 100)}
              />
              <BreakdownRow
                label={`KEO (${calc.keo.toLocaleString("pl-PL")} szt.)`}
                before={`${Math.round(calc.keoTimeManual)} min`}
                after={`${Math.round(calc.keoTimeAuto)} min`}
                percent={Math.round((1 - AUTO_KEO_MIN / MANUAL_KEO_MIN) * 100)}
              />
              <BreakdownRow
                label="Wnioski DPR"
                before={`${Math.round(calc.dprTimeManual)} min`}
                after={`${Math.round(calc.dprTimeAuto)} min`}
                percent={Math.round((1 - AUTO_DPR_MIN / MANUAL_DPR_MIN) * 100)}
              />
              <BreakdownRow
                label="Tworzenie raportów"
                before={`${Math.round(calc.reportTimeManual / 60 * 10) / 10} h`}
                after={`${Math.round(calc.reportTimeAuto / 60 * 10) / 10} h`}
                percent={Math.round((1 - AUTO_REPORT_MIN / MANUAL_REPORT_MIN) * 100)}
              />
              {manualReport && (
                <BreakdownRow
                  label="Sprawozdanie roczne (mc)"
                  before={`${Math.round(MANUAL_BDO_REPORT_MIN / 12)} min`}
                  after={`${Math.round(AUTO_BDO_REPORT_MIN / 12 * 10) / 10} min`}
                  percent={Math.round((1 - AUTO_BDO_REPORT_MIN / MANUAL_BDO_REPORT_MIN) * 100)}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, before, after, percent }: { label: string; before: string; after: string; percent: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          <span className="line-through">{before}</span> → <span className="font-semibold text-primary">{after}</span>
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full gradient-primary rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
