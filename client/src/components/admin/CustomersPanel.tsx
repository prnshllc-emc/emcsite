/**
 * Customers Panel — Admin panel for managing customers.
 * Supports listing, creating, editing, status changes, and manual override tracking.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock,
  FileCheck,
  XCircle,
  CheckCircle2,
  RefreshCw,
  ArrowUpDown,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

// ── Status config ───────────────────────────────────────────
const CUSTOMER_STATUS_MAP: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  aguardando_embarque: {
    label: "Aguardando Embarque",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: Clock,
  },
  aguardando_li: {
    label: "Aguardando LI",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    icon: FileCheck,
  },
  em_processo: {
    label: "Em Processo",
    color: "bg-primary/20 text-primary border-primary/30",
    icon: RefreshCw,
  },
  concluido: {
    label: "Concluído",
    color: "bg-green-500/20 text-green-300 border-green-500/30",
    icon: CheckCircle2,
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-500/20 text-red-300 border-red-500/30",
    icon: XCircle,
  },
};

const TIPO_OPERACAO_MAP: Record<string, { label: string; color: string }> = {
  importacao: { label: "Importação", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  exportacao: { label: "Exportação", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
};

const DATA_SOURCE_MAP: Record<string, { label: string; color: string }> = {
  manual: { label: "Manual", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
  clicksign: { label: "Clicksign", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  agent: { label: "Agente IA", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
};

function CustomerStatusBadge({ status }: { status: string }) {
  const config = CUSTOMER_STATUS_MAP[status] ?? CUSTOMER_STATUS_MAP.aguardando_embarque;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} font-body text-xs gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

// ── Mask CPF for display ─────────────────────────────────────
function maskCpf(cpf: string): string {
  if (!cpf || cpf.length !== 11) return cpf;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

// ============================================================
// MAIN PANEL
// ============================================================

export default function CustomersPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const queryInput = useMemo(
    () => ({
      page,
      limit: 15,
      search: search || undefined,
      statusFilter: statusFilter !== "all" ? (statusFilter as any) : undefined,
    }),
    [page, search, statusFilter]
  );

  const { data, isLoading } = trpc.customers.list.useQuery(queryInput);

  const deactivateMutation = trpc.customers.deactivate.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      toast.success("Cliente desativado com sucesso.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateStatusMutation = trpc.customers.updateStatus.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      toast.success("Status atualizado com sucesso.");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const customers = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Clientes
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            Gerencie os clientes, status de operação e dados de contrato.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 font-body"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[220px] font-body">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="aguardando_embarque">Aguardando Embarque</SelectItem>
            <SelectItem value="aguardando_li">Aguardando LI</SelectItem>
            <SelectItem value="em_processo">Em Processo</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-display font-semibold">Nenhum cliente encontrado</p>
            <p className="text-muted-foreground font-body mt-1">
              Cadastre o primeiro cliente para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-display">Nome</TableHead>
                  <TableHead className="font-display">CPF</TableHead>
                  <TableHead className="font-display">Status</TableHead>
                  <TableHead className="font-display hidden md:table-cell">Operação</TableHead>
                  <TableHead className="font-display hidden lg:table-cell">Fonte</TableHead>
                  <TableHead className="font-display hidden lg:table-cell">Proteções</TableHead>
                  <TableHead className="font-display text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-body font-medium text-sm">
                      {c.fullName}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground text-xs">
                      {maskCpf(c.cpf)}
                    </TableCell>
                    <TableCell>
                      <CustomerStatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {c.tipoOperacao ? (
                        <Badge
                          variant="outline"
                          className={`${TIPO_OPERACAO_MAP[c.tipoOperacao]?.color ?? ""} font-body text-xs`}
                        >
                          {TIPO_OPERACAO_MAP[c.tipoOperacao]?.label ?? c.tipoOperacao}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant="outline"
                        className={`${DATA_SOURCE_MAP[c.dataSource]?.color ?? ""} font-body text-xs`}
                      >
                        {DATA_SOURCE_MAP[c.dataSource]?.label ?? c.dataSource}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {c.manualOverrides && c.manualOverrides.length > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-body text-xs gap-1"
                          title={`Campos protegidos: ${c.manualOverrides.join(", ")}`}
                        >
                          <Shield className="w-3 h-3" />
                          {c.manualOverrides.length}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick status change */}
                        <Select
                          value={c.status}
                          onValueChange={(newStatus) => {
                            updateStatusMutation.mutate({
                              id: c.id,
                              status: newStatus as any,
                            });
                          }}
                        >
                          <SelectTrigger className="w-8 h-8 p-0 border-none" title="Alterar status">
                            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aguardando_embarque">Aguardando Embarque</SelectItem>
                            <SelectItem value="aguardando_li">Aguardando LI</SelectItem>
                            <SelectItem value="em_processo">Em Processo</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCustomer(c.id)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Desativar o cliente ${c.fullName}?`)) {
                              deactivateMutation.mutate({ id: c.id });
                            }
                          }}
                          className="text-destructive hover:text-destructive"
                          title="Desativar"
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
        <CreateCustomerDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {/* Edit Dialog */}
      {editingCustomer !== null && (
        <EditCustomerDialog
          customerId={editingCustomer}
          open={true}
          onClose={() => setEditingCustomer(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// CREATE DIALOG
// ============================================================

function CreateCustomerDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    fullName: "",
    cpf: "",
    email: "",
    phone: "",
    status: "aguardando_embarque",
    tipoOperacao: "",
  });

  const createMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      toast.success("Cliente cadastrado com sucesso!");
      onClose();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!form.fullName.trim() || !form.cpf.trim()) {
      toast.error("Nome e CPF são obrigatórios.");
      return;
    }
    createMutation.mutate({
      fullName: form.fullName.trim(),
      cpf: form.cpf.replace(/\D/g, ""),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      status: form.status as any,
      tipoOperacao: form.tipoOperacao ? (form.tipoOperacao as any) : undefined,
      dataSource: "manual",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Novo Cliente
          </DialogTitle>
          <DialogDescription className="font-body">
            Cadastre um novo cliente com seus dados de contrato.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="font-display text-xs">Nome Completo *</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Ex: Paulo Sergio Carvalho dos Santos Junior"
                className="font-body"
              />
            </div>
            <div>
              <Label className="font-display text-xs">CPF *</Label>
              <Input
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                placeholder="000.000.000-00"
                className="font-body"
              />
            </div>
            <div>
              <Label className="font-display text-xs">Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+55 11 99999-9999"
                className="font-body"
              />
            </div>
            <div className="col-span-2">
              <Label className="font-display text-xs">Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="cliente@email.com"
                className="font-body"
              />
            </div>
            <div>
              <Label className="font-display text-xs">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aguardando_embarque">Aguardando Embarque</SelectItem>
                  <SelectItem value="aguardando_li">Aguardando LI</SelectItem>
                  <SelectItem value="em_processo">Em Processo</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-display text-xs">Tipo de Operação</Label>
              <Select
                value={form.tipoOperacao || "none"}
                onValueChange={(v) =>
                  setForm({ ...form, tipoOperacao: v === "none" ? "" : v })
                }
              >
                <SelectTrigger className="font-body">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não definido</SelectItem>
                  <SelectItem value="importacao">Importação</SelectItem>
                  <SelectItem value="exportacao">Exportação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Plus className="w-4 h-4 mr-1" />
            )}
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// EDIT DIALOG
// ============================================================

function EditCustomerDialog({
  customerId,
  open,
  onClose,
}: {
  customerId: number;
  open: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const { data: customer, isLoading } = trpc.customers.getById.useQuery({ id: customerId });
  const [form, setForm] = useState<{
    fullName: string;
    cpf: string;
    email: string;
    phone: string;
    status: string;
    tipoOperacao: string;
  } | null>(null);

  // Initialize form when data loads
  if (customer && !form) {
    setForm({
      fullName: customer.fullName,
      cpf: customer.cpf,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      status: customer.status,
      tipoOperacao: customer.tipoOperacao ?? "",
    });
  }

  const updateMutation = trpc.customers.update.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      utils.customers.getById.invalidate({ id: customerId });
      toast.success("Cliente atualizado com sucesso!");
      onClose();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!form) return;
    if (!form.fullName.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }

    const data: Record<string, any> = {};
    if (form.fullName !== customer?.fullName) data.fullName = form.fullName.trim();
    if (form.email !== (customer?.email ?? ""))
      data.email = form.email.trim() || null;
    if (form.phone !== (customer?.phone ?? ""))
      data.phone = form.phone.trim() || null;
    if (form.status !== customer?.status) data.status = form.status;
    if (form.tipoOperacao !== (customer?.tipoOperacao ?? ""))
      data.tipoOperacao = form.tipoOperacao || null;

    if (Object.keys(data).length === 0) {
      toast.info("Nenhuma alteração detectada.");
      onClose();
      return;
    }

    updateMutation.mutate({ id: customerId, data });
  };

  if (isLoading || !form) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Editar Cliente
          </DialogTitle>
          <DialogDescription className="font-body">
            Editar dados do cliente. Campos editados manualmente ficam protegidos contra sincronização automática.
          </DialogDescription>
        </DialogHeader>

        {/* Manual overrides indicator */}
        {customer?.manualOverrides && customer.manualOverrides.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-display">
              <Shield className="w-4 h-4" />
              Campos protegidos contra auto-sync:
              <span className="font-mono">
                {customer.manualOverrides.join(", ")}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="font-display text-xs">Nome Completo</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="font-body"
              />
            </div>
            <div>
              <Label className="font-display text-xs">CPF</Label>
              <Input
                value={maskCpf(form.cpf)}
                disabled
                className="font-mono bg-muted"
                title="CPF não pode ser alterado"
              />
            </div>
            <div>
              <Label className="font-display text-xs">Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="font-body"
              />
            </div>
            <div className="col-span-2">
              <Label className="font-display text-xs">Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="font-body"
              />
            </div>
            <div>
              <Label className="font-display text-xs">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger className="font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aguardando_embarque">Aguardando Embarque</SelectItem>
                  <SelectItem value="aguardando_li">Aguardando LI</SelectItem>
                  <SelectItem value="em_processo">Em Processo</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-display text-xs">Tipo de Operação</Label>
              <Select
                value={form.tipoOperacao || "none"}
                onValueChange={(v) =>
                  setForm({ ...form, tipoOperacao: v === "none" ? "" : v })
                }
              >
                <SelectTrigger className="font-body">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não definido</SelectItem>
                  <SelectItem value="importacao">Importação</SelectItem>
                  <SelectItem value="exportacao">Exportação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t border-border pt-3 flex flex-wrap gap-3 text-xs text-muted-foreground font-body">
            <span>
              Fonte:{" "}
              <Badge variant="outline" className={`${DATA_SOURCE_MAP[customer?.dataSource ?? "manual"]?.color} text-xs`}>
                {DATA_SOURCE_MAP[customer?.dataSource ?? "manual"]?.label}
              </Badge>
            </span>
            {customer?.createdAt && (
              <span>
                Criado: {new Date(customer.createdAt).toLocaleDateString("pt-BR")}
              </span>
            )}
            {customer?.updatedAt && (
              <span>
                Atualizado: {new Date(customer.updatedAt).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Pencil className="w-4 h-4 mr-1" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
