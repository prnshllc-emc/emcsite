/**
 * BLs Panel — Admin panel for managing Bills of Lading.
 * Supports listing, creating, editing, status transitions, and tracking management.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Ship,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Anchor,
  ShieldCheck,
  Truck,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

// ── Status config ───────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Rascunho", color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: Package },
  final: { label: "BL Final", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: CheckCircle2 },
  in_transit: { label: "Em Trânsito", color: "bg-primary/20 text-primary border-primary/30", icon: Ship },
  arrived: { label: "No Porto", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: Anchor },
  customs: { label: "Alfândega", color: "bg-orange-500/20 text-orange-300 border-orange-500/30", icon: ShieldCheck },
  delivered: { label: "Entregue", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: Truck },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.draft;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} font-body text-xs gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

export default function BlsPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBl, setEditingBl] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const queryInput = useMemo(
    () => ({
      page,
      limit: 15,
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter as any : undefined,
    }),
    [page, search, statusFilter]
  );

  const { data, isLoading } = trpc.bls.list.useQuery(queryInput);

  const deleteMutation = trpc.bls.delete.useMutation({
    onSuccess: () => {
      utils.bls.list.invalidate();
      toast.success("BL removido com sucesso.");
    },
    onError: (err) => toast.error(err.message),
  });

  const bls = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Bills of Lading
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            Gerencie os conhecimentos de embarque e acompanhe o status de cada envio.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Novo BL
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por BL, container, porto..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 font-body"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px] font-body">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="final">BL Final</SelectItem>
            <SelectItem value="in_transit">Em Trânsito</SelectItem>
            <SelectItem value="arrived">No Porto</SelectItem>
            <SelectItem value="customs">Alfândega</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : bls.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ship className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-display font-semibold">Nenhum BL encontrado</p>
            <p className="text-muted-foreground font-body mt-1">
              Crie o primeiro BL para começar a rastrear envios.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-display">BL</TableHead>
                  <TableHead className="font-display">Status</TableHead>
                  <TableHead className="font-display hidden md:table-cell">Origem</TableHead>
                  <TableHead className="font-display hidden md:table-cell">Destino</TableHead>
                  <TableHead className="font-display hidden lg:table-cell">Container</TableHead>
                  <TableHead className="font-display hidden lg:table-cell">ETA</TableHead>
                  <TableHead className="font-display text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bls.map((bl) => (
                  <TableRow key={bl.id}>
                    <TableCell className="font-mono font-medium text-sm">
                      {bl.blNumber}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={bl.status} />
                    </TableCell>
                    <TableCell className="font-body text-muted-foreground hidden md:table-cell text-sm">
                      {bl.originPort ?? "—"}
                    </TableCell>
                    <TableCell className="font-body text-muted-foreground hidden md:table-cell text-sm">
                      {bl.destinationPort ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground hidden lg:table-cell text-xs">
                      {bl.containerNumber ?? "—"}
                    </TableCell>
                    <TableCell className="font-body text-muted-foreground hidden lg:table-cell text-sm">
                      {bl.estimatedArrival
                        ? new Date(bl.estimatedArrival).toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingBl(bl.id)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja remover este BL?")) {
                              deleteMutation.mutate({ id: bl.id });
                            }
                          }}
                          className="text-destructive hover:text-destructive"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground font-body">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateBlDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {/* Edit Dialog */}
      {editingBl !== null && (
        <EditBlDialog
          blId={editingBl}
          open={true}
          onClose={() => setEditingBl(null)}
        />
      )}
    </div>
  );
}

