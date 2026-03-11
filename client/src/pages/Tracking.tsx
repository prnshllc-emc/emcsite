/**
 * Public Tracking Page — Clients enter their EMC tracking code to view
 * real-time shipment status with a visual timeline.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOGO_URL } from "@/lib/contact";
import {
  Ship,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ArrowLeft,
  Anchor,
  Truck,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Info,
} from "lucide-react";

// ── Status configuration ────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; step: number }
> = {
  draft: {
    label: "Rascunho",
    icon: Package,
    color: "text-gray-400",
    step: 0,
  },
  final: {
    label: "BL Finalizado",
    icon: CheckCircle2,
    color: "text-blue-400",
    step: 1,
  },
  in_transit: {
    label: "Em Trânsito",
    icon: Ship,
    color: "text-primary",
    step: 2,
  },
  arrived: {
    label: "Chegou ao Porto",
    icon: Anchor,
    color: "text-yellow-400",
    step: 3,
  },
  customs: {
    label: "Desembaraço Aduaneiro",
    icon: ShieldCheck,
    color: "text-orange-400",
    step: 4,
  },
  delivered: {
    label: "Entregue",
    icon: CheckCircle2,
    color: "text-green-400",
    step: 5,
  },
};

const TIMELINE_STEPS = [
  { key: "draft", label: "Rascunho", icon: Package },
  { key: "final", label: "BL Final", icon: CheckCircle2 },
  { key: "in_transit", label: "Em Trânsito", icon: Ship },
  { key: "arrived", label: "No Porto", icon: Anchor },
  { key: "customs", label: "Alfândega", icon: ShieldCheck },
  { key: "delivered", label: "Entregue", icon: Truck },
];

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Tracking() {
  const [codeInput, setCodeInput] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  // Validate and format code as user types
  function handleCodeChange(value: string) {
    // Auto-format: add EMC- prefix and dashes
    let cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, "");

    // If user types without prefix, add it
    if (cleaned.length > 0 && !cleaned.startsWith("EMC")) {
      cleaned = "EMC-" + cleaned.replace(/-/g, "");
    }

    // Auto-insert dashes at correct positions
    if (cleaned.startsWith("EMC")) {
      const afterPrefix = cleaned.replace("EMC", "").replace(/-/g, "");
      let formatted = "EMC";
      for (let i = 0; i < afterPrefix.length && i < 12; i++) {
        if (i % 4 === 0) formatted += "-";
        formatted += afterPrefix[i];
      }
      cleaned = formatted;
    }

    setCodeInput(cleaned);
    setInputError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();

    // Validate format
    const pattern =
      /^EMC-[A-HJ-NPR-Z2-9]{4}-[A-HJ-NPR-Z2-9]{4}-[A-HJ-NPR-Z2-9]{4}$/;
    if (!pattern.test(code)) {
      setInputError(
        "Código inválido. Use o formato EMC-XXXX-XXXX-XXXX"
      );
      return;
    }

    setSubmittedCode(code);
  }

  function handleReset() {
    setSubmittedCode(null);
    setCodeInput("");
    setInputError(null);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/95 backdrop-blur-lg">
        <div className="container flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <img
              src={LOGO_URL}
              alt="EMC - Enviando Meu Carro"
              className="h-14"
            />
          </a>
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </a>
        </div>
      </header>

      <main className="container py-12 md:py-20">
        {!submittedCode ? (
          <TrackingForm
            codeInput={codeInput}
            inputError={inputError}
            onCodeChange={handleCodeChange}
            onSubmit={handleSubmit}
          />
        ) : (
          <TrackingResult code={submittedCode} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-muted-foreground">
        <div className="container">
          &copy; {new Date().getFullYear()} EMC — Enviando Meu Carro. Todos os
          direitos reservados.
        </div>
      </footer>
    </div>
  );
}

// ── Search Form ─────────────────────────────────────────────
function TrackingForm({
  codeInput,
  inputError,
  onCodeChange,
  onSubmit,
}: {
  codeInput: string;
  inputError: string | null;
  onCodeChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="max-w-xl mx-auto text-center">
      {/* Icon */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Ship className="w-10 h-10 text-primary" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold font-display mb-3">
        Rastreie Seu Veículo
      </h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto font-body">
        Insira seu código de rastreio EMC para acompanhar o status do seu
        envio em tempo real.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            value={codeInput}
            onChange={(e) => onCodeChange(e.target.value)}
            placeholder="EMC-XXXX-XXXX-XXXX"
            className="h-14 text-lg text-center tracking-widest font-mono bg-card border-border placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/30"
            maxLength={19}
            autoFocus
          />
          {inputError && (
            <p className="text-destructive text-sm mt-2 flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {inputError}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base font-bold uppercase tracking-wider bg-primary hover:bg-primary/90"
        >
          <Search className="w-5 h-5 mr-2" />
          Rastrear
        </Button>
      </form>

      <div className="mt-8 p-4 rounded-xl bg-card/50 border border-white/5 text-sm text-muted-foreground">
        <Info className="w-4 h-4 inline-block mr-1 -mt-0.5" />
        O código de rastreio foi enviado por e-mail ou WhatsApp pela equipe
        EMC. Formato: <span className="font-mono text-foreground/80">EMC-XXXX-XXXX-XXXX</span>
      </div>
    </div>
  );
}

