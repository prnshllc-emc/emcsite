/**
 * EmailTemplatesPanel — Admin CRUD for email notification templates.
 * Supports create, edit, delete, preview, and toggle active/inactive.
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Mail,
  MessageCircle,
  Search,
  Code,
  FileText,
  Copy,
  Check,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

type EmailTemplate = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  whatsappMessage: string | null;
  category: string;
  availableVariables: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: number | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  stage_change: "Mudança de Estágio",
  tracking: "Rastreamento",
  onboarding: "Onboarding",
  system: "Sistema",
  marketing: "Marketing",
};

const CATEGORY_COLORS: Record<string, string> = {
  stage_change: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  tracking: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  onboarding: "bg-green-500/10 text-green-500 border-green-500/20",
  system: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  marketing: "bg-pink-500/10 text-pink-500 border-pink-500/20",
};

// ══════════════════════════════════════════════════════════════
// MAIN PANEL
// ══════════════════════════════════════════════════════════════

export default function EmailTemplatesPanel() {
  const utils = trpc.useUtils();
  const { data: templates, isLoading } = trpc.emailTemplates.list.useQuery();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const updateMutation = trpc.emailTemplates.update.useMutation({
    onSuccess: () => {
      utils.emailTemplates.list.invalidate();
      toast.success("Template atualizado!");
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const deleteMutation = trpc.emailTemplates.delete.useMutation({
    onSuccess: () => {
      utils.emailTemplates.list.invalidate();
      toast.success("Template excluído!");
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    return templates.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase()) ||
        (t.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [templates, search, categoryFilter]);

  const handleToggleActive = (template: EmailTemplate) => {
    updateMutation.mutate({ id: template.id, isActive: !template.isActive });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Templates de Email</h2>
          <p className="text-muted-foreground font-body mt-1">
            Gerencie os templates de notificação por email e WhatsApp. Use variáveis como {"{{name}}"} para personalizar.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{templates?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground font-body">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {templates?.filter((t) => t.isActive).length ?? 0}
                </p>
                <p className="text-sm text-muted-foreground font-body">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {templates?.filter((t) => t.isDefault).length ?? 0}
                </p>
                <p className="text-sm text-muted-foreground font-body">Padrão</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <MessageCircle className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">
                  {templates?.filter((t) => t.whatsappMessage).length ?? 0}
                </p>
                <p className="text-sm text-muted-foreground font-body">Com WhatsApp</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            <SelectItem value="stage_change">Mudança de Estágio</SelectItem>
            <SelectItem value="tracking">Rastreamento</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="system">Sistema</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Nome</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead className="w-[140px]">Categoria</TableHead>
                <TableHead className="w-[80px] text-center">WhatsApp</TableHead>
                <TableHead className="w-[80px] text-center">Ativo</TableHead>
                <TableHead className="w-[140px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum template encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{template.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm truncate max-w-[300px]">{template.subject}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${CATEGORY_COLORS[template.category] ?? ""}`}
                      >
                        {CATEGORY_LABELS[template.category] ?? template.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {template.whatsappMessage ? (
                        <MessageCircle className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={() => handleToggleActive(template)}
                        disabled={updateMutation.isPending}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewTemplate(template)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTemplate(template)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!template.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir este template?")) {
                                deleteMutation.mutate({ id: template.id });
                              }
                            }}
                            title="Excluir"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      {isCreateOpen && (
        <CreateTemplateDialog
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {/* Edit Dialog */}
      {editingTemplate && (
        <EditTemplateDialog
          template={editingTemplate}
          open={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
        />
      )}

      {/* Preview Dialog */}
      {previewTemplate && (
        <PreviewTemplateDialog
          template={previewTemplate}
          open={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CREATE DIALOG
// ══════════════════════════════════════════════════════════════

function CreateTemplateDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    subject: "",
    bodyHtml: "",
    bodyText: "",
    whatsappMessage: "",
    category: "stage_change" as string,
    availableVariables: "name, trackingCode, blNumber, vehicleDescription",
  });

  const createMutation = trpc.emailTemplates.create.useMutation({
    onSuccess: () => {
      utils.emailTemplates.list.invalidate();
      toast.success("Template criado com sucesso!");
      onClose();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const handleSubmit = () => {
    const vars = form.availableVariables
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    createMutation.mutate({
      slug: form.slug,
      name: form.name,
      description: form.description || null,
      subject: form.subject,
      bodyHtml: form.bodyHtml,
      bodyText: form.bodyText || null,
      whatsappMessage: form.whatsappMessage || null,
      category: form.category as any,
      availableVariables: JSON.stringify(vars),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Criar Novo Template</DialogTitle>
          <DialogDescription>
            Crie um template de notificação. Use {"{{variavel}}"} para campos dinâmicos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slug (identificador único)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
                placeholder="meu_template_custom"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stage_change">Mudança de Estágio</SelectItem>
                  <SelectItem value="tracking">Rastreamento</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nome do Template</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Notificação de embarque personalizada"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição (quando este template é usado)</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Enviado quando o veículo é embarcado no container"
            />
          </div>

          <div className="space-y-2">
            <Label>Variáveis Disponíveis (separadas por vírgula)</Label>
            <Input
              value={form.availableVariables}
              onChange={(e) => setForm({ ...form, availableVariables: e.target.value })}
              placeholder="name, trackingCode, blNumber"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{{nome_variavel}}"} no corpo do template. Variáveis comuns: name, trackingCode, blNumber, vehicleDescription, inviteLink
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Assunto do Email</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Ex: 🚢 Atualização do seu veículo — Enviando Meu Carro"
            />
          </div>

          <div className="space-y-2">
            <Label>Corpo do Email (HTML)</Label>
            <Textarea
              value={form.bodyHtml}
              onChange={(e) => setForm({ ...form, bodyHtml: e.target.value })}
              placeholder="<div>Olá {{name}}, ...</div>"
              className="font-mono text-sm min-h-[200px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Corpo do Email (Texto Puro — fallback)</Label>
            <Textarea
              value={form.bodyText}
              onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
              placeholder="Olá {{name}}, ..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Mensagem WhatsApp (opcional)</Label>
            <Textarea
              value={form.whatsappMessage}
              onChange={(e) => setForm({ ...form, whatsappMessage: e.target.value })}
              placeholder="Olá {{name}}! 🚢 ..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.slug || !form.name || !form.subject || !form.bodyHtml || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Criar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════
// EDIT DIALOG
// ══════════════════════════════════════════════════════════════

function EditTemplateDialog({
  template,
  open,
  onClose,
}: {
  template: EmailTemplate;
  open: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const availVars = template.availableVariables
    ? (() => { try { return JSON.parse(template.availableVariables).join(", "); } catch { return ""; } })()
    : "";

  const [form, setForm] = useState({
    name: template.name,
    description: template.description ?? "",
    subject: template.subject,
    bodyHtml: template.bodyHtml,
    bodyText: template.bodyText ?? "",
    whatsappMessage: template.whatsappMessage ?? "",
    category: template.category,
    availableVariables: availVars,
    isActive: template.isActive,
  });

  const updateMutation = trpc.emailTemplates.update.useMutation({
    onSuccess: () => {
      utils.emailTemplates.list.invalidate();
      toast.success("Template atualizado com sucesso!");
      onClose();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const handleSubmit = () => {
    const vars = form.availableVariables
      .split(",")
      .map((v: string) => v.trim())
      .filter(Boolean);

    updateMutation.mutate({
      id: template.id,
      name: form.name,
      description: form.description || null,
      subject: form.subject,
      bodyHtml: form.bodyHtml,
      bodyText: form.bodyText || null,
      whatsappMessage: form.whatsappMessage || null,
      category: form.category as any,
      availableVariables: JSON.stringify(vars),
      isActive: form.isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            Editar Template
            {template.isDefault && (
              <Badge variant="outline" className="ml-2 text-xs">Padrão do Sistema</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Slug: <code className="text-xs bg-muted px-1 py-0.5 rounded">{template.slug}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Template</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stage_change">Mudança de Estágio</SelectItem>
                  <SelectItem value="tracking">Rastreamento</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Variáveis Disponíveis</Label>
            <Input
              value={form.availableVariables}
              onChange={(e) => setForm({ ...form, availableVariables: e.target.value })}
              className="font-mono text-sm"
            />
          </div>

          <Separator />

          <Tabs defaultValue="email">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                Email HTML
              </TabsTrigger>
              <TabsTrigger value="text">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Texto Puro
              </TabsTrigger>
              <TabsTrigger value="whatsapp">
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                WhatsApp
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Assunto do Email</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Corpo HTML</Label>
                <Textarea
                  value={form.bodyHtml}
                  onChange={(e) => setForm({ ...form, bodyHtml: e.target.value })}
                  className="font-mono text-sm min-h-[300px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Corpo Texto Puro (fallback)</Label>
                <Textarea
                  value={form.bodyText}
                  onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
                  className="min-h-[200px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="whatsapp" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Mensagem WhatsApp</Label>
                <Textarea
                  value={form.whatsappMessage}
                  onChange={(e) => setForm({ ...form, whatsappMessage: e.target.value })}
                  className="min-h-[200px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center gap-3">
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
            <Label>Template ativo (será usado nas notificações automáticas)</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.name || !form.subject || !form.bodyHtml || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════
// PREVIEW DIALOG
// ══════════════════════════════════════════════════════════════

function PreviewTemplateDialog({
  template,
  open,
  onClose,
}: {
  template: EmailTemplate;
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("email");

  // Parse available variables and create sample values
  const sampleVars: Record<string, string> = useMemo(() => {
    const vars: Record<string, string> = {};
    try {
      const parsed = JSON.parse(template.availableVariables ?? "[]");
      const sampleValues: Record<string, string> = {
        name: "João Silva",
        trackingCode: "EMC-AB3D-EF7G-HJ9K",
        blNumber: "MSKU1234567",
        vehicleDescription: "Porsche 911 Carrera 2024",
        inviteLink: "https://enviandomeucarro.com/onboarding/abc123",
        email: "joao@exemplo.com",
      };
      for (const v of parsed) {
        vars[v] = sampleValues[v] ?? `[${v}]`;
      }
    } catch {}
    return vars;
  }, [template.availableVariables]);

  // Render the HTML with sample variables
  const renderedHtml = useMemo(() => {
    let html = template.bodyHtml;
    // Handle conditional blocks
    for (const [key, value] of Object.entries(sampleVars)) {
      const conditionalRegex = new RegExp(`\\{\\{#${key}\\}\\}([\\s\\S]*?)\\{\\{/${key}\\}\\}`, "g");
      html = html.replace(conditionalRegex, "$1");
    }
    // Replace simple variables
    for (const [key, value] of Object.entries(sampleVars)) {
      html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
    return html;
  }, [template.bodyHtml, sampleVars]);

  const renderedWhatsApp = useMemo(() => {
    if (!template.whatsappMessage) return null;
    let msg = template.whatsappMessage;
    for (const [key, value] of Object.entries(sampleVars)) {
      msg = msg.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
    return msg;
  }, [template.whatsappMessage, sampleVars]);

  const [copied, setCopied] = useState(false);
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(template.bodyHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview: {template.name}
          </DialogTitle>
          <DialogDescription>
            Visualização com dados de exemplo. Slug: <code className="text-xs bg-muted px-1 py-0.5 rounded">{template.slug}</code>
          </DialogDescription>
        </DialogHeader>

        {/* Variable chips */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(sampleVars).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="text-xs font-mono">
              {`{{${key}}}`} = {value}
            </Badge>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email">
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              Email
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="mr-1.5 h-3.5 w-3.5" />
              HTML Source
            </TabsTrigger>
            <TabsTrigger value="whatsapp" disabled={!template.whatsappMessage}>
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="font-mono text-xs">
                  Assunto: {template.subject.replace(/\{\{(\w+)\}\}/g, (_, k) => sampleVars[k] ?? `{{${k}}}`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border rounded-lg p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="mt-4">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={handleCopyHtml}
              >
                {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copied ? "Copiado!" : "Copiar"}
              </Button>
              <pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                {template.bodyHtml}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-4">
            {renderedWhatsApp && (
              <Card>
                <CardContent className="pt-6">
                  <div className="bg-[#dcf8c6] rounded-lg p-4 max-w-md mx-auto shadow-sm">
                    <pre className="whitespace-pre-wrap text-sm font-sans text-gray-800">
                      {renderedWhatsApp}
                    </pre>
                    <p className="text-xs text-gray-500 text-right mt-2">10:30 AM ✓✓</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={() => { onClose(); /* Could open edit dialog */ }}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
