/**
 * Tracking Panel — Admin panel for managing tracking codes and events.
 * Supports generating codes, viewing history, and adding events.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  QrCode,
  Plus,
  Loader2,
  Search,
  Copy,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function TrackingPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          Rastreamento
        </h2>
        <p className="text-sm text-muted-foreground font-body">
          Gerencie códigos de rastreio e eventos de tracking.
        </p>
      </div>

      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="codes" className="font-display text-xs">
            <QrCode className="w-3.5 h-3.5 mr-1" />
            Códigos
          </TabsTrigger>
          <TabsTrigger value="events" className="font-display text-xs">
            <History className="w-3.5 h-3.5 mr-1" />
            Eventos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="codes">
          <CodesSubPanel />
        </TabsContent>

        <TabsContent value="events">
          <EventsSubPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Tracking Codes Sub-Panel ────────────────────────────────
function CodesSubPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);

  const utils = trpc.useUtils();

  const queryInput = useMemo(
    () => ({ page, limit: 15, search: search || undefined }),
    [page, search]
  );

  const { data, isLoading } = trpc.tracking.listCodes.useQuery(queryInput);

  const deactivateMutation = trpc.tracking.deactivateCode.useMutation({
    onSuccess: () => {
      utils.tracking.listCodes.invalidate();
      toast.success("Código desativado.");
    },
    onError: (err) => toast.error(err.message),
  });

  const codes = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar código..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 font-body"
          />
        </div>
        <Button onClick={() => setShowGenerate(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Gerar Código
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : codes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-display font-semibold">Nenhum código gerado</p>
            <p className="text-muted-foreground font-body mt-1">
              Gere um código de rastreio para um BL existente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-display">Código</TableHead>
                  <TableHead className="font-display">BL ID</TableHead>
                  <TableHead className="font-display hidden md:table-cell">Cliente ID</TableHead>
                  <TableHead className="font-display hidden md:table-cell">Status</TableHead>
                  <TableHead className="font-display hidden lg:table-cell">Usos</TableHead>
                  <TableHead className="font-display hidden lg:table-cell">Expira</TableHead>
                  <TableHead className="font-display text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((tc) => (
                  <TableRow key={tc.id}>
                    <TableCell className="font-mono font-medium text-sm">
                      {tc.code}
                    </TableCell>
                    <TableCell className="font-body text-sm">{tc.blId}</TableCell>
                    <TableCell className="font-body text-sm hidden md:table-cell">
                      {tc.customerId}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={
                          tc.isActive
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                        }
                      >
                        {tc.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground hidden lg:table-cell">
                      {tc.usedCount}
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground hidden lg:table-cell">
                      {new Date(tc.expiresAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(tc.code)}
                          title="Copiar código"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {tc.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deactivateMutation.mutate({ id: tc.id })}
                            className="text-destructive hover:text-destructive"
                            title="Desativar"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground font-body">
            Página {page} de {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {showGenerate && (
        <GenerateCodeDialog open={showGenerate} onClose={() => setShowGenerate(false)} />
      )}
    </div>
  );
}

// ── Generate Code Dialog ────────────────────────────────────
function GenerateCodeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const utils = trpc.useUtils();
  const [blId, setBlId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("90");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const generateMutation = trpc.tracking.generateCode.useMutation({
    onSuccess: (data) => {
      utils.tracking.listCodes.invalidate();
      setGeneratedCode(data.code);
      toast.success("Código gerado com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const blIdNum = parseInt(blId);
    const customerIdNum = parseInt(customerId);
    const days = parseInt(expiresInDays);

    if (isNaN(blIdNum) || blIdNum <= 0) {
      toast.error("ID do BL inválido.");
      return;
    }
    if (isNaN(customerIdNum) || customerIdNum <= 0) {
      toast.error("ID do Cliente inválido.");
      return;
    }

    generateMutation.mutate({
      blId: blIdNum,
      customerId: customerIdNum,
      expiresInDays: isNaN(days) ? 90 : days,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Gerar Código de Rastreio</DialogTitle>
          <DialogDescription className="font-body">
            Gere um código EMC-XXXX-XXXX-XXXX para o cliente acompanhar o envio.
          </DialogDescription>
        </DialogHeader>

        {generatedCode ? (
          <div className="space-y-4 text-center py-4">
            <p className="text-sm text-muted-foreground font-body">Código gerado:</p>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-2xl font-mono font-bold tracking-wider text-primary">
                {generatedCode}
              </p>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
                toast.success("Código copiado!");
              }}
              variant="outline"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copiar Código
            </Button>
            <DialogFooter>
              <Button onClick={onClose}>Fechar</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="font-body">ID do BL *</Label>
              <Input
                type="number"
                value={blId}
                onChange={(e) => setBlId(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <Label className="font-body">ID do Cliente *</Label>
              <Input
                type="number"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <Label className="font-body">Validade (dias)</Label>
              <Input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="90"
                min="1"
                max="365"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={generateMutation.isPending}>
                {generateMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                Gerar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Events Sub-Panel ────────────────────────────────────────
function EventsSubPanel() {
  const [blIdInput, setBlIdInput] = useState("");
  const [selectedBlId, setSelectedBlId] = useState<number | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);

  const utils = trpc.useUtils();

  const { data: events, isLoading } = trpc.tracking.listEvents.useQuery(
    { blId: selectedBlId! },
    { enabled: selectedBlId !== null }
  );

  const deleteMutation = trpc.tracking.deleteEvent.useMutation({
    onSuccess: () => {
      if (selectedBlId) utils.tracking.listEvents.invalidate({ blId: selectedBlId });
      toast.success("Evento removido.");
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const num = parseInt(blIdInput);
    if (isNaN(num) || num <= 0) {
      toast.error("ID do BL inválido.");
      return;
    }
    setSelectedBlId(num);
  }

  return (
    <div className="space-y-4">
      {/* Search by BL ID */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="number"
          placeholder="ID do BL"
          value={blIdInput}
          onChange={(e) => setBlIdInput(e.target.value)}
          className="max-w-[200px] font-body"
          min="1"
        />
        <Button type="submit" variant="outline" size="sm">
          <Search className="w-4 h-4 mr-1" />
          Buscar Eventos
        </Button>
        {selectedBlId && (
          <Button onClick={() => setShowAddEvent(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Evento
          </Button>
        )}
      </form>

      {selectedBlId === null ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-display font-semibold">Selecione um BL</p>
            <p className="text-muted-foreground font-body mt-1">
              Informe o ID do BL para visualizar e gerenciar os eventos de tracking.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !events || events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-display font-semibold">Nenhum evento</p>
            <p className="text-muted-foreground font-body mt-1">
              BL #{selectedBlId} não possui eventos de tracking ainda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-display">Status</TableHead>
                  <TableHead className="font-display">Descrição</TableHead>
                  <TableHead className="font-display hidden md:table-cell">Local</TableHead>
                  <TableHead className="font-display">Data</TableHead>
                  <TableHead className="font-display text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-body text-xs">
                        {ev.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground max-w-[200px] truncate">
                      {ev.description ?? "—"}
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground hidden md:table-cell">
                      {ev.location ?? "—"}
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground">
                      {new Date(ev.eventDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate({ id: ev.id })}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {showAddEvent && selectedBlId && (
        <AddEventDialog
          blId={selectedBlId}
          open={showAddEvent}
          onClose={() => setShowAddEvent(false)}
        />
      )}
    </div>
  );
}

// ── Add Event Dialog ────────────────────────────────────────
function AddEventDialog({
  blId,
  open,
  onClose,
}: {
  blId: number;
  open: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    eventType: "info" as string,
    title: "",
    description: "",
    location: "",
    eventDate: "",
  });

  const addMutation = trpc.tracking.addEvent.useMutation({
    onSuccess: () => {
      utils.tracking.listEvents.invalidate({ blId });
      toast.success("Evento adicionado!");
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Título é obrigatório.");
      return;
    }
    addMutation.mutate({
      blId,
      eventType: form.eventType as any,
      title: form.title.trim(),
      description: form.description || undefined,
      location: form.location || undefined,
      eventDate: form.eventDate || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Adicionar Evento</DialogTitle>
          <DialogDescription className="font-body">
            BL #{blId} — Adicione um novo evento ao histórico de tracking.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="font-body">Tipo do Evento *</Label>
            <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}>
              <SelectTrigger className="font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="final">BL Final</SelectItem>
                <SelectItem value="in_transit">Em Trânsito</SelectItem>
                <SelectItem value="arrived">Chegou ao Porto</SelectItem>
                <SelectItem value="customs">Alfândega</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="info">Informação</SelectItem>
                <SelectItem value="alert">Alerta</SelectItem>
                <SelectItem value="delay">Atraso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-body">Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Veículo embarcado"
            />
          </div>
          <div>
            <Label className="font-body">Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detalhes do evento..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-body">Local</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Miami, FL"
              />
            </div>
            <div>
              <Label className="font-body">Data do Evento</Label>
              <Input
                type="datetime-local"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
