import { useState, useMemo, useEffect } from "react";
import { useCalculatorEmit } from "@/hooks/useCalculatorEmit";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Clock,
  TrendingUp,
  PiggyBank,
  Zap,
  FileText,
  BarChart3,
  ShieldCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const MONTHLY_COST = 360;

const AUTO_KPO_MIN = 24.2 / 60;
const AUTO_KEO_MIN = 0;
const AUTO_DPR_MIN = 30 / 60;
const AUTO_REPORT_MIN = 30.25 / 60;
const AUTO_BDO_REPORT_MIN = 35.22 / 60;

const MANUAL_KPO_MIN = 3;
const MANUAL_KEO_MIN = 10 / 60;
const MANUAL_DPR_MIN = 60;
const MANUAL_REPORT_MIN = 90;
const MANUAL_BDO_REPORT_MIN = 720;

function useCalculations(
  docs: number,
  dpr: number,
  reports: number,
  rate: number,
  manualReport: boolean
) {
  return useMemo(() => {
    const keo = docs * 2;

    const docTimeManual = docs * MANUAL_KPO_MIN;
    const docTimeAuto = docs * AUTO_KPO_MIN;
    const docTimeSaved = docTimeManual - docTimeAuto;

    const keoTimeManual = keo * MANUAL_KEO_MIN;
    const keoTimeAuto = keo * AUTO_KEO_MIN;
    const keoTimeSaved = keoTimeManual - keoTimeAuto;

    const dprMonthly = (dpr * 4) / 12;
    const dprTimeManual = dprMonthly * MANUAL_DPR_MIN;
    const dprTimeAuto = dprMonthly * AUTO_DPR_MIN;
    const dprTimeSaved = dprTimeManual - dprTimeAuto;

    const reportTimeManual = reports * MANUAL_REPORT_MIN;
    const reportTimeAuto = reports * AUTO_REPORT_MIN;
    const reportTimeSaved = reportTimeManual - reportTimeAuto;

    const annualReportTimeSavedTotal = manualReport
      ? MANUAL_BDO_REPORT_MIN - AUTO_BDO_REPORT_MIN
      : 0;
    const annualReportMonthlySaved = annualReportTimeSavedTotal / 12;

    const totalTimeSavedMin =
      docTimeSaved +
      keoTimeSaved +
      dprTimeSaved +
      reportTimeSaved +
      annualReportMonthlySaved;
    const totalTimeSavedHours = totalTimeSavedMin / 60;
    const totalTimeSavedDays = totalTimeSavedHours / 8;

    const monthlySavings = totalTimeSavedHours * rate;
    const annualSavings = monthlySavings * 12;

    const totalManualMin =
      docTimeManual +
      keoTimeManual +
      dprTimeManual +
      reportTimeManual +
      (manualReport ? MANUAL_BDO_REPORT_MIN / 12 : 0);
    const efficiencyPercent =
      totalManualMin > 0
        ? Math.round((totalTimeSavedMin / totalManualMin) * 100)
        : 0;

    const roiMonths =
      monthlySavings > 0
        ? Math.max(1, Math.ceil(MONTHLY_COST / monthlySavings))
        : Infinity;

    return {
      keo,
      totalTimeSavedHours: Math.round(totalTimeSavedHours),
      totalTimeSavedDays: Math.round(totalTimeSavedDays * 10) / 10,
      monthlySavings: Math.round(monthlySavings),
      annualSavings: Math.round(annualSavings),
      efficiencyPercent,
      roiMonths,
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

interface StepShellProps {
  stepIndex: number;
  totalSteps: number;
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  canGoBack: boolean;
  showHeader?: boolean;
}

function StepShell({
  stepIndex,
  totalSteps,
  title,
  description,
  icon,
  children,
  onBack,
  onNext,
  nextLabel = "Dalej",
  canGoBack,
  showHeader = true,
}: StepShellProps) {
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {showHeader && (
        <header className="px-5 pt-6 pb-4">
          <p className="text-fs-regular font-medium text-muted-foreground">
            Krok {stepIndex + 1} / {totalSteps}
          </p>
          <div className="mt-2 h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00DEAB] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>
      )}

      <main className="flex-1 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-md bg-[#EDFFF6]">{icon}</div>
          <h2 className="text-h5 font-semibold leading-tight">{title}</h2>
        </div>
        {description && (
          <p className="text-fs-regular text-foreground mb-6">{description}</p>
        )}
        {children}
      </main>

      <footer className="sticky bottom-0 left-0 right-0 px-5 py-4 bg-background border-t border-border flex gap-3">
        {canGoBack && (
          <Button
            variant="webflow-secondary"
            size="webflow"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="webflow"
          size="webflow"
          className="flex-1"
          onClick={onNext}
        >
          {nextLabel} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </footer>
    </div>
  );
}

interface ParamInputProps {
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  tooltip: React.ReactNode;
  onChange: (v: number) => void;
}

function ParamInput({ value, min, max, step, unit, tooltip, onChange }: ParamInputProps) {
  const [draft, setDraft] = useState(String(value));
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  useEffect(() => {
    setDraft(String(value));
  }, [value]);
  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-baseline justify-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          value={draft}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            if (raw === "") return;
            const n = Number(raw);
            if (!isNaN(n)) onChange(clamp(n));
          }}
          onBlur={() => {
            const n = Number(draft);
            if (draft === "" || isNaN(n)) {
              setDraft(String(value));
            } else {
              const c = clamp(n);
              onChange(c);
              setDraft(String(c));
            }
          }}
          className="!text-5xl h-20 w-full text-center font-semibold text-primary px-3"
        />
        {unit && (
          <span className="text-3xl font-semibold text-primary">{unit}</span>
        )}
      </div>
      <div className="bg-[#EDFFF6] border border-[#00DEAB] rounded-md px-3 py-2 text-fs-small text-muted-foreground">
        {tooltip}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  beforeValue,
  afterValue,
  beforeUnit,
  afterUnit,
  decimals = 0,
  afterLabel,
}: {
  label: string;
  beforeValue: number;
  afterValue: number;
  beforeUnit: string;
  afterUnit: string;
  decimals?: number;
  afterLabel?: string;
}) {
  const fmt = (n: number) =>
    n.toLocaleString("pl-PL", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  return (
    <div className="py-2 border-b border-border/60 last:border-0">
      <p className="text-fs-regular font-medium">{label}</p>
      <p className="text-xs text-muted-foreground tabular-nums mt-1">
        <span className="line-through">
          {fmt(beforeValue)} {beforeUnit}
        </span>{" "}
        →{" "}
        <span className="font-semibold text-primary">
          {afterLabel ? afterLabel : `${fmt(afterValue)} ${afterUnit}`}
        </span>
      </p>
    </div>
  );
}

export default function MobileCalculator() {
  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState(500);
  const [dpr, setDpr] = useState(5);
  const [reports, setReports] = useState(10);
  const [rate, setRate] = useState(40);
  const [manualReport, setManualReport] = useState(true);

  const calc = useCalculations(docs, dpr, reports, rate, manualReport);

  useCalculatorEmit({
    source: "mobile",
    inputs: { docs, dpr, reports, rate, manualReport },
    results: {
      keo: calc.keo,
      monthlySavings: calc.monthlySavings,
      annualSavings: calc.annualSavings,
      totalTimeSavedHours: calc.totalTimeSavedHours,
      efficiencyPercent: calc.efficiencyPercent,
      roiMonths: calc.roiMonths === Infinity ? 0 : calc.roiMonths,
    },
  });

  const TOTAL_STEPS = 6;

  const next = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  // Step 0: intro
  if (step === 0) {
    return (
      <StepShell
        stepIndex={0}
        totalSteps={TOTAL_STEPS}
        title="Kalkulator oszczędności ZEME 360"
        description="Sprawdź, ile czasu i pieniędzy zaoszczędzisz dzięki automatyzacji BDO. Wypełnij 4 krótkie kroki."
        icon={<Zap className="w-5 h-5 text-primary" />}
        onNext={next}
        canGoBack={false}
        nextLabel="Zacznij"
        showHeader={false}
      >
        <div className="space-y-3 mt-4">
          {[
            "Liczba KPO miesięcznie",
            "Zlecenia DPR kwartalnie",
            "Raporty miesięcznie",
            "Koszt godziny pracy",
          ].map((t, i) => (
            <div
              key={t}
              className="flex items-center gap-3 p-3 border border-border bg-card"
            >
              <span className="w-7 h-7 flex items-center justify-center bg-[#EDFFF6] text-primary font-semibold text-sm">
                {i + 1}
              </span>
              <span className="text-fs-regular font-medium">{t}</span>
            </div>
          ))}
        </div>
      </StepShell>
    );
  }

  // Step 1: KPO
  if (step === 1) {
    return (
      <StepShell
        stepIndex={0}
        totalSteps={4}
        title="KPO miesięcznie"
        icon={<FileText className="w-5 h-5 text-primary" />}
        onBack={back}
        onNext={next}
        canGoBack
      >
        <ParamInput
          value={docs}
          min={1}
          max={20000}
          step={1}
          onChange={setDocs}
          tooltip={
            <>
              Na podstawie liczby KPO kalkulator liczy oszczędność czasu na stworzeniu i zarządzaniu KPO oraz stworzeniu wpisów w KEO (w tym przypadku to ok.{" "}
              <span className="font-semibold">{calc.keo.toLocaleString("pl-PL")}</span>{" "}
              wpisów, ponieważ 1 KPO to 2 wpisy w KEO).
            </>
          }
        />
      </StepShell>
    );
  }

  // Step 2: DPR
  if (step === 2) {
    return (
      <StepShell
        stepIndex={1}
        totalSteps={4}
        title="Zlecenia DPR kwartalnie"
        icon={<CalendarDays className="w-5 h-5 text-primary" />}
        onBack={back}
        onNext={next}
        canGoBack
      >
        <ParamInput
          value={dpr}
          min={0}
          max={50}
          step={1}
          onChange={setDpr}
          tooltip="Kalkulator pokaże uśrednione oszczędności miesięczne (×4 / 12)."
        />
      </StepShell>
    );
  }

  // Step 3: Reports + manual
  if (step === 3) {
    return (
      <StepShell
        stepIndex={2}
        totalSteps={4}
        title="Raporty miesięcznie"
        icon={<BarChart3 className="w-5 h-5 text-primary" />}
        onBack={back}
        onNext={next}
        canGoBack
      >
        <ParamInput
          value={reports}
          min={1}
          max={500}
          step={1}
          onChange={setReports}
          tooltip="Liczba raportów, które tworzysz na podstawie danych odpadowych."
        />
        <div className="flex items-start gap-3 mt-8 p-3 border border-border bg-card">
          <Checkbox
            id="manual-report"
            checked={manualReport}
            onCheckedChange={(v) => setManualReport(!!v)}
            className="mt-0.5"
          />
          <label
            htmlFor="manual-report"
            className="text-sm leading-snug cursor-pointer"
          >
            Sprawozdanie roczne przygotowuję manualnie
          </label>
        </div>
      </StepShell>
    );
  }

  // Step 4: Rate
  if (step === 4) {
    return (
      <StepShell
        stepIndex={3}
        totalSteps={4}
        title="Koszt godziny pracy"
        icon={<PiggyBank className="w-5 h-5 text-primary" />}
        onBack={back}
        onNext={next}
        canGoBack
        nextLabel="Zobacz oszczędności"
      >
        <ParamInput
          value={rate}
          min={40}
          max={200}
          step={5}
          unit="zł"
          onChange={setRate}
          tooltip="Koszt godziny pracy Twojego pracownika."
        />
      </StepShell>
    );
  }

  // Step 5: Results
  const kpoSaved = calc.docTimeManual - calc.docTimeAuto;
  const keoSaved = calc.keoTimeManual - calc.keoTimeAuto;
  const dprSaved = calc.dprTimeManual - calc.dprTimeAuto;
  const reportSaved = calc.reportTimeManual - calc.reportTimeAuto;
  const bdoSaved = manualReport
    ? (MANUAL_BDO_REPORT_MIN - AUTO_BDO_REPORT_MIN) / 12
    : 0;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setStep(4)}
          className="rounded-none"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <p className="text-fs-regular font-medium text-foreground">
          Twoje oszczędności
        </p>
      </header>

      <main className="flex-1 px-5 pb-6 space-y-4">
        {/* Hero */}
        <div className="bg-[#00DEAB] text-black p-6">
          <p className="text-fs-regular font-medium opacity-90 mb-1">
            Miesięczne oszczędności
          </p>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-semibold tabular-nums">
              {calc.monthlySavings.toLocaleString("pl-PL")} zł
            </span>
            <span className="text-base opacity-80">
              / {calc.totalTimeSavedHours} h
            </span>
          </div>
          <p className="text-sm opacity-80 mt-2">
            Rocznie: {calc.annualSavings.toLocaleString("pl-PL")} zł
          </p>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-fs-regular text-muted-foreground">Czas / mc</span>
            </div>
            <p className="text-xl font-semibold">{calc.totalTimeSavedHours} h</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ≈ {calc.totalTimeSavedDays} dni
            </p>
          </div>
          <div className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-fs-regular text-muted-foreground">Efektywność</span>
            </div>
            <p className="text-xl font-semibold">{calc.efficiencyPercent}%</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              redukcja pracy manualnej
            </p>
          </div>
          <div className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className="w-4 h-4 text-primary" />
              <span className="text-fs-regular text-muted-foreground">Rocznie</span>
            </div>
            <p className="text-xl font-semibold">
              {calc.annualSavings.toLocaleString("pl-PL")} zł
            </p>
          </div>
          <div className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="text-fs-regular text-muted-foreground">ROI</span>
            </div>
            <p className="text-xl font-semibold">
              {calc.roiMonths === Infinity ? "—" : `${calc.roiMonths} mc`}
            </p>
          </div>
        </div>

        {/* Collapsible details */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 bg-card border border-border flex items-center justify-between text-left">
              <span className="text-fs-regular font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Szczegółowy podział oszczędzonego czasu
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform data-[state=open]:rotate-90" />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 bg-card border border-t-0 border-border">
              <DetailRow
                label="Przetwarzanie KPO"
                beforeValue={calc.docTimeManual}
                afterValue={calc.docTimeAuto}
                beforeUnit="min"
                afterUnit="min"
                decimals={1}
              />
              <DetailRow
                label={`KEO (${calc.keo.toLocaleString("pl-PL")} klik)`}
                beforeValue={calc.keoTimeManual}
                afterValue={calc.keoTimeAuto}
                beforeUnit="min"
                afterUnit="min"
                afterLabel="automatycznie"
              />
              <DetailRow
                label="Zlecenia DPR"
                beforeValue={calc.dprTimeManual}
                afterValue={calc.dprTimeAuto}
                beforeUnit="min"
                afterUnit="min"
                decimals={1}
              />
              <DetailRow
                label="Tworzenie raportów"
                beforeValue={calc.reportTimeManual / 60}
                afterValue={calc.reportTimeAuto / 60}
                beforeUnit="h"
                afterUnit="h"
                decimals={1}
              />
              {manualReport && (
                <DetailRow
                  label="Sprawozdanie roczne"
                  beforeValue={MANUAL_BDO_REPORT_MIN / 12}
                  afterValue={AUTO_BDO_REPORT_MIN / 12}
                  beforeUnit="min. mies."
                  afterUnit="min"
                  decimals={1}
                  afterLabel="automatycznie"
                />
              )}
              <p className="text-[11px] text-muted-foreground mt-3">
                * Kalkulator zaokrągla zaoszczędzony czas do pełnych godzin.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {manualReport && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 border-2 border-zeme-yellow bg-zeme-yellow/10 flex items-center justify-between text-left">
                <span className="text-fs-regular font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-zeme-yellow" />
                  Dodatkowe oszczędności BDO
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform data-[state=open]:rotate-90" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 border-2 border-t-0 border-zeme-yellow bg-zeme-yellow/10">
                <p className="text-xs text-muted-foreground mb-3">
                  Automatyczne sprawozdanie roczne oszczędza dodatkowy czas i
                  pieniądze.
                </p>
                <div className="flex gap-6">
                  <div>
                    <p className="text-fs-regular text-muted-foreground">Czas / mc</p>
                    <p className="text-lg font-semibold">
                      {Math.round((bdoSaved / 60) * 10) / 10} h
                    </p>
                  </div>
                  <div>
                    <p className="text-fs-regular text-muted-foreground">
                      Oszczędność / mc
                    </p>
                    <p className="text-lg font-semibold">
                      {Math.round((bdoSaved / 60) * rate)} zł
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* CTA */}
        <div className="bg-black text-primary-foreground p-6 mt-2">
          <p className="text-lg font-semibold leading-tight">
            Odzyskaj czas i pieniądze z ZEME 360
          </p>
          <p className="text-sm opacity-90 mt-1">
            Umów się na konsultację, aby przekonać się jak bezproblemowo i łatwo
            można gospodarować odpadami w ZEME 360.
          </p>
          <Button
            variant="webflow"
            size="webflow"
            className="mt-4 w-full"
            onClick={() => {
              const target = window.parent.document.getElementById("formularz-kontaktowy");
              if (target) target.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Umów prezentację
          </Button>
        </div>

        <button
          className="w-full text-sm text-muted-foreground underline mt-2"
          onClick={() => setStep(1)}
        >
          Zmień parametry
        </button>
      </main>
    </div>
  );
}
