/* /importacao-de-carros-classicos — Deep SEO service page */
import ServicePageLayout, { type ServicePageData } from "@/components/ServicePageLayout";
import { Car } from "lucide-react";

const data: ServicePageData = {
  slug: "importacao-de-carros-classicos",
  seoTitle: "Importação de Carros Clássicos para o Brasil | Assessoria Completa | EMC",
  metaDescription: "Importe seu carro clássico para o Brasil com a assessoria completa da EMC. Cuidamos de toda a documentação, laudo ACB, frete e desembaraço.",
  h1: "Importação de Carros Clássicos para o Brasil",
  icon: <Car className="w-7 h-7 text-primary" />,

  definition: {
    title: "O que é o Serviço de Importação de Carros Clássicos?",
    content: [
      "A importação de carros clássicos é um serviço altamente especializado que viabiliza a entrada legal no Brasil de veículos com 30 anos ou mais de fabricação, considerados de coleção e detentores de valor histórico. Diferente da importação de veículos usados comuns, que é vedada pela legislação brasileira, a categoria de clássicos recebe um tratamento especial.",
      "Um veículo é elegível quando atende a critérios rigorosos de originalidade e conservação, preservando suas características de fábrica. A comprovação é feita através de um laudo técnico emitido por um clube de automóveis antigos credenciado, sendo o Certificado de Originalidade emitido pelo Automóvel Clube do Brasil (ACB) o documento fundamental.",
      "A EMC oferece assessoria completa desde a localização e inspeção do veículo no exterior até a nacionalização e emplacamento no Brasil. Com nosso escritório em Miami, no coração do maior mercado de clássicos do mundo, garantimos segurança, eficiência e total conformidade legal.",
    ],
  },

  process: {
    title: "Processo de Importação de Clássicos Passo a Passo",
    intro: "Nosso processo estruturado foi desenhado para oferecer máxima transparência e segurança.",
    steps: [
      { title: "Consulta e Análise de Elegibilidade", description: "Verificamos se o veículo atende aos critérios de 30+ anos de fabricação, originalidade e conservação. Analisamos viabilidade técnica e financeira." },
      { title: "Assessoria na Compra e Inspeção", description: "Com nosso escritório em Miami, realizamos inspeções pré-compra, negociamos com vendedores e garantimos que o veículo está em condições adequadas." },
      { title: "Certificado de Originalidade (ACB)", description: "Coordenamos a obtenção do Certificado de Originalidade junto ao Automóvel Clube do Brasil, documento fundamental para a importação de clássicos." },
      { title: "Licenças e Documentação", description: "Obtemos a Licença de Importação (LI), CAT e LCVM junto aos órgãos competentes (Decex, Denatran, Ibama). Processo que leva de 30 a 60 dias." },
      { title: "Transporte Internacional Especializado", description: "Estufagem profissional em contêiner exclusivo com materiais de proteção premium. Seguro All Risks cobrindo 100% do valor do veículo." },
      { title: "Despacho Aduaneiro e Nacionalização", description: "Registro da DI, pagamento de tributos (II 35%, IPI, PIS/COFINS, ICMS) e acompanhamento da conferência aduaneira até emissão do Comprovante de Importação." },
      { title: "Emplacamento com Placa Preta", description: "Providenciamos toda a documentação para o emplacamento com placa preta de coleção, que atesta a originalidade e permite circulação normal." },
    ],
  },

  costs: {
    title: "Custos da Importação de Clássicos",
    intro: "A importação de clássicos envolve custos específicos além dos tributos padrão de importação.",
    items: [
      { label: "Valor do Veículo (FOB)", description: "Preço de aquisição no exterior. Clássicos raros podem ter valorização significativa." },
      { label: "Certificado de Originalidade (ACB)", description: "Taxa para emissão do laudo técnico pelo Automóvel Clube do Brasil." },
      { label: "Frete Internacional (Contêiner Exclusivo)", description: "Recomendamos contêiner exclusivo para proteção máxima de veículos de coleção." },
      { label: "Seguro All Risks Premium", description: "Cobertura total baseada no valor de mercado do clássico, que pode diferir do valor de compra." },
      { label: "Imposto de Importação (II)", description: "35% sobre o valor aduaneiro (CIF). Sem isenção para clássicos." },
      { label: "IPI, PIS/COFINS e ICMS", description: "Tributos em cascata. Possível benefício na alíquota de IPI dependendo da classificação fiscal." },
      { label: "Emplacamento com Placa Preta", description: "Taxas do Detran para registro e emplacamento como veículo de coleção." },
    ],
    calculatorNote: "Simule os custos completos na nossa calculadora em",
  },

  timelines: {
    title: "Prazos da Importação de Clássicos",
    items: [
      { phase: "Inspeção e Compra na Origem", duration: "1 a 4 semanas" },
      { phase: "Certificado de Originalidade (ACB)", duration: "15 a 30 dias" },
      { phase: "Obtenção de Licenças (LI, CAT, LCVM)", duration: "30 a 60 dias" },
      { phase: "Frete Marítimo (EUA → Brasil)", duration: "15 a 25 dias" },
      { phase: "Frete Marítimo (Europa → Brasil)", duration: "20 a 30 dias" },
      { phase: "Despacho Aduaneiro", duration: "7 a 15 dias úteis" },
      { phase: "Emplacamento (Placa Preta)", duration: "7 a 15 dias" },
    ],
    totalEstimate: "3 a 6 meses (processo completo, da compra ao emplacamento)",
  },

  documentation: {
    title: "Documentação Específica para Clássicos",
    groups: [
      {
        groupTitle: "Documentos do Importador",
        items: [
          "CPF e RG",
          "Comprovante de residência",
          "Habilitação no RADAR/Siscomex",
          "Comprovação de capacidade financeira",
          "Filiação a clube de automóveis antigos (recomendado)",
        ],
      },
      {
        groupTitle: "Documentos Específicos do Clássico",
        items: [
          "Certificado de Originalidade do Automóvel Clube do Brasil (ACB)",
          "Título de Propriedade Original (Certificate of Title)",
          "Relatório de inspeção técnica pré-embarque",
          "Fotos detalhadas do veículo (chassi, motor, carroceria, interior)",
          "Histórico de manutenção e restauração (se disponível)",
        ],
      },
      {
        groupTitle: "Licenças e Documentos de Importação",
        items: [
          "Licença de Importação (LI) com anuência especial para clássicos",
          "CAT (Certificado de Adequação à Legislação de Trânsito)",
          "LCVM (Licença para Uso da Configuração do Veículo ou Motor)",
          "Declaração de Importação (DI)",
          "Comprovante de Importação (CI)",
        ],
      },
    ],
  },

  comparison: {
    title: "Contêiner Exclusivo vs. Compartilhado para Clássicos",
    intro: "Para veículos de coleção, a escolha do tipo de transporte é crucial para preservar a integridade.",
    headerA: "Contêiner Exclusivo (FCL)",
    headerB: "Contêiner Compartilhado (LCL)",
    rows: [
      { feature: "Proteção", optionA: "Máxima (veículo isolado)", optionB: "Alta (compartilha espaço)" },
      { feature: "Custo", optionA: "Mais alto (uso exclusivo)", optionB: "Mais econômico (divide custos)" },
      { feature: "Manuseio", optionA: "Mínimo (lacrado na origem)", optionB: "Maior (consolidação no terminal)" },
      { feature: "Flexibilidade", optionA: "Pode levar peças/acessórios", optionB: "Espaço limitado ao veículo" },
      { feature: "Prazo", optionA: "Mais rápido (embarque direto)", optionB: "Pode ter espera para consolidação" },
      { feature: "Ideal para", optionA: "Clássicos raros e de alto valor", optionB: "Clássicos em bom estado, orçamento limitado" },
    ],
  },

  faqs: [
    {
      question: "Posso importar um carro clássico com algumas modificações?",
      answer: "Sim. As modificações devem ser consistentes com a tecnologia da época e não descaracterizar o valor histórico. A análise final é feita pela entidade emissora do Certificado de Originalidade.",
    },
    {
      question: "Existe isenção de impostos para carros clássicos?",
      answer: "Não há isenção total, mas sim tratamento diferenciado. A principal vantagem é a permissão para importar veículo usado (30+ anos). Pode haver benefícios na alíquota de IPI, mas II (35%) e demais tributos são devidos.",
    },
    {
      question: "Preciso ser filiado a um clube de carros antigos?",
      answer: "Não é estritamente obrigatório, mas altamente recomendável. A filiação facilita a obtenção do Certificado de Originalidade. A EMC possui relacionamento com os principais clubes.",
    },
    {
      question: "Posso usar o carro clássico importado no dia a dia?",
      answer: "Sim. Uma vez nacionalizado e emplacado com placa preta de coleção, o veículo pode circular normalmente em todo o território nacional, sem restrições.",
    },
    {
      question: "Como o escritório da EMC em Miami facilita a importação?",
      answer: "Estando no coração do maior mercado de clássicos do mundo, realizamos inspeções pré-compra ágeis, negociamos com vendedores locais e gerenciamos toda a logística de coleta e embarque com eficiência.",
    },
  ],

  ctaTitle: "Realize o Sonho de Ter um Clássico na Sua Garagem",
  ctaDescription: "A importação não precisa ser complicada. Com a assessoria da EMC, você conta com especialistas em cada etapa, garantindo um serviço seguro, transparente e eficiente.",

  relatedServices: [
    { label: "Importação de Veículos", href: "/importacao-de-veiculos" },
    { label: "Despacho Aduaneiro", href: "/despacho-aduaneiro" },
    { label: "Transporte Internacional", href: "/transporte-internacional-de-veiculos" },
    { label: "Admissão Temporária", href: "/admissao-temporaria" },
  ],
};

export default function ImportacaoClassicos() {
  return <ServicePageLayout data={data} />;
}
