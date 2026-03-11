import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  Settings,
  Users,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Plus,
  Trash2,
  Save,
  Download,
  LogOut,
  ArrowLeft,
  Loader2,
  Shield,
  Globe,
  Pencil,
  FileText,
  QrCode,
  LayoutDashboard,
  Megaphone,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import BlsPanel from "@/components/admin/BlsPanel";
import TrackingPanel from "@/components/admin/TrackingPanel";
import DashboardPanel from "@/components/admin/DashboardPanel";
import CustomersPanel from "@/components/admin/CustomersPanel";

// ============================================================
// TYPES
// ============================================================

interface SettingRow {
  id: number;
  key: string;
  value: string;
  label: string | null;
  category: string;
  updatedAt: Date;
}

interface SubscriberRow {
  id: number;
  email: string;
  name: string | null;
  active: boolean;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
}

// ============================================================
// SETTING CATEGORIES
// ============================================================

const SETTING_CATEGORIES = [
  {
    key: "contact",
    label: "Contato",
    icon: Phone,
    fields: [
      { key: "phone_primary", label: "Telefone Principal", placeholder: "+55 11 99244-8920" },
      { key: "phone_secondary", label: "Telefone Secundário", placeholder: "+1 (786) 600-0430" },
      { key: "email_primary", label: "E-mail Principal", placeholder: "atendimento@enviandomeucarro.com" },
      { key: "email_secondary", label: "E-mail Secundário", placeholder: "contato@enviandomeucarro.com" },
      { key: "whatsapp_url", label: "WhatsApp URL", placeholder: "https://wa.me/5511992448920" },
      { key: "whatsapp_number", label: "WhatsApp Número", placeholder: "+55 11 99244-8920" },
    ],
  },
  {
    key: "address",
    label: "Endereços",
    icon: MapPin,
    fields: [
      { key: "address_miami", label: "Escritório Miami", placeholder: "1150 NW 72nd Ave, Tower 1, Ste 455, Miami, FL 33126" },
      { key: "address_sp", label: "Escritório São Paulo", placeholder: "Vila Olímpia, São Paulo, SP" },
      { key: "address_itajai", label: "Escritório Itajaí", placeholder: "Próximo ao Porto de Itajaí, SC" },
    ],
  },
  {
    key: "social",
    label: "Redes Sociais",
    icon: Globe,
    fields: [
      { key: "instagram_url", label: "Instagram", placeholder: "https://www.instagram.com/enviandomeucarro" },
      { key: "facebook_url", label: "Facebook", placeholder: "https://www.facebook.com/enviandomeucarro" },
      { key: "youtube_url", label: "YouTube", placeholder: "https://www.youtube.com/@enviandomeucarro" },
      { key: "tiktok_url", label: "TikTok", placeholder: "https://www.tiktok.com/@enviandomeucarro" },
    ],
  },
  {
    key: "links",
    label: "Links Externos",
    icon: MessageCircle,
    fields: [
      { key: "calculator_url", label: "Calculadora de Importação", placeholder: "https://calculadora.enviandomeucarro.com" },
      { key: "tracking_url", label: "Rastreamento de Veículos", placeholder: "https://rastreamento.enviandomeucarro.com" },
      { key: "google_reviews_url", label: "Google Reviews", placeholder: "https://g.page/r/..." },
    ],
  },
];

// ============================================================
// ADMIN PAGE
// ============================================================

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-body">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="font-display">Acesso Restrito</CardTitle>
            <CardDescription className="font-body">
              Faça login para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="font-display">Acesso Negado</CardTitle>
            <CardDescription className="font-body">
              Você não tem permissão para acessar esta área. Apenas administradores com e-mail @enviandomeucarro.com podem acessar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Site
              </Button>
            </Link>
            <Button variant="ghost" onClick={logout} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Site
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-display font-bold">Painel Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-body">
              {user.name || user.email || "Admin"}
            </Badge>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 space-y-10">
        {/* ── OPERAÇÕES ─────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-display font-bold uppercase tracking-widest text-muted-foreground">
              Operações
            </h2>
          </div>
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-5">
              <TabsTrigger value="dashboard" className="font-display text-xs">
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="bls" className="font-display text-xs">
                <FileText className="mr-1.5 h-4 w-4" />
                BLs
              </TabsTrigger>
              <TabsTrigger value="customers" className="font-display text-xs">
                <Users className="mr-1.5 h-4 w-4" />
                Clientes
              </TabsTrigger>
              <TabsTrigger value="tracking" className="font-display text-xs">
                <QrCode className="mr-1.5 h-4 w-4" />
                Rastreamento
              </TabsTrigger>
              <TabsTrigger value="settings" className="font-display text-xs">
                <Settings className="mr-1.5 h-4 w-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardPanel />
            </TabsContent>

            <TabsContent value="bls">
              <BlsPanel />
            </TabsContent>

            <TabsContent value="customers">
              <CustomersPanel />
            </TabsContent>

            <TabsContent value="tracking">
              <TrackingPanel />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsPanel />
            </TabsContent>
          </Tabs>
        </section>

        {/* ── MARKETING & LEADS ─────────────────────────────── */}
        <section>
          <Separator className="mb-6" />
          <div className="mb-4">
            <h2 className="text-sm font-display font-bold uppercase tracking-widest text-muted-foreground">
              Marketing & Leads
            </h2>
          </div>
          <Tabs defaultValue="newsletter" className="space-y-6">
            <TabsList className="w-fit">
              <TabsTrigger value="newsletter" className="font-display text-xs">
                <Megaphone className="mr-1.5 h-4 w-4" />
                Newsletter (Leads)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="newsletter">
              <NewsletterPanel />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

