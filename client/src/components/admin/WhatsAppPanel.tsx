/**
 * WhatsAppPanel — Admin panel for WhatsApp Cloud API management.
 *
 * Features:
 * - Connection status indicator
 * - Message log with pagination and filters
 * - Manual message sending (text + template)
 * - Stats dashboard (sent, delivered, read, failed)
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  MessageCircle,
  Send,
  CheckCheck,
  Eye,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Search,
  Phone,
  BarChart3,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════
// STATUS BADGE COMPONENT
// ══════════════════════════════════════════════════════════════

function MessageStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    pending: { label: "Pendente", variant: "outline", icon: <Clock className="h-3 w-3" /> },
    sent: { label: "Enviado", variant: "secondary", icon: <Send className="h-3 w-3" /> },
    delivered: { label: "Entregue", variant: "default", icon: <CheckCheck className="h-3 w-3" /> },
    read: { label: "Lido", variant: "default", icon: <Eye className="h-3 w-3" /> },
    failed: { label: "Falhou", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  };

  const c = config[status] ?? { label: status, variant: "outline" as const, icon: null };

  return (
    <Badge variant={c.variant} className="gap-1 text-xs">
      {c.icon}
      {c.label}
    </Badge>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PANEL
// ══════════════════════════════════════════════════════════════

export default function WhatsAppPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-green-500" />
        <div>
          <h2 className="text-xl font-display font-bold">WhatsApp</h2>
          <p className="text-sm text-muted-foreground font-body">
            Gerencie mensagens WhatsApp via Cloud API (Meta)
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5">
            <MessageCircle className="h-4 w-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="send" className="gap-1.5">
            <Send className="h-4 w-4" />
            Enviar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesTab />
        </TabsContent>

        <TabsContent value="send">
          <SendTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// OVERVIEW TAB — Connection status + stats
// ══════════════════════════════════════════════════════════════

function OverviewTab() {
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = trpc.whatsapp.status.useQuery();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.whatsapp.stats.useQuery();

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-display">Status da Conexão</CardTitle>
              <CardDescription className="font-body">
                WhatsApp Cloud API (Meta Business)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { refetchStatus(); refetchStats(); }}
              disabled={statusLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${statusLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verificando conexão...
            </div>
          ) : status?.configured ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-600">
                <Wifi className="h-5 w-5" />
                <span className="font-semibold">Conectado</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Phone ID: {status.phoneNumberId ? `...${status.phoneNumberId.slice(-6)}` : "—"}
              </Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-600">
                <WifiOff className="h-5 w-5" />
                <span className="font-semibold">Não Configurado</span>
              </div>
              <p className="text-sm text-muted-foreground font-body">
                Configure as variáveis de ambiente <code className="bg-muted px-1 py-0.5 rounded text-xs">WHATSAPP_TOKEN</code> e{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">WHATSAPP_PHONE_NUMBER_ID</code> para ativar o envio automático de WhatsApp.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-sm font-body space-y-2">
                <p className="font-semibold">Como configurar:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Acesse o <a href="https://developers.facebook.com" target="_blank" rel="noopener" className="text-primary underline">Meta for Developers</a></li>
                  <li>Crie um app do tipo "Business" e adicione o produto "WhatsApp"</li>
                  <li>Na seção "API Setup", copie o <strong>Phone Number ID</strong> e o <strong>Permanent Token</strong></li>
                  <li>Configure as variáveis nas configurações do projeto</li>
                  <li>Configure o webhook URL: <code className="bg-muted px-1 py-0.5 rounded text-xs">/api/webhooks/whatsapp</code></li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total"
          value={stats?.total ?? 0}
          icon={<MessageCircle className="h-4 w-4" />}
          loading={statsLoading}
        />
        <StatsCard
          title="Enviados"
          value={stats?.sent ?? 0}
          icon={<Send className="h-4 w-4" />}
          loading={statsLoading}
          color="text-blue-500"
        />
        <StatsCard
          title="Entregues"
          value={stats?.delivered ?? 0}
          icon={<CheckCheck className="h-4 w-4" />}
          loading={statsLoading}
          color="text-green-500"
        />
        <StatsCard
          title="Lidos"
          value={stats?.read ?? 0}
          icon={<Eye className="h-4 w-4" />}
          loading={statsLoading}
          color="text-emerald-600"
        />
        <StatsCard
          title="Falhas"
          value={stats?.failed ?? 0}
          icon={<XCircle className="h-4 w-4" />}
          loading={statsLoading}
          color="text-red-500"
        />
        <StatsCard
          title="Recebidos"
          value={stats?.inbound ?? 0}
          icon={<ArrowDownLeft className="h-4 w-4" />}
          loading={statsLoading}
          color="text-purple-500"
        />
      </div>

      {/* Webhook Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Webhook</CardTitle>
          <CardDescription className="font-body">
            Configure este URL no Meta Business Manager para receber atualizações de status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
              {window.location.origin}/api/webhooks/whatsapp
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/whatsapp`);
                toast.success("URL copiada!");
              }}
            >
              Copiar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-body">
            Verify Token: <code className="bg-muted px-1 py-0.5 rounded">emc_whatsapp_verify_2024</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  loading,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground font-body">{title}</span>
          <span className={color ?? "text-muted-foreground"}>{icon}</span>
        </div>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <p className="text-2xl font-display font-bold">{value.toLocaleString("pt-BR")}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════
// MESSAGES TAB — Log with pagination and filters
// ══════════════════════════════════════════════════════════════

function MessagesTab() {
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState<"all" | "outbound" | "inbound">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "sent" | "delivered" | "read" | "failed">("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = trpc.whatsapp.messages.useQuery({
    page,
    pageSize: 20,
    direction,
    status: statusFilter,
    search: search || undefined,
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por telefone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>

        <Select value={direction} onValueChange={(v) => { setDirection(v as typeof direction); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="outbound">Enviadas</SelectItem>
            <SelectItem value="inbound">Recebidas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="read">Lido</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">Dir</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="max-w-[300px]">Mensagem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : !data?.messages?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground font-body">
                    Nenhuma mensagem encontrada
                  </TableCell>
                </TableRow>
              ) : (
                data.messages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell>
                      {msg.direction === "outbound" ? (
                        <ArrowUpRight className="h-4 w-4 text-blue-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-purple-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{msg.phoneNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {msg.messageType === "template" ? "Template" : "Texto"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm">
                      {msg.body ? (
                        msg.body.length > 80
                          ? msg.body.substring(0, 80) + "..."
                          : msg.body
                      ) : (
                        <span className="text-muted-foreground italic">
                          {msg.templateName ?? "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <MessageStatusBadge status={msg.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {msg.triggerEvent ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-body">
            {data.pagination.total} mensagens • Página {data.pagination.page} de {data.pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SEND TAB — Manual message sending
// ══════════════════════════════════════════════════════════════

function SendTab() {
  const utils = trpc.useUtils();
  const { data: status } = trpc.whatsapp.status.useQuery();

  const [sendType, setSendType] = useState<"text" | "template">("text");
  const [phone, setPhone] = useState("");
  const [textBody, setTextBody] = useState("");
  const [templateName, setTemplateName] = useState("");

  const sendTextMutation = trpc.whatsapp.sendText.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada com sucesso!");
      setPhone("");
      setTextBody("");
      utils.whatsapp.messages.invalidate();
      utils.whatsapp.stats.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const sendTemplateMutation = trpc.whatsapp.sendTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template enviado com sucesso!");
      setPhone("");
      setTemplateName("");
      utils.whatsapp.messages.invalidate();
      utils.whatsapp.stats.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const handleSend = () => {
    if (!phone.trim()) {
      toast.error("Informe o número de telefone");
      return;
    }

    if (sendType === "text") {
      if (!textBody.trim()) {
        toast.error("Informe o texto da mensagem");
        return;
      }
      sendTextMutation.mutate({ to: phone.trim(), body: textBody.trim() });
    } else {
      if (!templateName.trim()) {
        toast.error("Informe o nome do template");
        return;
      }
      sendTemplateMutation.mutate({
        to: phone.trim(),
        templateName: templateName.trim(),
        languageCode: "pt_BR",
      });
    }
  };

  const isSending = sendTextMutation.isPending || sendTemplateMutation.isPending;

  return (
    <div className="max-w-2xl space-y-6">
      {!status?.configured && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-semibold">WhatsApp não configurado</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-body">
              Configure as credenciais da API para enviar mensagens. Enquanto não configurado, as mensagens serão enviadas como notificação para o admin.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Enviar Mensagem</CardTitle>
          <CardDescription className="font-body">
            Envie uma mensagem WhatsApp manualmente para um número específico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label className="font-body">Número de Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="5511999999999 (com código do país)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground font-body">
              Formato: código do país + DDD + número (sem espaços ou traços)
            </p>
          </div>

          {/* Message Type */}
          <div className="space-y-2">
            <Label className="font-body">Tipo de Mensagem</Label>
            <Select value={sendType} onValueChange={(v) => setSendType(v as "text" | "template")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto Livre</SelectItem>
                <SelectItem value="template">Template Aprovado (Meta)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message Content */}
          {sendType === "text" ? (
            <div className="space-y-2">
              <Label className="font-body">Mensagem</Label>
              <Textarea
                placeholder="Digite a mensagem..."
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground font-body">
                Mensagens de texto livre só podem ser enviadas dentro de uma janela de 24h após o cliente enviar uma mensagem.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="font-body">Nome do Template (Meta)</Label>
              <Input
                placeholder="emc_stage_em_transito"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground font-body">
                Use o nome exato do template aprovado no Meta Business Manager. Templates podem ser enviados a qualquer momento.
              </p>
            </div>
          )}

          <Button onClick={handleSend} disabled={isSending} className="w-full">
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Template Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Templates Automáticos</CardTitle>
          <CardDescription className="font-body">
            Templates que são enviados automaticamente pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: "emc_tracking_code_approved", desc: "Quando código de rastreio é aprovado" },
              { name: "emc_stage_aguardando_embarque", desc: "Mudança para Aguardando Embarque" },
              { name: "emc_stage_em_transito", desc: "Mudança para Em Trânsito" },
              { name: "emc_stage_fase_documental", desc: "Mudança para Fase Documental" },
              { name: "emc_stage_em_desembaraco", desc: "Mudança para Em Desembaraço" },
              { name: "emc_stage_concluido", desc: "Mudança para Concluído" },
            ].map((t) => (
              <div key={t.name} className="flex items-center justify-between py-2 px-3 rounded bg-muted/50">
                <code className="text-xs font-mono">{t.name}</code>
                <span className="text-xs text-muted-foreground font-body">{t.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-body">
            Estes nomes devem ser criados e aprovados no Meta Business Manager com o mesmo nome exato.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
