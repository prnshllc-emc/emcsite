/**
 * ContractsPanel — Admin panel for manual contract PDF upload.
 *
 * Flow:
 * 1. Admin uploads PDF → S3 + LLM extraction
 * 2. Admin reviews extracted data (CPF, VIN, name, email, phone)
 * 3. Admin edits/confirms → creates customer + vehicles + triggers reconciliation
 */
import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Plus,
  Trash2,
  RefreshCw,
  User,
  Car,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────

interface ExtractedVehicle {
  vin: string;
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
}

interface ExtractedData {
  name: string | null;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  vins: string[];
  vehicleDescriptions: ExtractedVehicle[];
  tipoOperacao: "importacao" | "exportacao" | null;
  rawExtractedText: string;
  confidence: "high" | "medium" | "low";
  warnings: string[];
}

interface UploadResult {
  pdfUrl: string;
  pdfKey: string;
  extracted: ExtractedData;
  contractId: number;
}

// ── Main Component ───────────────────────────────────────────

export default function ContractsPanel() {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const pendingContracts = trpc.contracts.listPending.useQuery();
  const allContracts = trpc.contracts.listAll.useQuery();
  const uploadMutation = trpc.contracts.upload.useMutation();
  const confirmMutation = trpc.contracts.confirm.useMutation();

  // ── File Upload Handler ────────────────────────────────────
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 20MB.");
      return;
    }

    setUploading(true);
    try {
      // Convert to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      const result = await uploadMutation.mutateAsync({
        fileBase64: base64,
        fileName: file.name,
      });

      setUploadResult(result);
      setReviewDialogOpen(true);
      toast.success("PDF enviado e analisado com sucesso!");
      utils.contracts.listPending.invalidate();
      utils.contracts.listAll.invalidate();
    } catch (err) {
      toast.error(`Erro ao enviar PDF: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [uploadMutation, utils]);

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload de Contrato
          </CardTitle>
          <CardDescription className="font-body">
            Envie o PDF do contrato assinado. O sistema extrairá automaticamente CPF, VIN, nome e dados de contato via IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="contract-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              size="lg"
              className="gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando PDF...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Selecionar PDF
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Máximo 20MB. O PDF será armazenado e analisado por IA.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pending Contracts */}
      {pendingContracts.data && pendingContracts.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Contratos Pendentes de Confirmação
              <Badge variant="secondary">{pendingContracts.data.length}</Badge>
            </CardTitle>
            <CardDescription className="font-body">
              Estes contratos foram enviados mas ainda não foram confirmados. Revise os dados extraídos e confirme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>VINs</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingContracts.data.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-mono text-sm">#{contract.id}</TableCell>
                    <TableCell>{contract.signerName || "—"}</TableCell>
                    <TableCell className="font-mono text-sm">{contract.signerCpf || "—"}</TableCell>
                    <TableCell>
                      {contract.extractedVins.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {contract.extractedVins.map((vin: string, i: number) => (
                            <Badge key={i} variant="outline" className="font-mono text-xs">
                              {vin.substring(0, 8)}...
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Nenhum</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(contract.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Re-open review dialog for this contract
                          setUploadResult({
                            pdfUrl: contract.pdfUrl || "",
                            pdfKey: "",
                            extracted: {
                              name: contract.signerName,
                              cpf: contract.signerCpf,
                              email: contract.signerEmail,
                              phone: null,
                              vins: contract.extractedVins,
                              vehicleDescriptions: contract.extractedVins.map((vin: string) => ({
                                vin,
                                make: "",
                                model: "",
                                year: null,
                                color: null,
                              })),
                              tipoOperacao: null,
                              rawExtractedText: "",
                              confidence: "medium" as const,
                              warnings: [],
                            },
                            contractId: contract.id,
                          });
                          setReviewDialogOpen(true);
                        }}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Contracts History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Histórico de Contratos
              </CardTitle>
              <CardDescription className="font-body">
                Todos os contratos enviados ao sistema.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                utils.contracts.listAll.invalidate();
                utils.contracts.listPending.invalidate();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {allContracts.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : allContracts.data && allContracts.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>VINs</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead>Processado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allContracts.data.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-mono text-sm">#{contract.id}</TableCell>
                    <TableCell>{contract.signerName || "—"}</TableCell>
                    <TableCell className="font-mono text-sm">{contract.signerCpf || "—"}</TableCell>
                    <TableCell>
                      <ContractStatusBadge status={contract.status} />
                    </TableCell>
                    <TableCell>
                      {contract.extractedVins.length > 0 ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {contract.extractedVins.length} VIN(s)
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(contract.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {contract.processedAt
                        ? new Date(contract.processedAt).toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-body">Nenhum contrato enviado ainda.</p>
              <p className="text-sm mt-1">Use o botão acima para enviar o primeiro contrato PDF.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {uploadResult && (
        <ContractReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          uploadResult={uploadResult}
          onConfirm={async (data) => {
            try {
              const result = await confirmMutation.mutateAsync(data);
              toast.success(
                `Contrato confirmado! ${result.isNewCustomer ? "Novo cliente criado." : "Cliente existente vinculado."} ${result.newVehicles} veículo(s) novo(s), ${result.linkedVehicles} vinculado(s).`
              );
              setReviewDialogOpen(false);
              setUploadResult(null);
              utils.contracts.listPending.invalidate();
              utils.contracts.listAll.invalidate();
            } catch (err) {
              toast.error(`Erro ao confirmar: ${(err as Error).message}`);
            }
          }}
          confirming={confirmMutation.isPending}
        />
      )}
    </div>
  );
}

// ── Contract Status Badge ────────────────────────────────────

function ContractStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Pendente", variant: "secondary" },
    signed: { label: "Assinado", variant: "outline" },
    processed: { label: "Processado", variant: "default" },
    error: { label: "Erro", variant: "destructive" },
    ignored: { label: "Ignorado", variant: "outline" },
  };
  const c = config[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

// ── Review Dialog ────────────────────────────────────────────

function ContractReviewDialog({
  open,
  onOpenChange,
  uploadResult,
  onConfirm,
  confirming,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadResult: UploadResult;
  onConfirm: (data: {
    contractId: number;
    name: string;
    cpf: string;
    email?: string | null;
    phone?: string | null;
    vins: { vin: string; make: string; model: string; year?: number | null; color?: string | null }[];
    tipoOperacao?: "importacao" | "exportacao" | null;
  }) => void;
  confirming: boolean;
}) {
  const { extracted, contractId } = uploadResult;

  const [name, setName] = useState(extracted.name || "");
  const [cpf, setCpf] = useState(extracted.cpf || "");
  const [email, setEmail] = useState(extracted.email || "");
  const [phone, setPhone] = useState(extracted.phone || "");
  const [tipoOperacao, setTipoOperacao] = useState<"importacao" | "exportacao" | "">(
    extracted.tipoOperacao || ""
  );
  const [vehicles, setVehicles] = useState<ExtractedVehicle[]>(
    extracted.vehicleDescriptions.length > 0
      ? extracted.vehicleDescriptions.map((v) => ({
          vin: v.vin,
          make: v.make ?? "",
          model: v.model ?? "",
          year: v.year,
          color: v.color,
        }))
      : extracted.vins.map((vin) => ({ vin, make: "", model: "", year: null, color: null }))
  );

  const addVehicle = () => {
    setVehicles([...vehicles, { vin: "", make: "", model: "", year: null, color: null }]);
  };

  const removeVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const updateVehicle = (index: number, field: keyof ExtractedVehicle, value: string | number | null) => {
    const updated = [...vehicles];
    (updated[index] as any)[field] = value;
    setVehicles(updated);
  };

  const handleConfirm = () => {
    if (!name.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    if (!cpf.trim() || cpf.replace(/\D/g, "").length !== 11) {
      toast.error("CPF deve ter 11 dígitos.");
      return;
    }

    const validVehicles = vehicles.filter((v) => v.vin.trim().length > 0);
    if (validVehicles.length === 0) {
      toast.error("Pelo menos um VIN é obrigatório.");
      return;
    }

    for (const v of validVehicles) {
      if (!(v.make ?? "").trim() || !(v.model ?? "").trim()) {
        toast.error(`VIN ${v.vin}: Marca e modelo são obrigatórios.`);
        return;
      }
    }

    onConfirm({
      contractId,
      name: name.trim(),
      cpf: cpf.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      vins: validVehicles.map((v) => ({
        vin: v.vin.trim().toUpperCase(),
        make: (v.make ?? "").trim(),
        model: (v.model ?? "").trim(),
        year: v.year,
        color: v.color,
      })),
      tipoOperacao: tipoOperacao || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Revisar Dados Extraídos
          </DialogTitle>
          <DialogDescription className="font-body">
            Revise e corrija os dados extraídos do contrato antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        {/* Confidence & Warnings */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">Confiança da extração:</span>
          <Badge
            variant={
              extracted.confidence === "high"
                ? "default"
                : extracted.confidence === "medium"
                ? "secondary"
                : "destructive"
            }
          >
            {extracted.confidence === "high" ? "Alta" : extracted.confidence === "medium" ? "Média" : "Baixa"}
          </Badge>
        </div>

        {extracted.warnings.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-600">Avisos</span>
            </div>
            <ul className="text-sm text-yellow-600 space-y-1 ml-6 list-disc">
              {extracted.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        {/* Client Data */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Dados do Cliente
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label>CPF *</Label>
              <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="00000000000" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> Telefone
              </Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 99999-9999" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Operação</Label>
            <Select value={tipoOperacao} onValueChange={(v) => setTipoOperacao(v as "importacao" | "exportacao")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="importacao">Importação</SelectItem>
                <SelectItem value="exportacao">Exportação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Vehicles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Car className="h-4 w-4" />
              Veículos ({vehicles.length})
            </h3>
            <Button size="sm" variant="outline" onClick={addVehicle} className="gap-1">
              <Plus className="h-3 w-3" />
              Adicionar Veículo
            </Button>
          </div>

          {vehicles.map((vehicle, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Veículo {index + 1}</span>
                {vehicles.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeVehicle(index)}
                    className="h-6 w-6 p-0 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">VIN *</Label>
                  <Input
                    value={vehicle.vin}
                    onChange={(e) => updateVehicle(index, "vin", e.target.value)}
                    placeholder="17 caracteres"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Marca *</Label>
                  <Input
                    value={vehicle.make ?? ""}
                    onChange={(e) => updateVehicle(index, "make", e.target.value)}
                    placeholder="Ex: Volkswagen"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Modelo *</Label>
                  <Input
                    value={vehicle.model ?? ""}
                    onChange={(e) => updateVehicle(index, "model", e.target.value)}
                    placeholder="Ex: Fusca 1300"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ano</Label>
                  <Input
                    type="number"
                    value={vehicle.year ?? ""}
                    onChange={(e) => updateVehicle(index, "year", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Ex: 1972"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cor</Label>
                  <Input
                    value={vehicle.color ?? ""}
                    onChange={(e) => updateVehicle(index, "color", e.target.value || null)}
                    placeholder="Ex: Azul"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={confirming} className="gap-2">
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirmar e Processar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
