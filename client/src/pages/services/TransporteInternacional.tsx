/* /transporte-internacional-de-veiculos — Deep SEO service page */
import ServicePageLayout, { type ServicePageData } from "@/components/ServicePageLayout";
import { Truck } from "lucide-react";

const data: ServicePageData = {
  slug: "transporte-internacional-de-veiculos",
  seoTitle: "Transporte Internacional de Veículos | Frete RoRo e Container | EMC",
  metaDescription: "Transporte internacional de veículos com segurança e eficiência. Frete marítimo (RoRo/Container) e aéreo com seguro All Risks. Cotação online!",
  h1: "Transporte Internacional de Veículos: Marítimo e Aéreo",
  icon: <Truck className="w-7 h-7 text-primary" />,

  definition: {
    title: "O que é o Transporte Internacional de Veículos?",
    content: [
      "O transporte internacional de veículos é um serviço logístico altamente especializado que possibilita a movimentação de automóveis, motocicletas, barcos e outros veículos motorizados entre diferentes países. Seja para uma mudança internacional, a compra de um veículo exclusivo no exterior, a participação em eventos ou a exportação para fins comerciais, este serviço é a ponte que conecta continentes.",
      "Na EMC, oferecemos duas modalidades principais de frete: marítimo e aéreo. O frete marítimo divide-se em RoRo (Roll-on/Roll-off), onde o veículo é embarcado por seus próprios meios, e Container, onde é acondicionado dentro de um container de 20 ou 40 pés. O frete aéreo é a solução premium para veículos de altíssimo valor ou urgência extrema.",
      "Com escritórios em Miami, São Paulo e Itajaí, trabalhamos de forma integrada nos principais corredores como EUA-Brasil e Europa-Brasil, garantindo um serviço fluido e sem surpresas.",
    ],
  },

  process: {
    title: "Como Funciona o Transporte Internacional",
    intro: "O processo é estruturado em etapas claras para garantir total visibilidade e controle.",
    steps: [
      { title: "Consulta e Cotação Personalizada", description: "Analisamos tipo de veículo, origem, destino e urgência para recomendar a melhor modalidade (RoRo, Container ou Aéreo) e apresentar cotação detalhada." },
      { title: "Coleta na Origem", description: "Coordenamos a coleta do veículo no endereço de origem (residência, concessionária, leilão) com transportadoras especializadas." },
      { title: "Inspeção e Preparação Pré-Embarque", description: "Vistoria fotográfica completa, retirada de fluidos (se necessário), desconexão de bateria e preparação conforme normas internacionais." },
      { title: "Estufagem ou Embarque", description: "Para Container: estufagem profissional com cintas e travas. Para RoRo: condução segura ao convés do navio." },
      { title: "Frete Internacional com Seguro All Risks", description: "Embarque no navio ou aeronave com seguro completo. Fornecemos número de rastreamento para acompanhamento em tempo real." },
      { title: "Desembarque e Desembaraço", description: "No destino, coordenamos a descarga, o desembaraço aduaneiro e o pagamento de impostos locais com nossos parceiros." },
      { title: "Entrega Porta a Porta", description: "Transporte terrestre do porto/aeroporto até o endereço final com vistoria de entrega." },
    ],
  },

  costs: {
    title: "Fatores que Compõem o Custo do Transporte",
    intro: "O custo total depende de múltiplos fatores. A EMC oferece transparência total em cada componente.",
    items: [
      { label: "Modalidade de Frete", description: "RoRo é mais econômico para veículos padrão. Container oferece mais proteção. Aéreo é premium." },
      { label: "Rota e Distância", description: "Rotas de alto volume (EUA-Brasil) tendem a ter fretes mais competitivos que rotas menos frequentes." },
      { label: "Tamanho e Peso do Veículo", description: "Veículos maiores (SUVs, camionetes) ocupam mais espaço e custam mais, especialmente no RoRo." },
      { label: "Tipo de Container", description: "Container exclusivo (FCL) é mais caro que compartilhado (LCL), mas oferece mais segurança e flexibilidade." },
      { label: "Seguro Internacional", description: "Percentual sobre o valor do veículo. Cobertura All Risks inclusa em todos os nossos serviços." },
      { label: "Taxas Portuárias (THC)", description: "Custos de manuseio nos terminais de origem e destino." },
      { label: "Sazonalidade e Demanda", description: "Períodos de alta demanda global podem impactar os valores de frete marítimo." },
    ],
    calculatorNote: "Simule os custos na nossa calculadora em",
  },

  timelines: {
    title: "Prazos de Trânsito por Modalidade e Rota",
    items: [
      { phase: "Coleta e Preparação na Origem", duration: "3 a 10 dias" },
      { phase: "Frete Marítimo: EUA → Brasil", duration: "15 a 25 dias" },
      { phase: "Frete Marítimo: Europa → Brasil", duration: "20 a 30 dias" },
      { phase: "Frete Marítimo: Ásia → Brasil", duration: "35 a 45 dias" },
      { phase: "Frete Marítimo: América do Sul", duration: "5 a 15 dias" },
      { phase: "Frete Aéreo (qualquer origem)", duration: "3 a 7 dias" },
      { phase: "Desembaraço no Destino", duration: "7 a 15 dias" },
      { phase: "Entrega Final", duration: "2 a 7 dias" },
    ],
    totalEstimate: "Marítimo: 30 a 60 dias | Aéreo: 15 a 30 dias (porta a porta)",
  },

  documentation: {
    title: "Documentação Necessária",
    groups: [
      {
        groupTitle: "Documentos do Proprietário/Importador",
        items: [
          "Cópia do RG e CPF (ou CNH)",
          "Comprovante de residência",
          "Prova de capacidade financeira",
          "Habilitação no RADAR da Receita Federal (para importação)",
        ],
      },
      {
        groupTitle: "Documentos do Veículo (na Origem)",
        items: [
          "Título de Propriedade Original (Original Title) — livre de ônus",
          "Bill of Sale ou Fatura Comercial (Commercial Invoice)",
          "Procuração (Power of Attorney) autorizando a EMC",
        ],
      },
      {
        groupTitle: "Documentos para Desembaraço no Brasil",
        items: [
          "Licença de Importação (LI) — Siscomex",
          "Conhecimento de Embarque (BL ou AWB)",
          "Declaração de Importação (DI)",
          "CAT e LCVM para nacionalização e licenciamento",
        ],
      },
    ],
  },

  comparison: {
    title: "RoRo vs. Container: Qual Modalidade Escolher?",
    intro: "A escolha entre RoRo e Container depende do tipo de veículo, orçamento e necessidades específicas.",
    headerA: "Transporte RoRo",
    headerB: "Transporte em Container",
    rows: [
      { feature: "Método de Embarque", optionA: "Dirigido para dentro do navio", optionB: "Preso e acondicionado em container" },
      { feature: "Custo", optionA: "Mais econômico para veículo único", optionB: "Vantajoso para múltiplos veículos" },
      { feature: "Proteção", optionA: "Exposto no pátio, protegido no porão", optionB: "Totalmente protegido durante todo o percurso" },
      { feature: "Itens Adicionais", optionA: "Não permitido", optionB: "Permite itens pessoais e peças (com declaração)" },
      { feature: "Veículos Operacionais", optionA: "Precisa estar funcionando", optionB: "Pode ser transportado inoperante" },
      { feature: "Ideal Para", optionA: "Veículos padrão, rotas de alto volume", optionB: "Alto valor, clássicos, motos, mudanças" },
    ],
  },

  faqs: [
    {
      question: "Posso importar qualquer tipo de carro usado para o Brasil?",
      answer: "Não. A importação de veículos usados por pessoa física só é permitida para carros com mais de 30 anos (coleção). Exceções para diplomatas ou brasileiros retornando de missões oficiais. Veículos 0km podem ser importados normalmente.",
    },
    {
      question: "O seguro All Risks já está incluído no serviço da EMC?",
      answer: "Sim. Todas as nossas propostas incluem seguro internacional com cobertura All Risks, que protege contra todos os riscos de danos, avarias ou perda desde a coleta até a entrega final.",
    },
    {
      question: "Como posso rastrear meu veículo durante o transporte marítimo?",
      answer: "Fornecemos o número do container ou booking number e o nome do navio. Você pode acompanhar o status e localização em tempo real no site da companhia marítima.",
    },
    {
      question: "É mais barato usar RoRo ou Container?",
      answer: "Para um único veículo padrão, RoRo tende a ser mais econômico. Para veículos de luxo, dois carros juntos ou itens domésticos, um container de 40 pés pode ter melhor custo-benefício.",
    },
    {
      question: "Quais portos a EMC utiliza no Brasil e nos EUA?",
      answer: "Nos EUA, nosso hub principal é Miami, mas operamos em todos os grandes portos (NY/NJ, LA/Long Beach, Houston). No Brasil, Santos (SP) e Itajaí (SC) são nossos principais pontos.",
    },
  ],

  ctaTitle: "Pronto para Movimentar seu Veículo pelo Mundo?",
  ctaDescription: "A jornada pode parecer complexa, mas com a EMC ela se torna simples e segura. Nossa equipe cuida de cada detalhe, da burocracia à logística.",

  relatedServices: [
    { label: "Importação de Veículos", href: "/importacao-de-veiculos" },
    { label: "Exportação de Veículos", href: "/exportacao-de-veiculos" },
    { label: "Despacho Aduaneiro", href: "/despacho-aduaneiro" },
    { label: "Importação de Clássicos", href: "/importacao-de-carros-classicos" },
    { label: "Admissão Temporária", href: "/admissao-temporaria" },
  ],
};

export default function TransporteInternacional() {
  return <ServicePageLayout data={data} />;
}
