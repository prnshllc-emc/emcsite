/* FAQSection — Accordion with 5 questions and WhatsApp CTA */
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
    question: "Qual o valor mínimo para importar um carro?",
    answer:
      "Não existe valor mínimo nem máximo. Trabalhamos com veículos de todas as faixas de preço, desde clássicos acessíveis até supercarros exclusivos. Cada operação é personalizada de acordo com o perfil do veículo e as necessidades do cliente.",
  },
  {
    question: "Posso importar carros usados?",
    answer:
      "No Brasil, a importação de carros usados é permitida apenas para veículos com mais de 30 anos (considerados antiguidade). Para veículos mais novos, trabalhamos com importação de zero km. Nossa equipe pode orientar sobre as melhores opções para o seu caso.",
  },
  {
    question: "Quanto tempo demora o processo todo?",
    answer:
      "O processo completo leva em média de 60 a 90 dias, dependendo da complexidade da operação, documentação e modal de transporte escolhido. Operações via modal aéreo podem ser significativamente mais rápidas.",
  },
  {
    question: "Quais impostos eu preciso pagar?",
    answer:
      "Os principais impostos são: II (Imposto de Importação), IPI (Imposto sobre Produtos Industrializados), PIS, COFINS e ICMS. Nossa consultoria tributária especializada ajuda a planejar e otimizar esses custos, garantindo compliance total.",
  },
  {
    question: "O transporte tem seguro?",
    answer:
      "Sim! Oferecemos seguro internacional total (All Risks) que cobre seu veículo durante todo o trajeto, desde a origem até a entrega final no Brasil. Isso inclui cobertura contra danos, avarias, roubo e sinistros durante o transporte marítimo ou aéreo.",
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
              Tudo o que você precisa saber antes de importar seu veículo.
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
              onClick={() => openContact("Olá! Tenho algumas dúvidas sobre importação de veículos. Pode me ajudar?")}
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
