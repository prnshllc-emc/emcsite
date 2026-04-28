/* MinhaArea — Client portal entry page */
import { useState } from "react";
import { useLocation } from "wouter";
import { User, ArrowRight, Camera, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { openContact } from "@/lib/contact";
import { trackCTAClick } from "@/lib/analytics";

export default function MinhaArea() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Por favor, insira seu código de acesso.");
      return;
    }
    if (!/^[a-zA-Z0-9_-]{8,64}$/.test(trimmed)) {
      setError("Código inválido. Verifique e tente novamente.");
      return;
    }
    trackCTAClick("Acessar Álbum", "minha_area", `/fotos/${trimmed}`, "Acessar");
    navigate(`/fotos/${trimmed}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md space-y-8">
          {/* Icon */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-9 h-9 text-primary" />
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white">
              Minha Área
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Acesse seu álbum de fotos do veículo usando o código que você recebeu por WhatsApp.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="token-input" className="text-sm font-medium text-gray-300">
                Código de Acesso
              </label>
              <Input
                id="token-input"
                placeholder="Digite seu código aqui"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError("");
                }}
                className="bg-background/50 border-white/10 focus:border-primary h-12 text-base"
                autoComplete="off"
              />
              {error && (
                <p className="text-red-400 text-xs mt-1">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 font-bold tracking-wider h-12 text-base"
            >
              <Camera className="w-4 h-4 mr-2" />
              Acessar Álbum de Fotos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Help */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground mb-3">
              Não tem seu código? Ele foi enviado via WhatsApp pela nossa equipe.
            </p>
            <button
              onClick={() => {
                const msg = "Olá! Não recebi meu código de acesso para o álbum de fotos. Pode me ajudar?";
                trackCTAClick("Sem código", "minha_area", "whatsapp", "Ajuda");
                openContact(msg, "site", "whatsapp", "minha_area_help");
              }}
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 mx-auto"
            >
              <MessageCircle className="w-4 h-4" />
              Falar com a equipe
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