// ── Result View ─────────────────────────────────────────────
function TrackingResult({
  code,
  onReset,
}: {
  code: string;
  onReset: () => void;
}) {
  const { data, isLoading, error } = trpc.tracking.lookup.useQuery(
    { code },
    { retry: 1 }
  );

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-lg">
          Buscando informações do rastreio...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-3">
          Código Não Encontrado
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          O código <span className="font-mono text-foreground">{code}</span>{" "}
          não foi encontrado ou pode ter expirado. Verifique se digitou
          corretamente.
        </p>
        <Button onClick={onReset} variant="outline" size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.draft;
  const currentStep = statusConfig.step;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={onReset}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Nova consulta
      </button>

      {/* Status Header Card */}
      <div className="rounded-2xl bg-card border border-white/10 p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Código de Rastreio
            </p>
            <p className="text-xl font-mono font-bold tracking-wider">
              {data.code}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${
              data.status === "delivered"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : data.status === "in_transit"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            }`}
          >
            <statusConfig.icon className="w-4 h-4" />
            {statusConfig.label}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          {/* Progress bar background */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 hidden md:block" />
          {/* Progress bar fill */}
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-700 hidden md:block"
            style={{
              width: `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%`,
            }}
          />

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-0 relative">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStep;
              const isCurrent = idx === currentStep;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isCurrent
                        ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30"
                        : isCompleted
                          ? "bg-primary/20 border-primary/50 text-primary"
                          : "bg-card border-white/10 text-muted-foreground"
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] md:text-xs mt-2 font-medium ${
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                          ? "text-foreground/80"
                          : "text-muted-foreground/60"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shipment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Route Card */}
        <div className="rounded-xl bg-card border border-white/10 p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Rota
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Origem</p>
                <p className="font-medium">
                  {data.originPort ?? "Não informado"}
                </p>
              </div>
            </div>
            <div className="border-l-2 border-dashed border-white/10 ml-4 h-4" />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Destino</p>
                <p className="font-medium">
                  {data.destinationPort ?? "Não informado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dates Card */}
        <div className="rounded-xl bg-card border border-white/10 p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Datas
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Partida Prevista</span>
              <span className="font-medium">
                {formatDate(data.estimatedDeparture)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Partida Real</span>
              <span className="font-medium">
                {formatDate(data.actualDeparture)}
              </span>
            </div>
            <div className="border-t border-white/5 pt-3 flex justify-between">
              <span className="text-muted-foreground">Chegada Prevista</span>
              <span className="font-medium text-primary">
                {formatDate(data.estimatedArrival)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chegada Real</span>
              <span className="font-medium">
                {formatDate(data.actualArrival)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <InfoCard
          label="BL"
          value={data.blNumber}
          icon={<Package className="w-4 h-4" />}
        />
        <InfoCard
          label="Container"
          value={data.containerNumber ?? "—"}
          icon={<Ship className="w-4 h-4" />}
        />
        <InfoCard
          label="Veículo"
          value={data.vehicleDescription ?? "—"}
          icon={<Truck className="w-4 h-4" />}
        />
      </div>

      {/* Timeline */}
      {data.timeline && data.timeline.length > 0 && (
        <div className="rounded-xl bg-card border border-white/10 p-5 md:p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
            Histórico de Eventos
          </h3>
          <div className="space-y-0">
            {data.timeline.map((event, idx) => {
              const eventConfig =
                STATUS_CONFIG[event.status] ?? STATUS_CONFIG.draft;
              const EventIcon = eventConfig.icon;
              const isFirst = idx === 0;

              return (
                <div key={idx} className="relative flex gap-4">
                  {/* Timeline line */}
                  {idx < data.timeline.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-white/10" />
                  )}

                  {/* Icon */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isFirst
                        ? "bg-primary text-white"
                        : "bg-card border border-white/20 text-muted-foreground"
                    }`}
                  >
                    <EventIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Content */}
                  <div className="pb-6 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-sm font-semibold ${isFirst ? "text-primary" : "text-foreground"}`}
                      >
                        {eventConfig.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(event.eventDate)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last update */}
      {data.lastUpdate && (
        <p className="text-xs text-muted-foreground text-center mt-6">
          <Clock className="w-3 h-3 inline-block mr-1 -mt-0.5" />
          Última atualização: {formatDateTime(data.lastUpdate)}
        </p>
      )}
    </div>
  );
}

// ── Info Card Component ─────────────────────────────────────
function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-card border border-white/10 p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <p className="font-medium text-sm truncate" title={value}>
        {value}
      </p>
    </div>
  );
}
