/* FAQSection — Accordion with institutional FAQs covering all services */
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { openContact } from "@/lib/contact";

const FAQS = [
  {
    question: "Quais tipos de veículos vocês transportam?",
    answer:
      "Trabalhamos com todos os tipos: carros clássicos (+30 anos), veículos 0km, motos, camionetas, utilitários e até Motor Homes. Tanto na importação quanto na exportação, para e de qualquer lugar do mundo, independente do tipo de combustível ou direção.",
  },
  {
    question: "Vocês também exportam veículos do Brasil?",
    answer:
      "Sim! Oferecemos serviço completo de exportação do Brasil para qualquer destino no mundo. O serviço inclui recebimento, transporte rodoviário, despachante, estufagem, frete e seguro marítimos, desembaraço no destino e entrega final.",
  },
  {
    question: "Posso importar carros usados?",
    answer:
      "No Brasil, a importação de veículos usados é permitida apenas para veículos com mais de 30 anos (considerados antiguidade). Para veículos mais novos, trabalhamos com importação de 0km. Veículos usados podem entrar via admissão temporária para corrida ou exposição.",
  },
  {
    question: "Qual o prazo do processo completo?",
    answer:
      "Para importação de veículos 0km, o prazo é de 50 a 80 dias. Para clássicos (+30 anos), de 67 a 115 dias (inclui laudo ACB). Para exportação, a partir de 4 semanas dependendo do destino. Esses são prazos estimados que podem variar conforme documentação, destino e condições logísticas.",
  },
  {
    question: "Quais impostos eu preciso pagar na importação?",
    answer:
      "Os principais tributos são: II (Imposto de Importação - 35%), IPI (6,2% a 6,5% para carros), PIS, COFINS, ICMS (varia por estado) e AFRMM (25% sobre frete marítimo). Oferecemos uma calculadora online em calculadora.enviandomeucarro.com para simular todos os custos.",
  },
  {
    question: "O transporte tem seguro?",
    answer:
      "Sim! Oferecemos seguro internacional obrigatório (All Risks) em todas as operações, cobrindo seu veículo durante todo o trajeto. Isso inclui cobertura contra danos, avarias, roubo e sinistros durante o transporte marítimo ou aéreo.",
  },
  {
    question: "Vocês importam peças e acessórios?",
    answer:
      "Sim! Importamos peças originais e acessórios do mundo inteiro para seu clássico ou importado. É uma forma de economizar tempo e dinheiro, com a mesma segurança e transparência dos nossos serviços de transporte de veículos.",
  },
  {
    question: "Preciso contratar todos os serviços ou posso escolher?",
    answer:
      "Você que manda! Nossa filosofia é oferecer flexibilidade total. Você pode contratar o serviço completo porta a porta ou escolher apenas os serviços que precisa. Sem pegadinhas e sabendo exatamente o quanto vai pagar por cada etapa.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-background relative overflow-hidden">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Dúvidas Frequentes
            </h2>
            <p className="text-muted-foreground text-lg font-body">
              Tudo o que você precisa saber sobre importação, exportação e logística automotiva.
            </p>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-white/10 bg-card rounded-lg px-6"
              >
                <AccordionTrigger className="text-lg font-medium text-white hover:text-primary hover:no-underline py-6 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed font-body">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CTA */}
          <div className="text-center mt-12 space-y-3">
            <p className="text-muted-foreground font-body">
              Ainda tem dúvidas? Nossa equipe está pronta para te ajudar.
            </p>
            <Button
              onClick={() => openContact("Olá! Tenho algumas dúvidas sobre os serviços da Enviando Meu Carro. Pode me ajudar?")}
              className="h-14 px-8 text-lg font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-transform bg-[#25D366] text-white hover:bg-[#128C7E]"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Tirar Dúvidas no WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
