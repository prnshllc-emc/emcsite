/**
 * PipelinePanel — Non-blocking process stage visualization.
 *
 * Shows all customers grouped by their detected stage, with:
 * - Visual pipeline (kanban-style columns)
 * - Individual customer diagnosis drill-down
 * - Force stage change (advance/retrocede freely)
 * - Clear manual override
 * - Run reconciliation
 * - Orphan BL list
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
  Zap,
  Unlock,
  Ship,
  FileText,
  Users,
  Car,
  Package,
  Clock,
  XCircle,
  ArrowRightLeft,
  Info,
  Anchor,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

// ── Stage visual config ─────────────────────────────────────
const STAGE_CONFIG: Record<string, {
  icon: typeof Ship;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  sem_contrato: {
    icon: FileText,
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
  },
  aguardando_assinatura: {
    icon: Clock,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  contrato_ativo: {
    icon: FileText,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  fase_documental: {
    icon: FileText,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
  },
  aguardando_embarque: {
    icon: Anchor,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  em_transito: {
    icon: Ship,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  em_desembaraco: {
    icon: Package,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  concluido: {
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  cancelado: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
};

const STATUS_OPTIONS = [
  { value: "aguardando_embarque", label: "Aguardando Embarque" },
  { value: "aguardando_li", label: "Aguardando LI" },
  { value: "em_processo", label: "Em Processo" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

export default function PipelinePanel() {
  const utils = trpc.useUtils();
  const { data: pipeline, isLoading, refetch, isRefetching } = trpc.reconciliation.pipeline.useQuery(undefined, {
    refetchInterval: 120_000,
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [forceStageDialogOpen, setForceStageDialogOpen] = useState(false);
  const [forceStageCustomerId, setForceStageCustomerId] = useState<number | null>(null);
  const [forceStageValue, setForceStageValue] = useState<string>("");

  // ── Mutations ──────────────────────────────────────────────
  const runReconciliation = trpc.reconciliation.runReconciliation.useMutation({
    onSuccess: (result) => {
      toast.success(`Reconciliação concluída: ${result.updated} atualizado(s), ${result.unchanged} sem alteração, ${result.skippedManualOverride} com override manual`);
      utils.reconciliation.pipeline.invalidate();
      utils.reconciliation.diagnoseCustomer.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const forceStage = trpc.reconciliation.forceStage.useMutation({
    onSuccess: () => {
      toast.success("Estágio forçado com sucesso. Override manual ativado.");
      setForceStageDialogOpen(false);
      utils.reconciliation.pipeline.invalidate();
      utils.reconciliation.diagnoseCustomer.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const clearOverride = trpc.reconciliation.clearOverride.useMutation({
    onSuccess: () => {
      toast.success("Override manual removido. Auto-reconciliação reativada.");
      utils.reconciliation.pipeline.invalidate();
      utils.reconciliation.diagnoseCustomer.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  // ── Customer diagnosis (lazy load) ────────────────────────
  const { data: diagnosis, isLoading: diagnosisLoading } = trpc.reconciliation.diagnoseCustomer.useQuery(
    { customerId: selectedCustomerId! },
    { enabled: selectedCustomerId !== null }
  );

  // ── Active stages (non-empty) ─────────────────────────────
  const activeStages = useMemo(() => {
    if (!pipeline) return [];
    return pipeline.stages.filter((s) => s.count > 0);
  }, [pipeline]);

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pipeline) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-display font-semibold">Erro ao carregar pipeline</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Pipeline de Processos</h2>
          <p className="text-muted-foreground font-body mt-1">
            {pipeline.totalCustomers} cliente(s) &middot;{" "}
            {pipeline.requiresAttention > 0 && (
              <span className="text-amber-400">
                {pipeline.requiresAttention} requer(em) atenção
              </span>
            )}
            {pipeline.requiresAttention === 0 && "Todos os processos em dia"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={() => runReconciliation.mutate()}
            disabled={runReconciliation.isPending}
          >
            {runReconciliation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Reconciliar
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <Card className="border-dashed border-blue-500/30 bg-blue-500/5">
        <CardContent className="py-3 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground font-body">
            A detecção de estágio é <strong className="text-foreground">informativa</strong>, nunca bloqueante.
            A ausência de uma fase não impede que a próxima ocorra.
            Você pode avançar ou retroceder estágios manualmente a qualquer momento.
          </p>
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
      <div className="space-y-4">
        {pipeline.stages.map((stage) => {
          const config = STAGE_CONFIG[stage.stage] ?? STAGE_CONFIG.sem_contrato;
          const Icon = config.icon;

          return (
            <Card key={stage.stage} className={`${config.borderColor} border`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div>
                      <CardTitle className="font-display text-base">{stage.label}</CardTitle>
                      <CardDescription className="font-body text-xs">
                        {stage.count} cliente(s)
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${config.color} border-current`}>
                    {stage.count}
                  </Badge>
                </div>
              </CardHeader>

              {stage.count > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {stage.customers.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-display font-medium truncate">
                              {customer.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-body truncate">
                              {customer.summary}
                            </p>
                            {customer.flags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {customer.flags.map((flag, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                                    {flag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedCustomerId(customer.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Diagnóstico detalhado</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setForceStageCustomerId(customer.id);
                                  setForceStageValue("");
                                  setForceStageDialogOpen(true);
                                }}
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Forçar estágio</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Orphan BLs */}
      {pipeline.orphanBls.length > 0 && (
        <>
          <Separator />
          <Card className="border-dashed border-amber-500/30">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Ship className="h-5 w-5 text-amber-400" />
                BLs sem Cliente ({pipeline.orphanBls.length})
              </CardTitle>
              <CardDescription className="font-body">
                BLs sem cliente vinculado — pode ser operação recorrente (exportação) ou dados pendentes.
                Isso <strong>não é um erro</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pipeline.orphanBls.map((bl) => (
                  <div
                    key={bl.blId}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-display font-medium">
                        BL {bl.blNumber}
                        {bl.containerNumber && (
                          <span className="text-muted-foreground ml-2">
                            Container: {bl.containerNumber}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        Status: {bl.status} &middot; {bl.vehicleCount} veículo(s)
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                      Sem cliente
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Diagnosis Dialog ─────────────────────────────────── */}
      <Dialog
        open={selectedCustomerId !== null}
        onOpenChange={(open) => { if (!open) setSelectedCustomerId(null); }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Diagnóstico do Processo
            </DialogTitle>
            <DialogDescription className="font-body">
              Análise detalhada de cada etapa — informativa, não bloqueante.
            </DialogDescription>
          </DialogHeader>

          {diagnosisLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : diagnosis ? (
            <div className="space-y-4">
              {/* Customer info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-lg">{diagnosis.customerName}</p>
                  <p className="text-sm text-muted-foreground font-body">
                    Estágio detectado:{" "}
                    <Badge variant="outline" className={STAGE_CONFIG[diagnosis.currentStage]?.color ?? ""}>
                      {diagnosis.currentStage}
                    </Badge>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setForceStageCustomerId(diagnosis.customerId);
                      setForceStageValue("");
                      setForceStageDialogOpen(true);
                      setSelectedCustomerId(null);
                    }}
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Forçar Estágio
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearOverride.mutate({ customerId: diagnosis.customerId });
                    }}
                    disabled={clearOverride.isPending}
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    Limpar Override
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Check results */}
              <div className="space-y-3">
                {Object.entries(diagnosis.checks).map(([key, check]) => {
                  const labels: Record<string, string> = {
                    hasClicksignContract: "Contrato Clicksign",
                    contractSigned: "Contrato Assinado",
                    vinExtracted: "VIN Extraído",
                    vehicleInSystem: "Veículo no Sistema",
                    blFound: "BL Encontrado",
                    blStatus: "Status do BL",
                    trackingCodeExists: "Código de Rastreio",
                  };

                  return (
                    <div
                      key={key}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        check.passed
                          ? "border-green-500/20 bg-green-500/5"
                          : "border-border/50 bg-card/50"
                      }`}
                    >
                      {check.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-display font-medium">
                          {labels[key] ?? key}
                        </p>
                        <p className="text-xs text-muted-foreground font-body mt-0.5">
                          {check.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Flags */}
              {diagnosis.flags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-display font-medium mb-2">Flags de Atenção</p>
                    <div className="flex flex-wrap gap-2">
                      {diagnosis.flags.map((flag, i) => (
                        <Badge key={i} variant="outline" className="text-amber-400 border-amber-500/30">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Summary */}
              <Card className="border-dashed">
                <CardContent className="py-3">
                  <p className="text-sm text-muted-foreground font-body">
                    {diagnosis.summary}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-muted-foreground font-body py-4">
              Cliente não encontrado.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Force Stage Dialog ───────────────────────────────── */}
      <Dialog open={forceStageDialogOpen} onOpenChange={setForceStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Forçar Estágio do Cliente</DialogTitle>
            <DialogDescription className="font-body">
              Altere o status manualmente. Isso ativa um override que impede a auto-reconciliação
              de alterar este status até que você o libere.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-display font-medium mb-2 block">
                Novo Status
              </label>
              <Select value={forceStageValue} onValueChange={setForceStageValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status..." />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setForceStageDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!forceStageCustomerId || !forceStageValue) return;
                forceStage.mutate({
                  customerId: forceStageCustomerId,
                  newStatus: forceStageValue as any,
                });
              }}
              disabled={!forceStageValue || forceStage.isPending}
            >
              {forceStage.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Forçar Estágio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
