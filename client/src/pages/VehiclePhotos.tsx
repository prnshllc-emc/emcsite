/* VehiclePhotos — Album view with photo upload via API Gateway */
import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import {
  Camera,
  Upload,
  Check,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trackCTAClick } from "@/lib/analytics";

/* ─── API Gateway base URL ─── */
const API_GATEWAY =
  import.meta.env.VITE_API_GATEWAY_URL || "https://api.enviandomeucarro.com";

/* ─── Types ─── */
interface PhotoSlot {
  id: number;
  slotKey: string;
  label: string;
  required: boolean;
  sortOrder: number;
  photoUrl: string | null;
  thumbnailUrl: string | null;
  uploadedAt: string | null;
  aiClassification: string | null;
}

interface Album {
  id: number;
  token: string;
  customerName: string;
  vehicleDescription: string;
  status: string;
  slots: PhotoSlot[];
  createdAt: string;
  confirmedAt: string | null;
}

/* ─── Component ─── */
export default function VehiclePhotos() {
  const params = useParams<{ token: string }>();
  const token = params.token || "";
  const [, navigate] = useLocation();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  const fetchAlbum = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_GATEWAY}/v1/fotos/${encodeURIComponent(token)}`);
      if (res.status === 404) {
        setError("Álbum não encontrado. Verifique seu código de acesso.");
        return;
      }
      if (!res.ok) throw new Error(`Erro: ${res.status}`);
      const data = await res.json();
      setAlbum(data);
    } catch (err) {
      setError("Não foi possível carregar o álbum. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchAlbum();
  }, [token, fetchAlbum]);

  async function handleUpload(slotKey: string, file: File) {
    if (!token) return;
    setUploadingSlot(slotKey);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("slotKey", slotKey);

      const res = await fetch(`${API_GATEWAY}/v1/fotos/${encodeURIComponent(token)}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Erro no upload: ${res.status}`);
      }

      trackCTAClick("Upload Foto", "album", slotKey, "Upload");
      // Refresh album to get updated photo
      await fetchAlbum();
    } catch (err: any) {
      alert(err.message || "Erro ao enviar foto. Tente novamente.");
    } finally {
      setUploadingSlot(null);
    }
  }

  async function handleConfirm() {
    if (!token || !album) return;
    setConfirmLoading(true);
    try {
      const res = await fetch(`${API_GATEWAY}/v1/fotos/${encodeURIComponent(token)}/confirm`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Erro ao confirmar");
      trackCTAClick("Confirmar Álbum", "album", token, "Confirmar");
      setConfirmSuccess(true);
      await fetchAlbum();
    } catch {
      alert("Erro ao confirmar álbum. Tente novamente.");
    } finally {
      setConfirmLoading(false);
    }
  }

  const filledSlots = album?.slots.filter((s) => s.photoUrl) || [];
  const requiredSlots = album?.slots.filter((s) => s.required) || [];
  const requiredFilled = requiredSlots.filter((s) => s.photoUrl);
  const canConfirm = requiredFilled.length === requiredSlots.length && album?.status !== "confirmed";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container max-w-5xl">
          {/* Back button */}
          <button
            onClick={() => navigate("/minha-area")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Minha Área
          </button>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground mt-4">Carregando álbum...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-red-400 text-lg font-medium">{error}</p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => navigate("/minha-area")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tentar outro código
              </Button>
            </div>
          )}

          {/* Album loaded */}
          {album && !loading && (
            <div className="space-y-8">
              {/* Header info */}
              <div className="bg-card border border-white/10 rounded-xl p-6 space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="font-display font-bold text-xl md:text-2xl text-white">
                      Álbum de Fotos
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      {album.customerName} — {album.vehicleDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {album.status === "confirmed" ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-full">
                        <Camera className="w-3.5 h-3.5" />
                        Em andamento
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${album.slots.length > 0 ? (filledSlots.length / album.slots.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {filledSlots.length}/{album.slots.length} fotos
                  </span>
                </div>
              </div>

              {/* Photo grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {album.slots
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      uploading={uploadingSlot === slot.slotKey}
                      disabled={album.status === "confirmed"}
                      onUpload={(file) => handleUpload(slot.slotKey, file)}
                    />
                  ))}
              </div>

              {/* Confirm button */}
              {album.status !== "confirmed" && (
                <div className="flex flex-col items-center gap-4 pt-4">
                  {confirmSuccess ? (
                    <div className="flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 px-6 py-3 rounded-xl">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Álbum confirmado com sucesso!</span>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={handleConfirm}
                        disabled={!canConfirm || confirmLoading}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 h-auto text-base"
                      >
                        {confirmLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Confirmar Álbum Completo
                      </Button>
                      {!canConfirm && (
                        <p className="text-xs text-muted-foreground text-center max-w-sm">
                          Envie todas as fotos obrigatórias antes de confirmar.
                          ({requiredFilled.length}/{requiredSlots.length} obrigatórias enviadas)
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Refresh */}
              <div className="text-center">
                <button
                  onClick={fetchAlbum}
                  className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  Atualizar álbum
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ─── Slot Card Component ─── */
interface SlotCardProps {
  slot: PhotoSlot;
  uploading: boolean;
  disabled: boolean;
  onUpload: (file: File) => void;
}

function SlotCard({ slot, uploading, disabled, onUpload }: SlotCardProps) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo: 16MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Apenas imagens são aceitas.");
      return;
    }

    onUpload(file);
    // Reset input
    e.target.value = "";
  }

  return (
    <div
      className={`relative rounded-xl border overflow-hidden transition-all ${
        slot.photoUrl
          ? "border-green-400/20 bg-green-400/5"
          : slot.required
          ? "border-yellow-400/20 bg-card"
          : "border-white/10 bg-card"
      }`}
    >
      {/* Photo or placeholder */}
      <div className="aspect-[4/3] relative bg-black/20">
        {slot.photoUrl ? (
          <img
            src={slot.thumbnailUrl || slot.photoUrl}
            alt={slot.label}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
            <span className="text-xs opacity-50">Sem foto</span>
          </div>
        )}

        {/* Upload overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {/* Success indicator */}
        {slot.photoUrl && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}

        {/* Required badge */}
        {slot.required && !slot.photoUrl && (
          <div className="absolute top-2 left-2 text-[10px] font-medium text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
            Obrigatória
          </div>
        )}
      </div>

      {/* Info + upload button */}
      <div className="p-3 space-y-2">
        <p className="text-sm font-medium text-white truncate">{slot.label}</p>

        {!disabled && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <span className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 border border-primary/20 rounded-lg py-2 px-3 transition-all">
              <Upload className="w-3.5 h-3.5" />
              {slot.photoUrl ? "Substituir" : "Enviar foto"}
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
