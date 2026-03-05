/* WhatsAppButton — Fixed floating WhatsApp button with tooltip */
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { openContact } from "@/lib/contact";

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationDelay: "1000ms", animationFillMode: "both" }}>
      <div className="relative">
        {/* Tooltip */}
        {hovered && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-900 text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap hidden md:block">
            Fale Conosco
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-white rotate-45" />
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => openContact()}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg shadow-[#25D366]/20"
          aria-label="Falar com especialista em importação de veículos no WhatsApp"
        >
          <MessageCircle className="w-7 h-7 text-white" fill="white" />
        </button>
      </div>
    </div>
  );
}