// ── Create BL Dialog ────────────────────────────────────────
function CreateBlDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    blNumber: "",
    portOfLoading: "",
    portOfDischarge: "",
    containerNumber: "",
    cargoDescription: "",
    etd: "",
    eta: "",
    notes: "",
  });

  const createMutation = trpc.bls.create.useMutation({
    onSuccess: () => {
      utils.bls.list.invalidate();
      toast.success("BL criado com sucesso!");
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.blNumber.trim()) {
      toast.error("Número do BL é obrigatório.");
      return;
    }
    createMutation.mutate({
      blNumber: form.blNumber.trim(),
      portOfLoading: form.portOfLoading || undefined,
      portOfDischarge: form.portOfDischarge || undefined,
      containerNumber: form.containerNumber || undefined,
      cargoDescription: form.cargoDescription || undefined,
      etd: form.etd || undefined,
      eta: form.eta || undefined,
      notes: form.notes || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Novo Bill of Lading</DialogTitle>
          <DialogDescription className="font-body">
            Cadastre um novo BL para iniciar o rastreamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label className="font-body">Número do BL *</Label>
              <Input
                value={form.blNumber}
                onChange={(e) => setForm({ ...form, blNumber: e.target.value })}
                placeholder="MEDU1234567"
                className="font-mono"
              />
            </div>
            <div>
              <Label className="font-body">Porto de Origem</Label>
              <Input
                value={form.portOfLoading}
                onChange={(e) => setForm({ ...form, portOfLoading: e.target.value })}
                placeholder="Miami, FL"
              />
            </div>
            <div>
              <Label className="font-body">Porto de Destino</Label>
              <Input
                value={form.portOfDischarge}
                onChange={(e) => setForm({ ...form, portOfDischarge: e.target.value })}
                placeholder="Itajaí, SC"
              />
            </div>
            <div>
              <Label className="font-body">Container</Label>
              <Input
                value={form.containerNumber}
                onChange={(e) => setForm({ ...form, containerNumber: e.target.value })}
                placeholder="MSKU1234567"
                className="font-mono"
              />
            </div>
            <div>
              <Label className="font-body">Descrição do Veículo</Label>
              <Input
                value={form.cargoDescription}
                onChange={(e) => setForm({ ...form, cargoDescription: e.target.value })}
                placeholder="BMW M3 2024 Preto"
              />
            </div>
            <div>
              <Label className="font-body">ETD (Partida Prevista)</Label>
              <Input
                type="date"
                value={form.etd}
                onChange={(e) => setForm({ ...form, etd: e.target.value })}
              />
            </div>
            <div>
              <Label className="font-body">ETA (Chegada Prevista)</Label>
              <Input
                type="date"
                value={form.eta}
                onChange={(e) => setForm({ ...form, eta: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label className="font-body">Observações</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notas adicionais..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Criar BL
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit BL Dialog ──────────────────────────────────────────
function EditBlDialog({ blId, open, onClose }: { blId: number; open: boolean; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data: bl, isLoading } = trpc.bls.getById.useQuery({ id: blId });

  const [form, setForm] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Initialize form when data loads
  if (bl && !initialized) {
    setForm({
      blNumber: bl.blNumber,
      originPort: bl.originPort ?? "",
      destinationPort: bl.destinationPort ?? "",
      containerNumber: bl.containerNumber ?? "",
      vehicleDescription: bl.vehicleDescription ?? "",
      estimatedDeparture: bl.estimatedDeparture
        ? new Date(bl.estimatedDeparture).toISOString().split("T")[0]
        : "",
      estimatedArrival: bl.estimatedArrival
        ? new Date(bl.estimatedArrival).toISOString().split("T")[0]
        : "",
    });
    setInitialized(true);
  }

  const updateMutation = trpc.bls.update.useMutation({
    onSuccess: () => {
      utils.bls.list.invalidate();
      utils.bls.getById.invalidate({ id: blId });
      toast.success("BL atualizado com sucesso!");
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const statusMutation = trpc.bls.updateStatus.useMutation({
    onSuccess: () => {
      utils.bls.list.invalidate();
      utils.bls.getById.invalidate({ id: blId });
      toast.success("Status atualizado!");
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({
      id: blId,
      data: {
        blNumber: form.blNumber,
        portOfLoading: form.originPort || undefined,
        portOfDischarge: form.destinationPort || undefined,
        containerNumber: form.containerNumber || undefined,
        cargoDescription: form.vehicleDescription || undefined,
        etd: form.estimatedDeparture || undefined,
        eta: form.estimatedArrival || undefined,
      },
    });
  }

  // Status transition options
  const TRANSITIONS: Record<string, string[]> = {
    draft: ["final", "in_transit"],
    final: ["in_transit"],
    in_transit: ["arrived"],
    arrived: ["customs"],
    customs: ["delivered"],
    delivered: [],
  };

  const nextStatuses = bl ? (TRANSITIONS[bl.status] ?? []) : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Editar BL</DialogTitle>
          <DialogDescription className="font-body">
            {bl ? `BL: ${bl.blNumber}` : "Carregando..."}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !bl ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Section */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-display text-sm">Status Atual</Label>
                <StatusBadge status={bl.status} />
              </div>
              {nextStatuses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground self-center">Avançar para:</span>
                  {nextStatuses.map((s) => {
                    const config = STATUS_MAP[s];
                    return (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => statusMutation.mutate({ id: blId, status: s as any })}
                        disabled={statusMutation.isPending}
                      >
                        {config?.label ?? s}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="font-body">Número do BL</Label>
                  <Input
                    value={form.blNumber ?? ""}
                    onChange={(e) => setForm({ ...form, blNumber: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label className="font-body">Porto de Origem</Label>
                  <Input
                    value={form.originPort ?? ""}
                    onChange={(e) => setForm({ ...form, originPort: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="font-body">Porto de Destino</Label>
                  <Input
                    value={form.destinationPort ?? ""}
                    onChange={(e) => setForm({ ...form, destinationPort: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="font-body">Container</Label>
                  <Input
                    value={form.containerNumber ?? ""}
                    onChange={(e) => setForm({ ...form, containerNumber: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label className="font-body">Veículo</Label>
                  <Input
                    value={form.vehicleDescription ?? ""}
                    onChange={(e) => setForm({ ...form, vehicleDescription: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="font-body">ETD</Label>
                  <Input
                    type="date"
                    value={form.estimatedDeparture ?? ""}
                    onChange={(e) => setForm({ ...form, estimatedDeparture: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="font-body">ETA</Label>
                  <Input
                    type="date"
                    value={form.estimatedArrival ?? ""}
                    onChange={(e) => setForm({ ...form, estimatedArrival: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
