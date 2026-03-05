/* TrackingLoginModal — Modal with tabs for tracking code and CPF login */
import { useState } from "react";
import { Lock, Search, User, Key, AlertCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { openContact } from "@/lib/contact";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TrackingLoginModal({ open, onOpenChange }: Props) {
  const [tab, setTab] = useState<"code" | "cpf">("code");
  const [code, setCode] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function formatCPF(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("Credenciais inválidas. Tente novamente.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-white/10 max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="font-display font-bold text-xl text-white">
            Área Restrita do Cliente
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { setTab("code"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === "code"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Código
          </button>
          <button
            onClick={() => { setTab("cpf"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === "cpf"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            CPF
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {tab === "code" ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Digite seu código de rastreamento"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="pl-10 bg-background/50 border-white/10 focus:border-primary"
              />
            </div>
          ) : (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  className="pl-10 bg-background/50 border-white/10 focus:border-primary"
                />
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10 focus:border-primary"
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 font-bold tracking-wider"
          >
            {tab === "code" ? "Rastrear" : "Entrar"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => openContact("Olá! Não tenho meu código de rastreamento. Pode me ajudar?")}
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mx-auto"
          >
            <MessageCircle className="w-3 h-3" />
            Não tem seu código? Fale conosco
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