// ============================================================
// SETTINGS PANEL
// ============================================================

function SettingsPanel() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.list.useQuery();
  const upsertMutation = trpc.settings.upsert.useMutation({
    onSuccess: () => {
      utils.settings.list.invalidate();
      toast.success("Configuração salva com sucesso!");
    },
    onError: (err) => toast.error(`Erro ao salvar: ${err.message}`),
  });
  const deleteMutation = trpc.settings.delete.useMutation({
    onSuccess: () => {
      utils.settings.list.invalidate();
      toast.success("Configuração removida!");
    },
    onError: (err) => toast.error(`Erro ao remover: ${err.message}`),
  });

  // Local state for editing
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({});

  // Initialize edit values from server data
  useEffect(() => {
    if (settings) {
      const initial: Record<string, string> = {};
      for (const s of settings) {
        initial[s.key] = s.value;
      }
      setEditValues((prev) => ({ ...initial, ...prev }));
      setHasChanges({});
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
    const serverValue = settings?.find((s) => s.key === key)?.value ?? "";
    setHasChanges((prev) => ({ ...prev, [key]: value !== serverValue }));
  };

  const handleSave = (key: string, label: string, category: string) => {
    const value = editValues[key] ?? "";
    upsertMutation.mutate({ key, value, label, category });
    setHasChanges((prev) => ({ ...prev, [key]: false }));
  };

  const handleSaveAll = (category: string) => {
    const cat = SETTING_CATEGORIES.find((c) => c.key === category);
    if (!cat) return;
    for (const field of cat.fields) {
      const value = editValues[field.key] ?? "";
      upsertMutation.mutate({ key: field.key, value, label: field.label, category });
    }
    toast.success("Todas as configurações da categoria foram salvas!");
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
      <div>
        <h2 className="text-2xl font-display font-bold">Configurações do Site</h2>
        <p className="text-muted-foreground font-body mt-1">
          Gerencie endereços, telefones, links de WhatsApp, e-mails e redes sociais que aparecem no site.
        </p>
      </div>

      {SETTING_CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const categoryHasChanges = cat.fields.some((f) => hasChanges[f.key]);

        return (
          <Card key={cat.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-lg">{cat.label}</CardTitle>
                    <CardDescription className="font-body">
                      {cat.fields.length} campo{cat.fields.length > 1 ? "s" : ""} configuráve{cat.fields.length > 1 ? "is" : "l"}
                    </CardDescription>
                  </div>
                </div>
                {categoryHasChanges && (
                  <Button
                    size="sm"
                    onClick={() => handleSaveAll(cat.key)}
                    disabled={upsertMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Todos
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cat.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.key} className="font-body text-sm">
                      {field.label}
                    </Label>
                    {hasChanges[field.key] && (
                      <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">
                        Alterado
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id={field.key}
                      value={editValues[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="font-body"
                    />
                    {hasChanges[field.key] && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSave(field.key, field.label, cat.key)}
                        disabled={upsertMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================
// NEWSLETTER PANEL (Marketing & Leads — separated from operations)
// ============================================================

function NewsletterPanel() {
  const utils = trpc.useUtils();
  const { data: subscribers, isLoading } = trpc.newsletter.list.useQuery();
  const removeMutation = trpc.newsletter.remove.useMutation({
    onSuccess: () => {
      utils.newsletter.list.invalidate();
      toast.success("Inscrito removido!");
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });
  const toggleMutation = trpc.newsletter.toggleActive.useMutation({
    onSuccess: () => {
      utils.newsletter.list.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubscribers = (subscribers ?? []).filter(
    (s) =>
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeCount = (subscribers ?? []).filter((s) => s.active).length;
  const totalCount = (subscribers ?? []).length;

  const handleExportCSV = useCallback(() => {
    if (!subscribers || subscribers.length === 0) {
      toast.error("Nenhum inscrito para exportar.");
      return;
    }
    const header = "Email,Nome,Ativo,Data Inscrição\n";
    const rows = subscribers
      .map(
        (s) =>
          `"${s.email}","${s.name || ""}","${s.active ? "Sim" : "Não"}","${new Date(s.subscribedAt).toLocaleDateString("pt-BR")}"`
      )
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
  }, [subscribers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Leads — Newsletter</h2>
          <p className="text-muted-foreground font-body mt-1">
            Repositório de leads que se cadastraram pelo formulário do site. Sincronizado com HubSpot.
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" disabled={totalCount === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totalCount}</p>
                <p className="text-sm text-muted-foreground font-body">Total de Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Mail className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground font-body">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Users className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totalCount - activeCount}</p>
                <p className="text-sm text-muted-foreground font-body">Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por e-mail ou nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm font-body"
        />
      </div>

      {/* Table */}
      {totalCount === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-display font-semibold">Nenhum lead ainda</p>
            <p className="text-muted-foreground font-body mt-1">
              Os leads aparecerão aqui quando alguém se cadastrar pelo formulário de newsletter do site.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-display">E-mail</TableHead>
                  <TableHead className="font-display">Nome</TableHead>
                  <TableHead className="font-display">Status</TableHead>
                  <TableHead className="font-display">Data</TableHead>
                  <TableHead className="font-display text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-body font-medium">{sub.email}</TableCell>
                    <TableCell className="font-body text-muted-foreground">
                      {sub.name || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={sub.active}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: sub.id, active: checked })
                          }
                        />
                        <Badge
                          variant={sub.active ? "default" : "secondary"}
                          className="font-body text-xs"
                        >
                          {sub.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-body text-muted-foreground">
                      {new Date(sub.subscribedAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMutation.mutate({ id: sub.id })}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
