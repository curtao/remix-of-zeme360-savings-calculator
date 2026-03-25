import { useState, useMemo, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, TrendingUp, PiggyBank, Zap, FileText, BarChart3, ShieldCheck, CalendarDays } from "lucide-react";

const EXAMPLE_DOCS = 500;
const EXAMPLE_REPORTS = 10;
const EXAMPLE_RATE = 150;
const EXAMPLE_MANUAL_REPORT = true;

// Monthly subscription cost for ROI
const MONTHLY_COST = 500;

function useCalculations(docs: number, reports: number, rate: number, manualReport: boolean) {
  return useMemo(() => {
    // Document processing: 3 min manual → 0.2 min automated (per doc)
    const docTimeManual = docs * 3; // minutes
    const docTimeAuto = docs * 0.2;
    const docTimeSaved = docTimeManual - docTimeAuto; // minutes

    // Report creation: 2h manual → 10 min automated (per report)
    const reportTimeManual = reports * 120; // minutes
    const reportTimeAuto = reports * 10;
    const reportTimeSaved = reportTimeManual - reportTimeAuto;

    // Validation: 5 min per report → 0 min (100% auto)
    const validationTimeSaved = reports * 5; // minutes

    // Annual report: spread over 12 months
    // Categorizing 100 docs: 3h → 15min, preparing report: 2h → 1min, checking: 1h → 0
    const annualReportTimeSavedTotal = manualReport ? (180 + 120 + 60) - (15 + 1 + 0) : 0; // minutes
    const annualReportMonthlySaved = annualReportTimeSavedTotal / 12; // minutes/month

    const totalTimeSavedMin = docTimeSaved + reportTimeSaved + validationTimeSaved + annualReportMonthlySaved;
    const totalTimeSavedHours = totalTimeSavedMin / 60;
    const totalTimeSavedDays = totalTimeSavedHours / 8;

    const monthlySavings = totalTimeSavedHours * rate;
    const annualSavings = monthlySavings * 12;

    // Efficiency %
    const totalManualMin = docTimeManual + reportTimeManual + (reports * 5) + (manualReport ? 360 / 12 : 0);
    const efficiencyPercent = totalManualMin > 0 ? Math.round((totalTimeSavedMin / totalManualMin) * 100) : 0;

    // ROI months
    const roiMonths = monthlySavings > 0 ? Math.max(1, Math.ceil(MONTHLY_COST / monthlySavings)) : Infinity;

    // BDO-only savings (when manual report checked)
    const bdoOnlyTimeSaved = annualReportMonthlySaved;
    const bdoOnlyMonthlySavings = (bdoOnlyTimeSaved / 60) * rate;

    return {
      totalTimeSavedHours: Math.round(totalTimeSavedHours * 10) / 10,
      totalTimeSavedDays: Math.round(totalTimeSavedDays * 10) / 10,
      monthlySavings: Math.round(monthlySavings),
      annualSavings: Math.round(annualSavings),
      efficiencyPercent,
      roiMonths,
      bdoOnlyTimeSaved: Math.round((bdoOnlyTimeSaved / 60) * 10) / 10,
      bdoOnlyMonthlySavings: Math.round(bdoOnlyMonthlySavings),
    };
  }, [docs, reports, rate, manualReport]);
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

export default function SavingsCalculator() {
  const [isExample, setIsExample] = useState(true);
  const [docs, setDocs] = useState(EXAMPLE_DOCS);
  const [reports, setReports] = useState(EXAMPLE_REPORTS);
  const [rate, setRate] = useState(EXAMPLE_RATE);
  const [manualReport, setManualReport] = useState(EXAMPLE_MANUAL_REPORT);

  const calc = useCalculations(docs, reports, rate, manualReport);

  const handleInteraction = () => {
    if (isExample) setIsExample(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
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

        {/* BDO card moved here - under header */}
        {manualReport && (
          <div className="mt-6 max-w-2xl mx-auto rounded-xl border-2 border-zeme-yellow bg-zeme-yellow/10 p-5 text-left">
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

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Sliders Panel */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 space-y-8 h-fit">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Twoje parametry
          </h2>

          {/* Documents slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium">Dokumenty miesięcznie</label>
              <span className="text-lg font-bold text-primary">{docs}</span>
            </div>
            <Slider
              value={[docs]}
              min={50}
              max={5000}
              step={10}
              onValueChange={(v) => { setDocs(v[0]); handleInteraction(); }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50</span><span>5 000</span>
            </div>
          </div>

          {/* Reports slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium">Raporty miesięcznie</label>
              <span className="text-lg font-bold text-primary">{reports}</span>
            </div>
            <Slider
              value={[reports]}
              min={1}
              max={50}
              step={1}
              onValueChange={(v) => { setReports(v[0]); handleInteraction(); }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span><span>50</span>
            </div>
          </div>

          {/* Hourly rate slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium">Koszt godziny pracy</label>
              <span className="text-lg font-bold text-primary">{rate} zł</span>
            </div>
            <Slider
              value={[rate]}
              min={50}
              max={500}
              step={10}
              onValueChange={(v) => { setRate(v[0]); handleInteraction(); }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50 zł</span><span>500 zł</span>
            </div>
          </div>

          {/* Checkbox */}
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

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main savings highlight */}
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

          {/* Metric cards grid */}
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

          {/* Breakdown */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Szczegółowy podział oszczędności
            </h3>
            <div className="space-y-3">
              <BreakdownRow
                label="Przetwarzanie dokumentów KPO"
                before={`${docs * 3} min`}
                after={`${(docs * 0.2).toFixed(0)} min`}
                percent={93}
              />
              <BreakdownRow
                label="Tworzenie raportów"
                before={`${reports * 2} h`}
                after={`${Math.round(reports * 10 / 60 * 10) / 10} h`}
                percent={92}
              />
              <BreakdownRow
                label="Walidacja i sprawdzanie"
                before={`${reports * 5} min`}
                after="0 min"
                percent={100}
              />
              {manualReport && (
                <BreakdownRow
                  label="Sprawozdanie roczne (mc)"
                  before="30 min"
                  after="1.3 min"
                  percent={96}
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
