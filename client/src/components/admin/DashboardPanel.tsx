/**
 * DashboardPanel — Admin overview with consolidated statistics.
 * Shows BL counts by status, active tracking codes, customers, vehicles, and recent events.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  QrCode,
  Users,
  Car,
  Ship,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Status config ────────────────────────────────────────────
const BL_STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Ship }> = {
  draft: { label: "Rascunho", color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: FileText },
  final: { label: "Final", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: FileText },
  in_transit: { label: "Em Trânsito", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Ship },
  arrived: { label: "Chegou", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Package },
  customs: { label: "Aduana", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: AlertTriangle },
  delivered: { label: "Entregue", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2 },
};

const EVENT_STATUS_LABELS: Record<string, string> = {
  draft: "BL Draft Recebido",
  final: "BL Final Recebido",
  in_transit: "Em Trânsito",
  arrived: "Chegada ao Porto",
  customs: "Desembaraço Aduaneiro",
  delivered: "Entregue",
  info: "Informação",
  alert: "Alerta",
  delay: "Atraso",
};

export default function DashboardPanel() {
  const { data, isLoading, refetch, isRefetching } = trpc.dashboard.stats.useQuery(undefined, {
    refetchInterval: 60_000, // Auto-refresh every 60s
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-display font-semibold">Erro ao carregar dados</p>
          <p className="text-muted-foreground font-body mt-1">
            Não foi possível carregar as estatísticas do dashboard.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalBls = Object.values(data.blsByStatus).reduce((sum, count) => sum + count, 0);
  const inTransitCount = data.blsByStatus["in_transit"] ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Dashboard</h2>
          <p className="text-muted-foreground font-body mt-1">
            Visão geral do sistema de rastreamento EMC
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          icon={FileText}
          label="Total de BLs"
          value={totalBls}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <KpiCard
          icon={Ship}
          label="Em Trânsito"
          value={inTransitCount}
          color="text-amber-400"
          bgColor="bg-amber-500/10"
        />
        <KpiCard
          icon={QrCode}
          label="Códigos Ativos"
          value={data.activeCodes}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
        <KpiCard
          icon={Users}
          label="Clientes"
          value={data.activeCustomers}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <KpiCard
          icon={Car}
          label="Veículos"
          value={data.activeVehicles}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
      </div>

      {/* BL Status Breakdown + Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BL Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              BLs por Status
            </CardTitle>
            <CardDescription className="font-body">
              Distribuição dos Bills of Lading por etapa do processo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalBls === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-body">Nenhum BL cadastrado ainda</p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  BLs serão criados automaticamente pelo agente de IA
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(BL_STATUS_CONFIG).map(([status, config]) => {
                  const count = data.blsByStatus[status] ?? 0;
                  const percentage = totalBls > 0 ? (count / totalBls) * 100 : 0;
                  const Icon = config.icon;

                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${config.color.split(" ")[0]}`}>
                        <Icon className={`h-4 w-4 ${config.color.split(" ")[1]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-body font-medium">{config.label}</span>
                          <span className="text-sm font-display font-bold">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${config.color.split(" ")[0].replace("/10", "/40")}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Eventos Recentes
            </CardTitle>
            <CardDescription className="font-body">
              Últimas atualizações de tracking no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentEvents.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-body">Nenhum evento registrado</p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  Eventos aparecerão aqui conforme BLs são processados
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {data.recentEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs font-body">
                          {EVENT_STATUS_LABELS[event.status] ?? event.status}
                        </Badge>
                        {event.location && (
                          <span className="text-xs text-muted-foreground font-body truncate">
                            {event.location}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground font-body line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/60 font-body mt-1">
                        BL #{event.blId} &middot;{" "}
                        {new Date(event.eventDate).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Info Footer */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
            <span>Sistema EMC Tracking v1.0</span>
            <span>
              Última atualização: {new Date().toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── KPI Card Component ──────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${bgColor}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-display font-bold">{value}</p>
            <p className="text-sm text-muted-foreground font-body">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
