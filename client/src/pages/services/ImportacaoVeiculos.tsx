/* /importacao-de-veiculos — Deep SEO service page */
import ServicePageLayout, { type ServicePageData } from "@/components/ServicePageLayout";
import { Ship } from "lucide-react";

const data: ServicePageData = {
  slug: "importacao-de-veiculos",
  seoTitle: "Importação de Veículos para o Brasil | Serviço Completo | EMC",
  metaDescription: "Importe carros clássicos, 0km, motos e mais para o Brasil com a assessoria completa da EMC. Cuidamos de tudo, do leilão à entrega porta a porta.",
  h1: "Importação de Veículos para o Brasil: Serviço Completo e Seguro",
  icon: <Ship className="w-7 h-7 text-primary" />,

  definition: {
    title: "O que é o Serviço de Importação de Veículos?",
    content: [
      "A importação de veículos para o Brasil é um processo especializado que permite trazer automóveis, motocicletas e utilitários de qualquer lugar do mundo para o território nacional. Este serviço é destinado tanto a pessoas físicas que sonham em possuir um modelo exclusivo, um carro clássico com mais de 30 anos de história, ou um veículo 0km que não é comercializado no mercado local, quanto a empresas que necessitam de utilitários específicos para suas operações.",
      "A Enviando Meu Carro (EMC) oferece uma solução completa e integrada, gerenciando cada detalhe do processo para garantir uma experiência tranquila, segura e livre de burocracias para nossos clientes. Nosso serviço abrange desde a assessoria na compra em feiras e leilões internacionais, a inspeção pré-embarque, a contratação de frete internacional (marítimo ou aéreo) com seguro All Risks, até o complexo despacho aduaneiro e a entrega final do veículo na sua porta em qualquer cidade do Brasil.",
      "Com escritórios estrategicamente localizados em Miami (EUA), São Paulo (SP) e Itajaí (SC), conectamos os principais mercados globais ao Brasil, cuidando de toda a documentação necessária, como a Licença de Importação (LI), o Certificado de Adequação à Legislação de Trânsito (CAT) e a Licença para Uso da Configuração do Veículo ou Motor (LCVM), garantindo total conformidade com a legislação brasileira.",
    ],
  },

  process: {
    title: "Processo de Importação Passo a Passo",
    intro: "Importar um veículo pode parecer um desafio complexo, mas com a assessoria da EMC, cada etapa é executada com precisão e transparência.",
    steps: [
      {
        title: "Consulta Inicial e Análise de Viabilidade",
        description: "Entendemos suas necessidades, o tipo de veículo desejado (clássico, 0km, moto, utilitário) e o país de origem. Realizamos uma análise de viabilidade completa, estimando custos e prazos, e verificando a conformidade do veículo com as normas brasileiras.",
      },
      {
        title: "Assessoria na Compra e Inspeção",
        description: "Auxiliamos na busca e aquisição do veículo em mercados internacionais, incluindo participação em leilões e feiras especializadas. Coordenamos inspeção técnica detalhada no local de origem para garantir a qualidade e o estado do veículo.",
      },
      {
        title: "Logística e Transporte Internacional",
        description: "O veículo é cuidadosamente preparado e transportado para o porto ou aeroporto mais próximo. Organizamos o frete internacional, seja marítimo (em contêineres exclusivos ou compartilhados) ou aéreo, sempre com seguro All Risks.",
      },
      {
        title: "Obtenção de Licenças e Documentação",
        description: "Iniciamos os trâmites para obtenção de todas as licenças necessárias junto aos órgãos brasileiros (Decex, Ibama/LCVM, Denatran/CAT). Preparamos e protocolamos o pedido de Licença de Importação (LI), documento mandatório para a entrada do veículo no Brasil.",
      },
      {
        title: "Desembaraço Aduaneiro no Brasil",
        description: "Com a chegada do veículo, nossa equipe de despachantes aduaneiros registra a Declaração de Importação (DI) no Siscomex, realiza o pagamento de todos os impostos (II, IPI, PIS/COFINS, ICMS) e acompanha a conferência aduaneira até a liberação final.",
      },
      {
        title: "Nacionalização e Emplacamento",
        description: "Uma vez liberado, o veículo é oficialmente nacionalizado. Entregamos toda a documentação necessária para o primeiro emplacamento junto ao Detran do seu estado.",
      },
      {
        title: "Entrega Porta a Porta",
        description: "Coordenamos o transporte terrestre do porto/aeroporto até sua residência ou empresa, em qualquer lugar do Brasil, com a mesma segurança e cuidado.",
      },
    ],
  },

  costs: {
    title: "O que Compõe o Custo da Importação?",
    intro: "O valor final de um veículo importado é composto por diversos fatores. A EMC oferece total transparência, detalhando cada item do seu investimento.",
    items: [
      { label: "Valor do Veículo (FOB)", description: "Preço de compra do carro, moto ou utilitário no país de origem." },
      { label: "Frete Internacional", description: "Custo do transporte do país de origem até o Brasil. O frete marítimo é mais econômico; o aéreo é mais rápido." },
      { label: "Seguro Internacional (All Risks)", description: "Apólice que cobre danos e perdas durante todo o trajeto. Percentual sobre o valor do veículo + frete." },
      { label: "Imposto de Importação (II)", description: "Alíquota de 35% sobre o valor aduaneiro (Veículo + Frete + Seguro)." },
      { label: "IPI (Imposto sobre Produtos Industrializados)", description: "Varia conforme a cilindrada do motor, geralmente entre 7% e 25%." },
      { label: "PIS/COFINS-Importação", description: "Contribuições sociais com alíquotas que somam aproximadamente 11,75% sobre o valor aduaneiro." },
      { label: "ICMS (Imposto Estadual)", description: "Incide em cascata sobre todos os custos anteriores. Varia por estado (ex: 18% em SP, 17% em SC)." },
      { label: "Taxas Portuárias (THC)", description: "Custos de manuseio e armazenagem no terminal de chegada. Variam de R$ 2.000 a R$ 5.000 ou mais." },
      { label: "Honorários EMC", description: "Serviços de assessoria, preparação de documentos, acompanhamento e despacho aduaneiro." },
    ],
    calculatorNote: "Para uma estimativa detalhada e personalizada, utilize nossa calculadora online em",
  },

  timelines: {
    title: "Quanto Tempo Leva para Importar um Veículo?",
    items: [
      { phase: "Compra e Inspeção na Origem", duration: "1 a 3 semanas" },
      { phase: "Obtenção de Licenças (LI, CAT, LCVM)", duration: "30 a 60 dias" },
      { phase: "Frete Marítimo", duration: "3 a 6 semanas" },
      { phase: "Frete Aéreo", duration: "3 a 7 dias" },
      { phase: "Desembaraço Aduaneiro", duration: "7 a 15 dias úteis" },
      { phase: "Transporte Doméstico e Entrega", duration: "1 a 2 semanas" },
    ],
    totalEstimate: "Marítimo: 3 a 5 meses | Aéreo: 2 a 3 meses",
  },

  documentation: {
    title: "Documentação Necessária",
    groups: [
      {
        groupTitle: "Documentos do Importador (Pessoa Física)",
        items: [
          "Cópia do RG e CPF",
          "Comprovante de residência",
          "Comprovação de capacidade financeira (ex: Declaração de IR)",
          "Habilitação no Radar Siscomex (auxiliamos neste processo)",
        ],
      },
      {
        groupTitle: "Documentos do Veículo",
        items: [
          "Commercial Invoice (Fatura Comercial)",
          "Bill of Lading (BL) ou Airway Bill (AWB)",
          "Título de Propriedade Original (Certificate of Title)",
          "Certificado de Conformidade do Fabricante",
          "Prova de associação a clube de colecionadores (para +30 anos)",
        ],
      },
      {
        groupTitle: "Documentos da Importação (gerenciados pela EMC)",
        items: [
          "Licença de Importação (LI)",
          "Certificado de Adequação à Legislação de Trânsito (CAT)",
          "Licença para Uso da Configuração do Veículo ou Motor (LCVM)",
          "Declaração de Importação (DI)",
          "Comprovantes de recolhimento de todos os impostos",
        ],
      },
    ],
  },

  comparison: {
    title: "Frete Aéreo vs. Frete Marítimo: Qual Escolher?",
    intro: "A escolha entre o transporte aéreo e marítimo depende da sua prioridade: tempo ou custo.",
    headerA: "Frete Aéreo",
    headerB: "Frete Marítimo (Contêiner)",
    rows: [
      { feature: "Velocidade", optionA: "Muito Rápido (3-7 dias)", optionB: "Lento (3-6 semanas)" },
      { feature: "Custo", optionA: "Alto (3 a 5x mais caro)", optionB: "Econômico (melhor custo-benefício)" },
      { feature: "Segurança", optionA: "Altíssima (menor manuseio)", optionB: "Alta (protegido em contêiner)" },
      { feature: "Ideal para", optionA: "Alto valor, motos, urgência", optionB: "Clássicos, 0km, utilitários" },
      { feature: "Disponibilidade", optionA: "Menor (aeroportos de carga)", optionB: "Ampla (maioria dos portos)" },
      { feature: "Rastreamento", optionA: "Preciso e em tempo real", optionB: "Bom, nos principais pontos" },
    ],
  },

  faqs: [
    {
      question: "Posso importar um carro usado com menos de 30 anos para o Brasil?",
      answer: "Não. A legislação brasileira proíbe a importação de veículos usados, exceto para colecionadores (com mais de 30 anos de fabricação e para fins culturais), diplomatas ou casos de herança comprovada. Veículos 0km são permitidos.",
    },
    {
      question: "Preciso estar no Brasil para realizar o processo de importação?",
      answer: "Não necessariamente. A EMC pode atuar como sua representante em todas as etapas, desde a compra no exterior até a entrega no seu endereço no Brasil. Você pode gerenciar todo o processo remotamente.",
    },
    {
      question: "O que acontece se o veículo sofrer algum dano durante o transporte?",
      answer: "O seguro All Risks incluso em todos os nossos processos cobre custos de reparo ou o valor integral do veículo em caso de qualquer avaria ou sinistro durante o transporte internacional.",
    },
    {
      question: "Quais são os principais portos para importação de veículos no Brasil?",
      answer: "Os principais portos são Santos (SP) e o complexo portuário de Itajaí/Navegantes (SC), onde a EMC possui forte presença. Para modal aéreo, Guarulhos (SP) e Viracopos (Campinas, SP).",
    },
    {
      question: "Como os impostos são calculados?",
      answer: "Os impostos são calculados sobre o valor aduaneiro (preço do carro + frete + seguro). A Receita Federal verifica se o valor declarado é compatível com o de mercado. A EMC trabalha com total transparência e declara os valores corretos.",
    },
  ],

  ctaTitle: "Pronto para Importar o Carro dos Seus Sonhos?",
  ctaDescription: "Deixe a complexidade conosco. Nossa equipe de especialistas está pronta para transformar seu projeto em realidade com segurança, agilidade e transparência.",

  relatedServices: [
    { label: "Exportação de Veículos", href: "/exportacao-de-veiculos" },
    { label: "Despacho Aduaneiro", href: "/despacho-aduaneiro" },
    { label: "Transporte Internacional", href: "/transporte-internacional-de-veiculos" },
    { label: "Importação de Clássicos", href: "/importacao-de-carros-classicos" },
    { label: "Admissão Temporária", href: "/admissao-temporaria" },
  ],
};

export default function ImportacaoVeiculos() {
  return <ServicePageLayout data={data} />;
}
