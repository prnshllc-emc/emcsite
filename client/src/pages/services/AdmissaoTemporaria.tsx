/* /admissao-temporaria — Deep SEO service page */
import ServicePageLayout, { type ServicePageData } from "@/components/ServicePageLayout";
import { Clock } from "lucide-react";

const data: ServicePageData = {
  slug: "admissao-temporaria",
  calculatorUtmCampaign: "servico-admissao-temporaria",
  seoTitle: "Admissão Temporária de Veículos | Eventos, Corridas e Exposições | EMC",
  metaDescription: "Entenda como funciona a admissão temporária de veículos para eventos, corridas ou exposições no Brasil. Processo, custos e documentos com a EMC.",
  h1: "Admissão Temporária de Veículos: Guia Completo",
  icon: <Clock className="w-7 h-7 text-primary" />,

  definition: {
    title: "O que é a Admissão Temporária de Veículos?",
    content: [
      "A Admissão Temporária é um regime aduaneiro especial que permite a entrada de veículos estrangeiros no território brasileiro por um período determinado, com suspensão total ou parcial do pagamento dos tributos de importação. É a solução ideal para veículos de competição (TCR, Stock Car, Rally), veículos de exposição para feiras e salões, e veículos de turistas ou brasileiros não residentes.",
      "O principal benefício é a viabilidade econômica: os impostos (II, IPI, PIS, COFINS) ficam suspensos, exigindo-se uma garantia que é devolvida quando o veículo é reexportado. Isso torna possível trazer veículos de alto valor ao Brasil sem a carga tributária da importação definitiva.",
      "A EMC, com escritórios em Miami, São Paulo e Itajaí, é especialista em gerenciar todo o processo de admissão temporária, garantindo agilidade e conformidade com a legislação aduaneira brasileira.",
    ],
  },

  process: {
    title: "Processo de Admissão Temporária Passo a Passo",
    intro: "O regime de admissão temporária segue um fluxo regulamentado pela Receita Federal. A EMC gerencia cada etapa.",
    steps: [
      { title: "Consulta e Análise de Elegibilidade", description: "Verificamos se o veículo e a finalidade se enquadram no regime (competição, exposição, turismo). Definimos o prazo de permanência e a modalidade de garantia." },
      { title: "Preparação da Documentação", description: "Elaboramos toda a documentação necessária: requerimento formal, comprovação da finalidade (convite para evento, inscrição em competição), dados do veículo e do proprietário." },
      { title: "Transporte Internacional", description: "Coordenamos o frete (marítimo ou aéreo) com seguro All Risks. Para competições com prazo apertado, oferecemos frete aéreo premium." },
      { title: "Desembaraço Aduaneiro Especial", description: "Registro da Declaração de Admissão Temporária (DAT) no Siscomex. Apresentação da garantia (seguro, fiança bancária ou depósito) no valor dos tributos suspensos." },
      { title: "Período de Permanência", description: "O veículo permanece no Brasil pelo prazo autorizado (geralmente 1 a 12 meses, prorrogável). A EMC monitora os prazos para evitar multas." },
      { title: "Reexportação", description: "Ao final do período, coordenamos a reexportação do veículo: transporte ao porto/aeroporto, desembaraço de saída e embarque de retorno." },
      { title: "Liberação da Garantia", description: "Após confirmação da reexportação pela Receita Federal, a garantia é integralmente devolvida ao proprietário." },
    ],
  },

  costs: {
    title: "Custos da Admissão Temporária",
    intro: "A admissão temporária é significativamente mais econômica que a importação definitiva, mas envolve custos específicos.",
    items: [
      { label: "Garantia dos Tributos Suspensos", description: "Valor equivalente aos tributos que seriam devidos (II + IPI + PIS/COFINS + ICMS). Devolvido na reexportação." },
      { label: "Seguro-Garantia ou Fiança Bancária", description: "Custo do instrumento financeiro usado como garantia (geralmente 1-3% do valor da garantia por ano)." },
      { label: "Frete Internacional (ida e volta)", description: "Custo do transporte marítimo ou aéreo, na entrada e na reexportação." },
      { label: "Seguro All Risks", description: "Cobertura total durante o transporte e permanência no Brasil." },
      { label: "Despachante Aduaneiro", description: "Honorários para elaboração da DAT, acompanhamento do despacho e da reexportação." },
      { label: "Taxas Portuárias/Aeroportuárias", description: "THC e armazenagem nos terminais de entrada e saída." },
      { label: "Transporte Terrestre no Brasil", description: "Do porto/aeroporto ao local do evento e de volta." },
    ],
    calculatorNote: "Solicite uma cotação personalizada em",
  },

  timelines: {
    title: "Prazos da Admissão Temporária",
    items: [
      { phase: "Preparação de Documentação", duration: "5 a 15 dias" },
      { phase: "Frete Marítimo (EUA → Brasil)", duration: "15 a 25 dias" },
      { phase: "Frete Aéreo (qualquer origem)", duration: "3 a 7 dias" },
      { phase: "Desembaraço Aduaneiro (DAT)", duration: "3 a 7 dias" },
      { phase: "Permanência Autorizada", duration: "1 a 12 meses (prorrogável)" },
      { phase: "Reexportação e Liberação da Garantia", duration: "7 a 15 dias" },
    ],
    totalEstimate: "Entrada: 10 a 40 dias | Permanência: até 12 meses | Saída: 7 a 15 dias",
  },

  documentation: {
    title: "Documentação Necessária",
    groups: [
      {
        groupTitle: "Documentos do Proprietário/Responsável",
        items: [
          "Passaporte ou documento de identificação",
          "Comprovante de residência no exterior",
          "Procuração autorizando a EMC como representante",
          "Dados bancários para a garantia",
        ],
      },
      {
        groupTitle: "Documentos do Veículo",
        items: [
          "Título de Propriedade Original (Certificate of Title)",
          "Certificado de Registro do veículo no país de origem",
          "Seguro internacional válido",
          "Ficha técnica com especificações (chassi, motor, peso)",
        ],
      },
      {
        groupTitle: "Documentos da Finalidade",
        items: [
          "Convite oficial do evento/competição/exposição",
          "Inscrição em campeonato (para veículos de competição)",
          "Contrato de exposição ou feira (para veículos de mostra)",
          "Comprovante de turismo (para veículos de turistas)",
          "Cronograma do evento com datas de início e término",
        ],
      },
    ],
  },

  comparison: {
    title: "Modalidades de Transporte para Admissão Temporária",
    intro: "A escolha do modal depende da urgência, valor do veículo e tipo de evento.",
    headerA: "Frete Aéreo",
    headerB: "Frete Marítimo (Contêiner)",
    rows: [
      { feature: "Custo", optionA: "Alto", optionB: "Moderado a Baixo" },
      { feature: "Velocidade", optionA: "Muito Rápido (3-7 dias)", optionB: "Lento (2-5 semanas)" },
      { feature: "Segurança", optionA: "Muito Alta", optionB: "Alta (lacrado em contêiner)" },
      { feature: "Ideal para", optionA: "Altíssimo valor, urgência, competições", optionB: "Exposições, eventos com planejamento" },
      { feature: "Disponibilidade", optionA: "Principais aeroportos", optionB: "Principais portos" },
      { feature: "Capacidade", optionA: "1 veículo por vez", optionB: "Até 4 veículos por contêiner 40ft" },
    ],
  },

  faqs: [
    {
      question: "Posso vender o veículo no Brasil ao final do prazo?",
      answer: "Não. A admissão temporária não permite comercialização. Para vender, seria necessário converter para importação definitiva, pagando todos os tributos suspensos com acréscimos legais.",
    },
    {
      question: "O que acontece se eu ultrapassar o prazo de permanência?",
      answer: "Infração grave: cobrança imediata dos tributos suspensos com multas de até 100% do valor do veículo, além da execução da garantia. A EMC monitora os prazos para evitar isso.",
    },
    {
      question: "Preciso de carteira de motorista internacional?",
      answer: "Sim, é altamente recomendável portar uma Permissão Internacional para Dirigir (PID) junto com a carteira válida do país de origem para dirigir legalmente no Brasil.",
    },
    {
      question: "A garantia para os impostos suspensos é sempre obrigatória?",
      answer: "Na grande maioria dos casos, sim. Existem pouquíssimas exceções, geralmente ligadas a eventos de grande interesse público ou acordos diplomáticos.",
    },
    {
      question: "A EMC cuida de todo o processo, da coleta no exterior até a devolução?",
      answer: "Sim. Oferecemos serviço completo porta a porta: coleta em qualquer lugar do mundo, documentação, logística, desembaraço no Brasil e coordenação da devolução ao local de origem.",
    },
  ],

  ctaTitle: "Traga seu Veículo ao Brasil sem Complicações",
  ctaDescription: "Seja para uma corrida emocionante, uma exposição de prestígio ou uma viagem inesquecível, a Admissão Temporária é a solução inteligente e econômica. Deixe os especialistas da EMC cuidarem de tudo.",

  relatedServices: [
    { label: "Importação de Veículos", href: "/importacao-de-veiculos" },
    { label: "Transporte Internacional", href: "/transporte-internacional-de-veiculos" },
    { label: "Despacho Aduaneiro", href: "/despacho-aduaneiro" },
    { label: "Importação de Clássicos", href: "/importacao-de-carros-classicos" },
  ],
};

export default function AdmissaoTemporaria() {
  return <ServicePageLayout data={data} />;
}
