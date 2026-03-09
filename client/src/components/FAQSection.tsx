/* FAQSection — SEO-optimized FAQ with consistent design and tracking */
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { openContact } from "@/lib/contact";
import { trackFAQInteraction, trackCTAClick, trackWhatsAppClick } from "@/lib/analytics";

const FAQS = [
  {
    question: "Como funciona a importação de veículos dos EUA para o Brasil?",
    answer:
      "O processo de importação de veículos envolve 5 etapas principais: (1) Escolha do veículo com assessoria da EMC em feiras, leilões e concessionárias internacionais; (2) Compra, inspeção e preparação para embarque; (3) Frete marítimo ou aéreo com seguro All Risks incluso; (4) Despacho aduaneiro completo no Brasil (DI, licenças LI, CAT, LCVM, conferência aduaneira); (5) Entrega do veículo na sua porta. A EMC cuida de todo o processo ou apenas das etapas que você escolher.",
  },
  {
    question: "Quanto custa importar um carro dos Estados Unidos?",
    answer:
      "O custo de importação varia conforme o valor do veículo, tipo e estado de destino no Brasil. Os principais tributos são: II (Imposto de Importação - 35%), IPI (6,2% a 6,5% para carros), PIS, COFINS, ICMS (varia por estado) e AFRMM (25% sobre frete marítimo). Além dos impostos, há custos de frete, seguro, despacho aduaneiro e transporte interno. Use nossa calculadora online em calculadora.enviandomeucarro.com para simular todos os custos detalhadamente e sem compromisso.",
  },
  {
    question: "Quais tipos de veículos vocês importam e exportam?",
    answer:
      "Trabalhamos com todos os tipos de veículos: carros clássicos (+30 anos), veículos 0km, motos, camionetas, utilitários, Motor Homes e até veículos de corrida. Tanto na importação quanto na exportação, para e de qualquer lugar do mundo, independente do tipo de combustível, direção ou porte do veículo.",
  },
  {
    question: "Posso importar carro usado dos EUA para o Brasil?",
    answer:
      "No Brasil, a legislação permite a importação de veículos usados apenas para aqueles com mais de 30 anos de fabricação, classificados como antiguidade ou clássicos. Para veículos mais novos, trabalhamos exclusivamente com importação de 0km (zero quilômetro). Veículos usados de qualquer idade podem entrar no Brasil via regime de admissão temporária para fins de corrida, exposição ou eventos internacionais.",
  },
  {
    question: "Qual o prazo para importar um carro?",
    answer:
      "Os prazos variam conforme o tipo de veículo: para importação de veículos 0km, o prazo é de 50 a 80 dias; para clássicos (+30 anos), de 67 a 115 dias (inclui laudo ACB obrigatório). Para exportação do Brasil, a partir de 4 semanas dependendo do destino. Esses são prazos estimados que podem variar conforme documentação, destino e condições logísticas. A EMC oferece rastreamento em tempo real para você acompanhar cada etapa.",
  },
  {
    question: "Vocês exportam veículos do Brasil para outros países?",
    answer:
      "Sim! A EMC oferece serviço completo de exportação de veículos do Brasil para qualquer destino no mundo. O serviço inclui recebimento do veículo, transporte rodoviário até o porto, despachante de exportação, estufagem em container, frete e seguro marítimos, desembaraço no país de destino e entrega final. Todo o processo é acompanhado com rastreamento em tempo real.",
  },
  {
    question: "O transporte internacional de veículos tem seguro?",
    answer:
      "Sim! Todas as operações da EMC incluem seguro internacional obrigatório do tipo All Risks, que cobre seu veículo durante todo o trajeto. A cobertura inclui proteção contra danos, avarias, roubo e sinistros durante o transporte marítimo ou aéreo, desde a origem até a entrega final no destino.",
  },
  {
    question: "Vocês importam peças e acessórios automotivos?",
    answer:
      "Sim! A EMC importa peças originais e acessórios automotivos do mundo inteiro para seu clássico ou importado. É uma forma de economizar tempo e dinheiro na manutenção do seu veículo, com a mesma segurança, transparência e rastreamento dos nossos serviços de transporte de veículos completos.",
  },
  {
    question: "O que é admissão temporária de veículos?",
    answer:
      "A admissão temporária é um regime aduaneiro que permite a entrada de veículos estrangeiros no Brasil por tempo determinado, sem o pagamento integral dos tributos de importação. É utilizada para veículos de corrida, exposição, feiras e eventos internacionais. A EMC cuida de toda a documentação e logística necessária para a admissão temporária do seu veículo.",
  },
  {
    question: "Preciso contratar todos os serviços ou posso escolher?",
    answer:
      "Você que manda! A filosofia da EMC é oferecer flexibilidade total ao cliente. Você pode contratar o serviço completo porta a porta (importação ou exportação integral) ou escolher apenas os serviços específicos que precisa, como despacho aduaneiro, frete, seguro ou transporte interno. Sem pegadinhas e sabendo exatamente o quanto vai pagar por cada etapa.",
  },
  {
    question: "Como importar um carro clássico americano para o Brasil?",
    answer:
      "Para importar um carro clássico (com mais de 30 anos), o processo inclui: assessoria na escolha do veículo em feiras e leilões nos EUA, compra e inspeção, preparação e embarque, frete marítimo com seguro All Risks, chegada ao Brasil, laudo ACB (Automóvel Clube do Brasil) obrigatório para clássicos, despacho aduaneiro completo e entrega. O prazo médio é de 67 a 115 dias. A EMC tem mais de 10 anos de experiência nesse tipo de operação.",
  },
  {
    question: "Qual a diferença entre envio marítimo e aéreo de veículos?",
    answer:
      "O envio marítimo é o mais comum e econômico, ideal para veículos de todos os portes, com prazo de 3 a 6 semanas de travessia. O envio aéreo é mais rápido (dias ao invés de semanas), porém com custo mais elevado, sendo ideal para peças, acessórios e veículos de menor porte com urgência. A EMC oferece ambas as modalidades com seguro All Risks incluso em todas as operações.",
  },
];

