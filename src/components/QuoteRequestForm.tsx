import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Send, Sparkles, Lock } from "lucide-react";

export interface CalculatorSnapshot {
  docs: number;
  keo: number;
  dpr: number;
  reports: number;
  rate: number;
  manualReport: boolean;
  monthlySavings: number;
  annualSavings: number;
  totalTimeSavedHours: number;
  efficiencyPercent: number;
  roiMonths: number | typeof Infinity;
}

const formSchema = z.object({
  companyName: z.string().trim().min(2, "Podaj nazwę firmy").max(150),
  contactName: z.string().trim().min(2, "Podaj imię i nazwisko").max(100),
  email: z.string().trim().email("Nieprawidłowy adres e-mail").max(255),
  phone: z.string().trim().min(6, "Podaj numer telefonu").max(30),
  nip: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().max(1500).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Wymagana zgoda" }) }),
});

interface QuoteRequestFormProps {
  snapshot: CalculatorSnapshot;
  trigger?: React.ReactNode;
}

export default function QuoteRequestForm({ snapshot, trigger }: QuoteRequestFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    nip: "",
    message: "",
    consent: false,
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    // Symulacja wysyłki — tutaj można podpiąć backend (Lovable Cloud / edge function)
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setOpen(false);
    toast({
      title: "Zapytanie wysłane",
      description: "Skontaktujemy się z Tobą w ciągu 1 dnia roboczego.",
    });
    setForm({ companyName: "", contactName: "", email: "", phone: "", nip: "", message: "", consent: false });
  };

  const roiText = snapshot.roiMonths === Infinity ? "—" : `${snapshot.roiMonths} mc`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="lg" className="gap-2">
            <Send className="w-4 h-4" />
            Zapytaj o ofertę
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-5 h-5 text-primary" />
            Zapytanie ofertowe ZEME360
          </DialogTitle>
          <DialogDescription>
            Twoje dane z kalkulatora trafią automatycznie do handlowca — szybciej omówimy konkretne oszczędności.
          </DialogDescription>
        </DialogHeader>

        {/* Podsumowanie z kalkulatora */}
        <div className="rounded-lg border border-primary/20 bg-secondary/50 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Twoje dane z kalkulatora
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <SummaryItem label="KPO / mc" value={snapshot.docs.toLocaleString("pl-PL")} />
            
            <SummaryItem label="DPR / kw." value={snapshot.dpr.toLocaleString("pl-PL")} />
            <SummaryItem label="Raporty / mc" value={snapshot.reports.toLocaleString("pl-PL")} />
            <SummaryItem label="Stawka godz." value={`${snapshot.rate} zł`} />
            <SummaryItem label="Sprawozdanie roczne" value={snapshot.manualReport ? "Manualnie" : "Nie"} />
          </div>
          <div className="border-t border-border pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <SummaryItem label="Oszczędność / mc" value={`${snapshot.monthlySavings.toLocaleString("pl-PL")} zł`} highlight />
            <SummaryItem label="Oszczędność / rok" value={`${snapshot.annualSavings.toLocaleString("pl-PL")} zł`} highlight />
            <SummaryItem label="Czas / mc" value={`${snapshot.totalTimeSavedHours} h`} highlight />
            <SummaryItem label="ROI" value={roiText} highlight />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nazwa firmy *" error={errors.companyName}>
              <Input
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                maxLength={150}
                placeholder="np. EkoFirma Sp. z o.o."
              />
            </Field>
            <Field label="NIP" error={errors.nip}>
              <Input
                value={form.nip}
                onChange={(e) => update("nip", e.target.value)}
                maxLength={20}
                placeholder="opcjonalnie"
              />
            </Field>
            <Field label="Imię i nazwisko *" error={errors.contactName}>
              <Input
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
                maxLength={100}
                placeholder="Jan Kowalski"
              />
            </Field>
            <Field label="Telefon *" error={errors.phone}>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                maxLength={30}
                placeholder="+48 600 000 000"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="E-mail służbowy *" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  maxLength={255}
                  placeholder="jan.kowalski@firma.pl"
                />
              </Field>
            </div>
          </div>

          <Field label="Wiadomość do handlowca" error={errors.message}>
            <Textarea
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              maxLength={1500}
              rows={4}
              placeholder="Napisz, na czym Ci najbardziej zależy — np. integracje, terminy wdrożenia, dodatkowe pytania…"
            />
            <p className="text-xs text-muted-foreground text-right">
              {form.message.length}/1500
            </p>
          </Field>

          <div className="flex items-start gap-3 rounded-md bg-secondary/50 p-3">
            <Checkbox
              id="consent"
              checked={form.consent}
              onCheckedChange={(v) => update("consent", !!v)}
              className="mt-0.5"
            />
            <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              Wyrażam zgodę na kontakt handlowy w sprawie zapytania ofertowego oraz przetwarzanie moich danych
              osobowych przez ZEME w celu przygotowania oferty. *
            </label>
          </div>
          {errors.consent && <p className="text-xs text-destructive -mt-2">{errors.consent}</p>}

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Twoje dane są bezpieczne
            </p>
            <Button type="submit" size="lg" disabled={submitting} className="gap-2">
              <Send className="w-4 h-4" />
              {submitting ? "Wysyłanie…" : "Wyślij zapytanie"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`font-semibold tabular-nums ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
