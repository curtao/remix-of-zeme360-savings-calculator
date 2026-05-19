## Cel

Dodać widoczne bez scrollowania CTA prowadzące do umówienia prezentacji ZEME 360, osadzone wewnątrz najmocniejszego wizualnie elementu kalkulatora — karty „Twoje miesięczne oszczędności" (zielony gradient w prawej kolumnie). Klik przewija płynnie do dolnej sekcji kontaktu z formularzem.

## Zakres zmian

Pliki: tylko `src/components/SavingsCalculator.tsx` (frontend, prezentacja).

### 1. Przycisk CTA w karcie „Twoje miesięczne oszczędności"

W bloku `gradient-primary` (prawa kolumna, na górze) dodać przycisk pod kwotą i informacją o rocznych oszczędnościach:

- Label: **„Umów prezentację ZEME 360"**
- Styl: solidny przycisk w kolorze `#00DEAB` z czarnym tekstem (spójny z dolnym CTA „Zapytaj o ofertę"), `rounded-none`, pełna szerokość na mobile, auto na desktopie, wyraźny `font-semibold`.
- Drobny podpis pod przyciskiem (opcjonalnie): „Bezpłatna, 30-minutowa prezentacja na żywo." — `text-xs opacity-80`.
- Umiejscowienie: poniżej linijki „* Kalkulator zaokrągla…" lub tuż nad nią — w obrębie istniejącej karty, bez zmiany jej tła ani gradientu.

### 2. Zachowanie przycisku — scroll do sekcji kontaktu

- Do istniejącego `<footer>` z czarnym panelem („Chcesz odzyskać czas i pieniądze?") dodać `id="kontakt"` oraz `ref`.
- CTA w karcie oszczędności wywołuje `scrollIntoView({ behavior: "smooth", block: "start" })` na tym refie.
- Dodać `scroll-margin-top` (np. `scroll-mt-8`) na sekcji kontaktu, żeby nie chowała się pod krawędzią viewportu.
- Brak otwierania modala — użytkownik ląduje na sekcji kontaktu, gdzie ma kontekst i klika istniejący przycisk „Zapytaj o ofertę" (QuoteRequestForm pozostaje bez zmian).

### 3. Widoczność bez scrollowania

Na obecnym viewporcie (1294×812) karta „Twoje miesięczne oszczędności" jest w prawej kolumnie tuż pod nagłówkiem — CTA wewnątrz niej znajdzie się powyżej zagięcia. Na mobile (`lg` breakpoint) prawa kolumna spada pod lewą; aby utrzymać widoczność bez scrolla na mobile, w sekcji nagłówkowej (`text-center mb-10`) zostanie dodany ten sam przycisk jako fallback widoczny tylko na małych ekranach (`lg:hidden`). Na desktopie wyświetla się tylko wersja w karcie oszczędności (`hidden lg:inline-flex` w nagłówku → odwrotnie: nagłówkowe CTA `lg:hidden`).

## Czego nie zmieniamy

- Logiki kalkulatora, danych przykładowych, suwaków, tooltipów.
- Dolnej sekcji kontaktu i formularza `QuoteRequestForm` (poza dodaniem `id`/`ref`).
- Kolorystyki kalkulatora i tokenów.

## Szczegóły techniczne

- `useRef<HTMLElement>(null)` na `<footer>`.
- Handler: `() => contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })`.
- Klasa scroll-margin: `scroll-mt-8` na footerze.
- Komponent `Button` z `@/components/ui/button`, klasy spójne z dolnym CTA: `bg-[#00DEAB] text-black hover:bg-[#00DEAB]/90 rounded-none font-semibold`.