export default function FAQSection() {
  const [openValue, setOpenValue] = useState<string | undefined>(undefined);

  function handleValueChange(value: string) {
    if (value && value !== openValue) {
      const idx = parseInt(value.replace("faq-", ""));
      if (!isNaN(idx) && FAQS[idx]) {
        trackFAQInteraction(FAQS[idx].question, "open");
      }
    } else if (!value && openValue) {
      const idx = parseInt(openValue.replace("faq-", ""));
      if (!isNaN(idx) && FAQS[idx]) {
        trackFAQInteraction(FAQS[idx].question, "close");
      }
    }
    setOpenValue(value || undefined);
  }

  function handleCTA() {
    const msg = "Olá! Tenho algumas dúvidas sobre os serviços da Enviando Meu Carro. Pode me ajudar?";
    trackCTAClick("Tirar Dúvidas no WhatsApp", "faq_section", "whatsapp", "Tirar Dúvidas no WhatsApp");
    trackWhatsAppClick("faq_cta", msg);
    openContact(msg);
  }

  return (
    <section
      id="faq"
      aria-label="Perguntas frequentes sobre importação e exportação de veículos"
      className="py-20 bg-background relative overflow-hidden"
    >
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <header className="text-center mb-14 space-y-4">
            <span className="section-badge">FAQ</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Dúvidas sobre <span className="text-primary">Importação de Veículos</span>
            </h2>
            <p className="text-gray-300 text-lg font-body leading-relaxed">
              Tudo sobre <strong className="text-white">como importar carro</strong>, exportação, custos, prazos, impostos e logística automotiva.
            </p>
          </header>

          {/* Accordion */}
          <Accordion
            type="single"
            collapsible
            className="space-y-3"
            value={openValue}
            onValueChange={handleValueChange}
          >
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-white/8 bg-card/80 rounded-lg px-5"
              >
                <AccordionTrigger className="text-base font-medium text-white hover:text-primary hover:no-underline py-5 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 pb-5 text-sm leading-relaxed font-body">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CTA */}
          <div className="text-center mt-10 space-y-3">
            <p className="text-gray-400 text-sm font-body">
              Ainda tem dúvidas? Nossa equipe está pronta para te ajudar.
            </p>
            <Button
              onClick={handleCTA}
              className="h-12 px-7 text-base font-bold uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all bg-[#25D366] text-white hover:bg-[#20BD5A]"
              aria-label="Tirar dúvidas sobre importação de veículos no WhatsApp"
            >
              <MessageCircle className="mr-2 w-5 h-5" aria-hidden="true" />
              Tirar Dúvidas no WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
