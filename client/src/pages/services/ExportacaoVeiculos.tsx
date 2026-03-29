/* /exportacao-de-veiculos — Deep SEO service page */
import ServicePageLayout, { type ServicePageData } from "@/components/ServicePageLayout";
import { Globe } from "lucide-react";

const data: ServicePageData = {
  slug: "exportacao-de-veiculos",
  calculatorUtmCampaign: "servico-exportacao-veiculos",
  seoTitle: "Exportação de Veículos do Brasil | EMC - Leve seu carro para o mundo",
  metaDescription: "Serviço completo de exportação de veículos do Brasil para qualquer lugar do mundo. Cuidamos de todo o processo, do transporte à entrega final. Consulte-nos!",
  h1: "Exportação de Veículos: Seu Carro em Qualquer Lugar do Mundo",
  icon: <Globe className="w-7 h-7 text-primary" />,

  definition: {
    title: "O que é o Serviço de Exportação de Veículos?",
    content: [
      "A exportação de veículos é um processo logístico e aduaneiro complexo que permite transportar um carro, moto ou outro veículo automotor do Brasil para qualquer outro país. Seja para uma mudança internacional, a venda para um comprador no exterior, a participação em um evento ou a realização de um sonho de levar um carro clássico para uma coleção internacional, o serviço de exportação de veículos da Enviando Meu Carro (EMC) é a solução completa e segura que você precisa.",
      "Nosso serviço all-inclusive foi desenhado para oferecer total tranquilidade e conveniência. Cuidamos de cada detalhe, desde a coleta do veículo em sua residência ou local de preferência no Brasil, até a entrega final no endereço de destino no exterior. Com escritórios em São Paulo, Itajaí e Miami, gerenciamos todo o processo para você.",
      "O serviço abrange coleta e transporte rodoviário, despachante de exportação, estufagem profissional em contêiner, frete e seguro marítimos internacionais, desembaraço no país de destino e entrega final. Você pode acompanhar cada etapa através do nosso sistema de rastreamento.",
    ],
  },

  process: {
    title: "Processo de Exportação Passo a Passo",
    intro: "Nosso processo é estruturado em etapas claras e transparentes, garantindo total visibilidade e controle sobre cada fase.",
    steps: [
      { title: "Consulta Inicial e Orçamento", description: "Entendemos suas necessidades, tipo de veículo, origem e destino para oferecer a solução mais adequada e competitiva." },
      { title: "Habilitação e Documentação", description: "Auxiliamos na habilitação no RADAR/Siscomex (modalidade Expressa para exportação) e orientamos sobre toda a documentação do veículo." },
      { title: "Coleta e Transporte para o Porto", description: "Agendamos a coleta do veículo em qualquer lugar do Brasil com transportadoras especializadas e seguradas até o porto de embarque (Itajaí, Santos ou outro)." },
      { title: "Vistoria e Preparação para Embarque", description: "No porto, o veículo passa por vistoria detalhada, retirada de fluidos (se necessário) e desconexão da bateria. Tudo documentado em relatório fotográfico." },
      { title: "Estufagem em Contêiner", description: "Estufagem profissional com cintas e travas de rodas de padrão internacional. Opções de contêiner de 20 pés (1 veículo) ou 40 pés (2+ veículos)." },
      { title: "Desembaraço Aduaneiro de Exportação", description: "Elaboração da DU-E (Declaração Única de Exportação) e acompanhamento junto à Receita Federal até a liberação alfandegária." },
      { title: "Transporte Marítimo e Seguro", description: "Frete marítimo com as principais companhias do mundo e seguro internacional All Risks. Rastreamento online do contêiner." },
      { title: "Desembaraço no Destino", description: "Nossa rede de parceiros globais cuida da documentação, contato com a alfândega e pagamento dos impostos locais no país de destino." },
      { title: "Entrega Final", description: "Transporte terrestre do porto de destino até o endereço final especificado, com vistoria de entrega." },
    ],
  },

  costs: {
    title: "Fatores de Custo da Exportação",
    intro: "Os custos podem variar significativamente dependendo de diversos fatores. A EMC detalha cada componente do seu orçamento.",
    items: [
      { label: "Transporte Rodoviário no Brasil", description: "Distância entre o local de coleta e o porto de embarque (Itajaí ou Santos)." },
      { label: "Serviços Portuários (THC)", description: "Custos de manuseio, movimentação, pesagem e armazenamento no terminal portuário." },
      { label: "Despachante Aduaneiro", description: "Honorários para elaboração da DU-E, conferência de documentos e acompanhamento junto à Receita Federal." },
      { label: "Estufagem e Amarração", description: "Custo do serviço profissional com cintas, calços e travas de alta qualidade." },
      { label: "Frete Marítimo Internacional", description: "Depende da rota, companhia marítima, tamanho do contêiner (20 ou 40 pés) e demanda global." },
      { label: "Seguro Internacional", description: "Percentual sobre o valor FOB do veículo. Cobre todos os riscos porta a porta." },
      { label: "Custos no Destino", description: "THC no destino, impostos de importação locais (VAT/GST), despachante local e transporte terrestre final." },
    ],
    calculatorNote: "Para uma estimativa rápida e personalizada, acesse nossa calculadora em",
  },

  timelines: {
    title: "Prazos Típicos de Exportação",
    items: [
      { phase: "Coleta e Transporte para o Porto", duration: "2 a 10 dias" },
      { phase: "Preparação e Estufagem", duration: "2 a 4 dias" },
      { phase: "Desembaraço de Exportação", duration: "2 a 5 dias" },
      { phase: "Espera para Embarque (Booking)", duration: "3 a 7 dias" },
      { phase: "Trânsito Marítimo (EUA/Canadá)", duration: "15 a 25 dias" },
      { phase: "Trânsito Marítimo (Europa)", duration: "20 a 30 dias" },
      { phase: "Trânsito Marítimo (Ásia)", duration: "35 a 45 dias" },
      { phase: "Desembaraço no Destino", duration: "5 a 15 dias" },
      { phase: "Entrega Final no Destino", duration: "2 a 7 dias" },
    ],
    totalEstimate: "EUA/Europa: 30 a 60 dias | Ásia: 50 a 80 dias",
  },

  documentation: {
    title: "Documentação Necessária",
    groups: [
      {
        groupTitle: "Documentos do Exportador",
        items: [
          "Habilitação no RADAR/Siscomex (modalidade Expressa)",
          "CPF e RG (Pessoa Física) ou CNPJ e Contrato Social (Pessoa Jurídica)",
          "Comprovante de endereço atualizado",
        ],
      },
      {
        groupTitle: "Documentos do Veículo",
        items: [
          "CRLV válido, em nome do exportador, sem débitos ou restrições",
          "CRV (antigo DUT) em branco para baixa no Detran",
          "Nota Fiscal de Exportação (eletrônica) com NCM e dados do importador",
        ],
      },
      {
        groupTitle: "Documentos da Transação (gerados pela EMC)",
        items: [
          "Fatura Comercial (Commercial Invoice)",
          "Packing List (Romaneio de Carga)",
          "Conhecimento de Embarque (Bill of Lading - BL)",
          "Declaração Única de Exportação (DU-E)",
          "Certificado de Origem (se aplicável para acordos comerciais)",
        ],
      },
    ],
  },

  comparison: {
    title: "Contêiner vs. RoRo: Qual Escolher?",
    intro: "As duas opções mais comuns para exportação marítima. A escolha depende do tipo de veículo, destino e orçamento.",
    headerA: "Contêiner (FCL/LCL)",
    headerB: "RoRo (Roll-on/Roll-off)",
    rows: [
      { feature: "Segurança", optionA: "Muito Alta (lacrado em aço)", optionB: "Moderada (convés do navio)" },
      { feature: "Custo", optionA: "Variável (FCL mais caro, LCL econômico)", optionB: "Geralmente mais econômico" },
      { feature: "Flexibilidade de Carga", optionA: "Alta (pode levar peças/pertences)", optionB: "Baixa (veículo deve estar vazio)" },
      { feature: "Disponibilidade de Rotas", optionA: "Muito Ampla (maioria dos portos)", optionB: "Limitada (nem todos os portos)" },
      { feature: "Veículos Não Operacionais", optionA: "Ideal (guincho/plataforma)", optionB: "Não é possível (precisa dirigir)" },
      { feature: "Proteção contra Intempéries", optionA: "Total (fechado)", optionB: "Parcial (umidade/maresia)" },
    ],
  },

  faqs: [
    {
      question: "Posso exportar um veículo que ainda está financiado?",
      answer: "Não. O veículo deve estar totalmente quitado e livre de qualquer ônus ou alienação fiduciária. O CRV deve estar em nome do exportador e sem restrições.",
    },
    {
      question: "Quais impostos eu pago para exportar um veículo do Brasil?",
      answer: "A exportação é isenta de impostos como IPI e ICMS no Brasil. Porém, você será responsável pelos impostos de importação e taxas locais no país de destino, que variam conforme a legislação local.",
    },
    {
      question: "Posso levar pertences pessoais dentro do carro?",
      answer: "No transporte em contêiner, é possível acomodar alguns pertences (com declaração no Packing List). No RoRo, não é permitido nenhum item dentro do veículo.",
    },
    {
      question: "O que acontece com a placa e documentação no Brasil após a exportação?",
      answer: "Após a averbação da DU-E, é necessário solicitar a baixa permanente do veículo no Detran do estado de registro. A EMC oferece assessoria para este procedimento.",
    },
    {
      question: "Como posso ter certeza de que meu carro chegará em segurança?",
      answer: "Utilizamos técnicas de amarração de padrão internacional e oferecemos seguro All Risks que cobre 100% do valor do veículo. Acompanhe via fotos e rastreamento online.",
    },
  ],

  ctaTitle: "Pronto para Levar seu Veículo para Qualquer Lugar do Mundo?",
  ctaDescription: "A Enviando Meu Carro cuida de tudo para você. Entre em contato para um atendimento personalizado ou acesse nossa calculadora online para um orçamento instantâneo.",

  relatedServices: [
    { label: "Importação de Veículos", href: "/importacao-de-veiculos" },
    { label: "Despacho Aduaneiro", href: "/despacho-aduaneiro" },
    { label: "Transporte Internacional", href: "/transporte-internacional-de-veiculos" },
    { label: "Admissão Temporária", href: "/admissao-temporaria" },
  ],
};

export default function ExportacaoVeiculos() {
  return <ServicePageLayout data={data} />;
}
