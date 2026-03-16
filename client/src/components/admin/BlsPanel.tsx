/**
 * BLs Panel — Admin panel for managing Bills of Lading.
 * Supports listing, creating, editing, status transitions, tracking management,
 * manual linking (Customer ↔ Vehicle ↔ BL), and quick-add customer.
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
import { Separator } from "@/components/ui/separator";
import {
  Ship,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Anchor,
  ShieldCheck,
  Truck,
  CheckCircle2,
  FileText,
  Link2,
  Unlink,
  UserPlus,
  Car,
  Users,
  X,
  AlertTriangle,
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
                {bls.map((bl) => {
                  const etaFuture = bl.estimatedArrival && new Date(bl.estimatedArrival) > new Date();
                  const statusInconsistent = etaFuture && ["arrived", "customs", "delivered"].includes(bl.status);
                  return (
                  <TableRow key={bl.id} className={statusInconsistent ? "bg-yellow-500/5" : ""}>
                    <TableCell className="font-mono font-medium text-sm">
                      <div className="flex items-center gap-1.5">
                        {bl.blNumber}
                        {statusInconsistent && (
                          <span title="Status inconsistente: marcado como chegou mas ETA é futura"><AlertTriangle className="w-3.5 h-3.5 text-yellow-400" /></span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <StatusBadge status={bl.status} />
                        {statusInconsistent && (
                          <span className="text-[10px] text-yellow-400 font-body">⚠ ETA futura</span>
                        )}
                      </div>
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
                  );
                })}
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

// ── Edit BL Dialog (with Manual Linking + Quick-Add Customer) ──
function EditBlDialog({ blId, open, onClose }: { blId: number; open: boolean; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data: bl, isLoading } = trpc.bls.getById.useQuery({ id: blId });

  // Linked vehicles (N:N junction)
  const { data: blVehicles, isLoading: loadingVehicles } = trpc.bls.getVehicles.useQuery({ blId });

  // All customers and vehicles for linking dropdowns
  const { data: allCustomers } = trpc.customers.listAll.useQuery();
  const { data: allVehicles } = trpc.vehicles.listAll.useQuery();

  const [form, setForm] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Linking state
  const [linkVehicleId, setLinkVehicleId] = useState<string>("");
  const [linkCustomerId, setLinkCustomerId] = useState<string>("");

  // Quick-add customer state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    fullName: "",
    cpf: "",
    cnpj: "",
    documentType: "cpf" as "cpf" | "cnpj",
    email: "",
    phone: "",
    tipoOperacao: "importacao" as "importacao" | "exportacao",
  });

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

  const statusMutation = trpc.bls.forceUpdateStatus.useMutation({
    onSuccess: () => {
      utils.bls.list.invalidate();
      utils.bls.getById.invalidate({ id: blId });
      toast.success("Status atualizado!");
    },
    onError: (err) => toast.error(err.message),
  });

  // ── Linking mutations ──────────────────────────────────────
  const addVehicleMutation = trpc.bls.addVehicle.useMutation({
    onSuccess: () => {
      utils.bls.getVehicles.invalidate({ blId });
      utils.bls.getById.invalidate({ id: blId });
      setLinkVehicleId("");
      setLinkCustomerId("");
      toast.success("Veículo vinculado ao BL!");
    },
    onError: (err) => toast.error(err.message),
  });

  const removeVehicleMutation = trpc.bls.removeVehicle.useMutation({
    onSuccess: () => {
      utils.bls.getVehicles.invalidate({ blId });
      utils.bls.getById.invalidate({ id: blId });
      toast.success("Veículo desvinculado do BL.");
    },
    onError: (err) => toast.error(err.message),
  });

  // ── Update main customer on BL ─────────────────────────────
  const linkBlCustomerMutation = trpc.bls.update.useMutation({
    onSuccess: () => {
      utils.bls.getById.invalidate({ id: blId });
      utils.bls.list.invalidate();
      toast.success("Cliente vinculado ao BL!");
    },
    onError: (err) => toast.error(err.message),
  });

  // ── Quick-add customer mutation ────────────────────────────
  const createCustomerMutation = trpc.customers.create.useMutation({
    onSuccess: (newCustomer) => {
      utils.customers.listAll.invalidate();
      // Auto-link the new customer to this BL
      linkBlCustomerMutation.mutate({
        id: blId,
        data: { customerId: newCustomer.id },
      });
      setShowQuickAdd(false);
      setQuickAddForm({
        fullName: "",
        cpf: "",
        cnpj: "",
        documentType: "cpf",
        email: "",
        phone: "",
        tipoOperacao: "importacao",
      });
      toast.success(`Cliente "${newCustomer.fullName}" criado e vinculado!`);
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

  function handleAddVehicle() {
    if (!linkVehicleId) {
      toast.error("Selecione um veículo para vincular.");
      return;
    }
    addVehicleMutation.mutate({
      blId,
      vehicleId: parseInt(linkVehicleId),
      customerId: linkCustomerId ? parseInt(linkCustomerId) : undefined,
    });
  }

  function handleQuickAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!quickAddForm.fullName.trim() || !quickAddForm.cpf.trim()) {
      toast.error("Nome e CPF são obrigatórios.");
      return;
    }
    createCustomerMutation.mutate({
      fullName: quickAddForm.fullName.trim(),
      cpf: quickAddForm.cpf.trim(),
      cnpj: quickAddForm.documentType === "cnpj" && quickAddForm.cnpj.trim()
        ? quickAddForm.cnpj.trim()
        : undefined,
      documentType: quickAddForm.documentType,
      email: quickAddForm.email.trim() || undefined,
      phone: quickAddForm.phone.trim() || undefined,
      tipoOperacao: quickAddForm.tipoOperacao,
      dataSource: "manual",
      status: "aguardando_embarque",
    });
  }

  // All available statuses for force-update (admin can go to any status)
  const ALL_STATUSES = ["draft", "final", "in_transit", "arrived", "customs", "delivered"];
  const otherStatuses = bl ? ALL_STATUSES.filter((s) => s !== bl.status) : [];

  // Find linked customer/vehicle names for display
  const linkedCustomer = bl?.customerId && allCustomers
    ? allCustomers.find((c: any) => c.id === bl.customerId)
    : null;

  // Filter out already-linked vehicles from dropdown
  const linkedVehicleIds = new Set((blVehicles ?? []).map((bv: any) => bv.vehicleId));
  const availableVehicles = (allVehicles ?? []).filter((v: any) => !linkedVehicleIds.has(v.id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            {/* ═══ Status Section — Force Update ═══ */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-display text-sm">Status Atual</Label>
                <StatusBadge status={bl.status} />
              </div>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Altere o status manualmente para qualquer etapa:
                </p>
                {/* ETA inconsistency warning */}
                {bl.estimatedArrival && new Date(bl.estimatedArrival) > new Date() && ["arrived", "customs", "delivered"].includes(bl.status) && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs mb-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      <strong>Status inconsistente:</strong> Este BL está marcado como "{STATUS_MAP[bl.status]?.label}" mas a ETA ({new Date(bl.estimatedArrival).toLocaleDateString("pt-BR")}) ainda é futura. Considere retroceder para "Em Trânsito".
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {otherStatuses.map((s) => {
                    const config = STATUS_MAP[s];
                    const statusIndex = ALL_STATUSES.indexOf(s);
                    const currentIndex = ALL_STATUSES.indexOf(bl.status);
                    const isForward = statusIndex > currentIndex;
                    const Icon = config?.icon ?? Package;
                    // Warn if target is arrived/customs/delivered but ETA is future
                    const etaFutureWarning = ["arrived", "customs", "delivered"].includes(s)
                      && bl.estimatedArrival
                      && new Date(bl.estimatedArrival) > new Date();
                    return (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        className={`text-xs gap-1.5 ${
                          etaFutureWarning
                            ? "border-red-500/40 hover:bg-red-500/10 text-red-400"
                            : isForward
                              ? "border-green-500/40 hover:bg-green-500/10 text-green-400"
                              : "border-yellow-500/40 hover:bg-yellow-500/10 text-yellow-400"
                        }`}
                        onClick={() => {
                          const direction = isForward ? "avançar" : "retroceder";
                          let warningMsg = `Tem certeza que deseja ${direction} o status para "${config?.label ?? s}"?`;
                          if (etaFutureWarning) {
                            warningMsg = `⚠️ ATENÇÃO: A ETA deste BL (${new Date(bl.estimatedArrival!).toLocaleDateString("pt-BR")}) ainda é futura!\n\n${warningMsg}`;
                          }
                          const reason = prompt(warningMsg + "\n\nInforme o motivo da alteração:");
                          if (reason !== null) {
                            statusMutation.mutate({ id: blId, status: s as any, reason: reason || undefined });
                          }
                        }}
                        disabled={statusMutation.isPending}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {etaFutureWarning ? "⚠" : isForward ? "▶" : "◀"} {config?.label ?? s}
                      </Button>
                    );
                  })}
                </div>
                {statusMutation.isPending && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Atualizando status...
                  </div>
                )}
              </div>
            </div>

            {/* ═══ Manual Linking Section — Customer ═══ */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <Label className="font-display text-sm">Cliente Vinculado</Label>
              </div>

              {linkedCustomer ? (
                <div className="flex items-center justify-between p-3 rounded-md bg-background border border-border">
                  <div>
                    <p className="font-body text-sm font-medium">{linkedCustomer.fullName}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {linkedCustomer.documentType === "cnpj" && linkedCustomer.cnpj
                        ? `CNPJ: ${linkedCustomer.cnpj}`
                        : `CPF: ${linkedCustomer.cpf}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm("Desvincular este cliente do BL?")) {
                        linkBlCustomerMutation.mutate({
                          id: blId,
                          data: { customerId: null },
                        });
                      }
                    }}
                    disabled={linkBlCustomerMutation.isPending}
                  >
                    <Unlink className="w-4 h-4 mr-1" />
                    Desvincular
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Nenhum cliente vinculado. Selecione um existente ou crie um novo:
                  </p>
                  <div className="flex gap-2">
                    <Select
                      value={linkCustomerId || "none"}
                      onValueChange={(v) => setLinkCustomerId(v === "none" ? "" : v)}
                    >
                      <SelectTrigger className="flex-1 font-body">
                        <SelectValue placeholder="Selecionar cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Selecionar cliente...</SelectItem>
                        {(allCustomers ?? []).map((c: any) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.fullName} ({c.documentType === "cnpj" ? "CNPJ" : "CPF"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      disabled={!linkCustomerId || linkBlCustomerMutation.isPending}
                      onClick={() => {
                        if (linkCustomerId) {
                          linkBlCustomerMutation.mutate({
                            id: blId,
                            data: { customerId: parseInt(linkCustomerId) },
                          });
                          setLinkCustomerId("");
                        }
                      }}
                    >
                      {linkBlCustomerMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Link2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Quick-Add Customer Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    {showQuickAdd ? "Cancelar Cadastro Rápido" : "Cadastrar Novo Cliente"}
                  </Button>

                  {/* Quick-Add Customer Form */}
                  {showQuickAdd && (
                    <form onSubmit={handleQuickAddCustomer} className="space-y-3 p-3 rounded-md bg-background border border-border">
                      <p className="text-xs font-display font-semibold text-primary">
                        Cadastro Rápido de Cliente
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Label className="text-xs font-body">Nome Completo *</Label>
                          <Input
                            value={quickAddForm.fullName}
                            onChange={(e) => setQuickAddForm({ ...quickAddForm, fullName: e.target.value })}
                            placeholder="João da Silva"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-body">Tipo Documento</Label>
                          <Select
                            value={quickAddForm.documentType}
                            onValueChange={(v: "cpf" | "cnpj") => setQuickAddForm({ ...quickAddForm, documentType: v })}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cpf">CPF (Pessoa Física)</SelectItem>
                              <SelectItem value="cnpj">CNPJ (Pessoa Jurídica)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs font-body">CPF *</Label>
                          <Input
                            value={quickAddForm.cpf}
                            onChange={(e) => setQuickAddForm({ ...quickAddForm, cpf: e.target.value })}
                            placeholder="000.000.000-00"
                            className="h-8 text-sm font-mono"
                          />
                        </div>
                        {quickAddForm.documentType === "cnpj" && (
                          <div className="col-span-2">
                            <Label className="text-xs font-body">CNPJ</Label>
                            <Input
                              value={quickAddForm.cnpj}
                              onChange={(e) => setQuickAddForm({ ...quickAddForm, cnpj: e.target.value })}
                              placeholder="00.000.000/0000-00"
                              className="h-8 text-sm font-mono"
                            />
                          </div>
                        )}
                        <div>
                          <Label className="text-xs font-body">Email</Label>
                          <Input
                            type="email"
                            value={quickAddForm.email}
                            onChange={(e) => setQuickAddForm({ ...quickAddForm, email: e.target.value })}
                            placeholder="email@exemplo.com"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-body">Telefone</Label>
                          <Input
                            value={quickAddForm.phone}
                            onChange={(e) => setQuickAddForm({ ...quickAddForm, phone: e.target.value })}
                            placeholder="(11) 99999-9999"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-body">Operação</Label>
                          <Select
                            value={quickAddForm.tipoOperacao}
                            onValueChange={(v: "importacao" | "exportacao") => setQuickAddForm({ ...quickAddForm, tipoOperacao: v })}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="importacao">Importação</SelectItem>
                              <SelectItem value="exportacao">Exportação</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full"
                        disabled={createCustomerMutation.isPending}
                      >
                        {createCustomerMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4 mr-1" />
                        )}
                        Criar e Vincular
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* ═══ Manual Linking Section — Vehicles (N:N) ═══ */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-4">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                <Label className="font-display text-sm">Veículos Vinculados</Label>
                <Badge variant="outline" className="text-xs ml-auto">
                  {blVehicles?.length ?? 0}
                </Badge>
              </div>

              {/* Current linked vehicles */}
              {loadingVehicles ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : (blVehicles ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Nenhum veículo vinculado a este BL.
                </p>
              ) : (
                <div className="space-y-2">
                  {(blVehicles ?? []).map((bv: any) => {
                    const vehicle = (allVehicles ?? []).find((v: any) => v.id === bv.vehicleId);
                    const customer = bv.customerId
                      ? (allCustomers ?? []).find((c: any) => c.id === bv.customerId)
                      : null;
                    return (
                      <div
                        key={bv.id}
                        className="flex items-center justify-between p-2.5 rounded-md bg-background border border-border"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs font-medium truncate">
                            {vehicle ? `${vehicle.make ?? ""} ${vehicle.model ?? ""} — ${vehicle.vin}` : `Veículo #${bv.vehicleId}`}
                          </p>
                          {customer && (
                            <p className="text-xs text-muted-foreground truncate">
                              Cliente: {customer.fullName}
                            </p>
                          )}
                          {bv.notes && (
                            <p className="text-xs text-muted-foreground italic truncate">
                              {bv.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive shrink-0"
                          onClick={() => {
                            if (confirm("Desvincular este veículo do BL?")) {
                              removeVehicleMutation.mutate({ blId, vehicleId: bv.vehicleId });
                            }
                          }}
                          disabled={removeVehicleMutation.isPending}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add vehicle form */}
              <Separator />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Vincular novo veículo:</p>
                <div className="flex gap-2">
                  <Select
                    value={linkVehicleId || "none"}
                    onValueChange={(v) => setLinkVehicleId(v === "none" ? "" : v)}
                  >
                    <SelectTrigger className="flex-1 font-body text-sm">
                      <SelectValue placeholder="Selecionar veículo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Selecionar veículo...</SelectItem>
                      {availableVehicles.map((v: any) => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.make ?? ""} {v.model ?? ""} — {v.vin}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={!linkVehicleId || addVehicleMutation.isPending}
                    onClick={handleAddVehicle}
                  >
                    {addVehicleMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {linkVehicleId && (
                  <div>
                    <Label className="text-xs font-body text-muted-foreground">
                      Cliente dono deste veículo (opcional):
                    </Label>
                    <Select
                      value={linkCustomerId || "none"}
                      onValueChange={(v) => setLinkCustomerId(v === "none" ? "" : v)}
                    >
                      <SelectTrigger className="font-body text-sm mt-1">
                        <SelectValue placeholder="Nenhum (sem cliente)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum (sem cliente)</SelectItem>
                        {(allCustomers ?? []).map((c: any) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* ═══ Edit Form ═══ */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Separator />
              <Label className="font-display text-sm">Dados do BL</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="font-body text-xs">Número do BL</Label>
                  <Input
                    value={form.blNumber ?? ""}
                    onChange={(e) => setForm({ ...form, blNumber: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label className="font-body text-xs">Porto de Origem</Label>
                  <Input
                    value={form.originPort ?? ""}
                    onChange={(e) => setForm({ ...form, originPort: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="font-body text-xs">Porto de Destino</Label>
                  <Input
                    value={form.destinationPort ?? ""}
                    onChange={(e) => setForm({ ...form, destinationPort: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="font-body text-xs">Container</Label>
                  <Input
                    value={form.containerNumber ?? ""}
                    onChange={(e) => setForm({ ...form, containerNumber: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label className="font-body text-xs">Veículo</Label>
                  <Input
                    value={form.vehicleDescription ?? ""}
                    onChange={(e) => setForm({ ...form, vehicleDescription: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="font-body text-xs">ETD</Label>
                  <Input
                    type="date"
                    value={form.estimatedDeparture ?? ""}
                    onChange={(e) => setForm({ ...form, estimatedDeparture: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="font-body text-xs">ETA</Label>
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
