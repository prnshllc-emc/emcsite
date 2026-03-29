/* /despacho-aduaneiro — Deep SEO service page */
import ServicePageLayout, { type ServicePageData } from "@/components/ServicePageLayout";
import { FileCheck } from "lucide-react";

const data: ServicePageData = {
  slug: "despacho-aduaneiro",
  calculatorUtmCampaign: "servico-despacho-aduaneiro",
  seoTitle: "Despacho Aduaneiro de Veículos | Desembaraço Completo | EMC",
  metaDescription: "Desembaraço aduaneiro completo para veículos importados. Cuidamos de DI, licenças, tributos (II, IPI, ICMS) e toda a documentação. Fale com a EMC.",
  h1: "Despacho Aduaneiro: O Guia Completo para o Desembaraço do seu Veículo no Brasil",
  icon: <FileCheck className="w-7 h-7 text-primary" />,

  definition: {
    title: "O que é o Despacho Aduaneiro de Veículos?",
    content: [
      "O despacho aduaneiro de veículos é o coração do processo de importação, o momento em que a sua aquisição internacional se torna, de fato e de direito, um bem nacionalizado e pronto para rodar nas ruas e estradas do Brasil. Trata-se de um procedimento administrativo complexo e rigoroso, conduzido pela Receita Federal, que tem como objetivo verificar a exatidão dos dados declarados pelo importador em relação ao veículo, aos documentos apresentados e à legislação específica.",
      "Em termos simples, é a liberação oficial do seu carro ou moto na alfândega. Este processo envolve análise minuciosa que garante que todos os tributos foram corretamente calculados e pagos, que o veículo atende às normas ambientais e de segurança do Brasil e que a operação de importação é legítima. Desde a classificação fiscal correta do bem (NCM) até a conferência física do chassi e do motor, cada detalhe é examinado.",
      "A Enviando Meu Carro (EMC) possui uma equipe de despachantes aduaneiros altamente qualificados, com profundo conhecimento da legislação e dos procedimentos específicos para veículos. Com escritórios em São Paulo, Itajaí e Miami, oferecemos um serviço de despacho aduaneiro completo, ágil e transparente.",
    ],
  },

  process: {
    title: "Etapas do Despacho Aduaneiro",
    intro: "O desembaraço aduaneiro segue um fluxo rigoroso junto à Receita Federal. A EMC gerencia cada etapa com precisão.",
    steps: [
      { title: "Pré-Despacho: Obtenção de Licenças", description: "Antes da chegada do veículo, obtemos a Licença de Importação (LI), o CAT (Certificado de Adequação à Legislação de Trânsito) e a LCVM (Licença para Uso da Configuração do Veículo ou Motor). Esses documentos são obrigatórios e podem levar de 30 a 60 dias." },
      { title: "Chegada e Armazenagem", description: "Com a chegada do navio, o contêiner é descarregado e o veículo é armazenado em recinto alfandegado. Monitoramos a descarga e verificamos a integridade do veículo." },
      { title: "Registro da Declaração de Importação (DI)", description: "Nosso despachante registra a DI no Siscomex com todos os dados do veículo, classificação NCM, valor aduaneiro e tributos calculados. É o documento central do despacho." },
      { title: "Parametrização (Canais de Conferência)", description: "A Receita Federal direciona a DI para um dos canais: Verde (liberação automática), Amarelo (conferência documental), Vermelho (conferência física + documental) ou Cinza (investigação de fraude). A EMC acompanha cada canal." },
      { title: "Pagamento de Tributos", description: "Recolhimento de todos os impostos: II (35%), IPI (7-25%), PIS/COFINS (~11,75%) e ICMS (17-18%). Emitimos todas as guias (DARF e GNRE) e realizamos os pagamentos." },
      { title: "Conferência e Desembaraço", description: "Após a conferência (documental e/ou física), a Receita Federal emite o Comprovante de Importação (CI), documento que comprova a nacionalização do veículo." },
      { title: "Retirada e Entrega", description: "Com o CI em mãos, retiramos o veículo do recinto alfandegado e coordenamos o transporte até seu endereço." },
    ],
  },

  costs: {
    title: "Tributos e Custos do Despacho Aduaneiro",
    intro: "O despacho aduaneiro envolve uma cascata de tributos federais e estaduais, além de taxas portuárias e honorários.",
    items: [
      { label: "Imposto de Importação (II)", description: "35% sobre o valor aduaneiro (CIF = veículo + frete + seguro). Principal tributo federal." },
      { label: "IPI (Imposto sobre Produtos Industrializados)", description: "Varia de 7% a 25% conforme cilindrada do motor. Incide sobre CIF + II." },
      { label: "PIS/COFINS-Importação", description: "Aproximadamente 11,75% combinados sobre o valor aduaneiro." },
      { label: "ICMS (Imposto Estadual)", description: "Base complexa: (CIF + II + IPI + PIS + COFINS) / (1 - Alíquota ICMS). Varia por estado (18% SP, 17% SC)." },
      { label: "Taxa de Utilização do Siscomex", description: "Taxa administrativa para registro da DI no sistema." },
      { label: "Taxas Portuárias (THC/Armazenagem)", description: "Custos de manuseio e armazenagem no terminal. Variam de R$ 2.000 a R$ 5.000+." },
      { label: "Honorários do Despachante Aduaneiro", description: "Serviços de classificação fiscal, elaboração da DI, acompanhamento e liberação." },
    ],
    calculatorNote: "Simule os custos completos na nossa calculadora em",
  },

  timelines: {
    title: "Prazos do Despacho Aduaneiro",
    items: [
      { phase: "Obtenção de LI, CAT e LCVM (pré-despacho)", duration: "30 a 60 dias" },
      { phase: "Registro da DI após chegada", duration: "1 a 3 dias" },
      { phase: "Canal Verde (liberação automática)", duration: "1 a 2 dias" },
      { phase: "Canal Amarelo (conferência documental)", duration: "3 a 7 dias" },
      { phase: "Canal Vermelho (conferência física)", duration: "5 a 15 dias" },
      { phase: "Pagamento de tributos e emissão do CI", duration: "1 a 3 dias" },
      { phase: "Retirada do recinto alfandegado", duration: "1 a 2 dias" },
    ],
    totalEstimate: "7 a 15 dias úteis (após chegada do veículo, com licenças já obtidas)",
  },

  documentation: {
    title: "Documentação Necessária para o Despacho",
    groups: [
      {
        groupTitle: "Documentos do Importador",
        items: [
          "Habilitação no RADAR/Siscomex",
          "CPF e RG (PF) ou CNPJ e Contrato Social (PJ)",
          "Procuração para o despachante aduaneiro",
          "Comprovação de capacidade financeira",
        ],
      },
      {
        groupTitle: "Documentos do Veículo e Transporte",
        items: [
          "Commercial Invoice (Fatura Comercial)",
          "Bill of Lading (BL) ou Airway Bill (AWB)",
          "Packing List (Romaneio de Carga)",
          "Certificado de Origem (se aplicável)",
          "Título de Propriedade Original (Certificate of Title)",
        ],
      },
      {
        groupTitle: "Licenças e Certificados (obtidos pela EMC)",
        items: [
          "Licença de Importação (LI) — Decex/Siscomex",
          "Certificado de Adequação à Legislação de Trânsito (CAT) — Denatran",
          "Licença para Uso da Configuração do Veículo ou Motor (LCVM) — Ibama",
          "Declaração de Importação (DI) — Siscomex",
          "Comprovante de Importação (CI) — Receita Federal",
        ],
      },
    ],
  },

  comparison: {
    title: "Ro-Ro vs. Contêiner: Impacto no Despacho",
    intro: "O modal de transporte impacta a logística e os custos do desembaraço.",
    headerA: "Transporte Ro-Ro",
    headerB: "Transporte em Contêiner",
    rows: [
      { feature: "Método de Embarque", optionA: "Sobre as próprias rodas (balsa)", optionB: "Preso e lacrado em contêiner" },
      { feature: "Custo", optionA: "Geralmente mais econômico", optionB: "Pode ser mais caro, mas permite itens junto" },
      { feature: "Segurança", optionA: "Alta (convés fechado)", optionB: "Máxima (lacrado na origem)" },
      { feature: "Manuseio", optionA: "Mínimo (menos avarias)", optionB: "Mais manuseio, mas proteção total" },
      { feature: "Ideal para", optionA: "Veículos operacionais, SUVs", optionB: "Alto valor, clássicos, mudanças" },
      { feature: "Disponibilidade", optionA: "Portos específicos (ex: Itajaí)", optionB: "Maioria dos portos comerciais" },
    ],
  },

  faqs: [
    {
      question: "Posso importar um veículo usado para o Brasil?",
      answer: "A importação de veículos usados é restrita por lei. Permitida apenas para veículos com mais de 30 anos (coleção), diplomatas em missão ou brasileiros retornando após mais de 1 ano no exterior (retorno definitivo).",
    },
    {
      question: "O que acontece se minha DI cair em canal vermelho?",
      answer: "O canal vermelho significa inspeção física do veículo pela Receita Federal para verificar chassi, motor, cor e opcionais. A EMC acompanha a vistoria para garantir transparência e agilidade.",
    },
    {
      question: "Como o ICMS é calculado na importação?",
      answer: "Base de cálculo: (Valor Aduaneiro + II + IPI + PIS + COFINS) / (1 - Alíquota ICMS). O pagamento é via GNRE antes da entrega. A EMC cuida de todo o cálculo e emissão da guia.",
    },
    {
      question: "É mais barato fazer o desembaraço em Itajaí (SC) do que em São Paulo?",
      answer: "Santa Catarina oferece o benefício fiscal Pró-Cargas com ICMS mais atrativo para empresas importadoras. A viabilidade depende de análise completa. Nossos escritórios em Itajaí e SP fazem simulação comparativa.",
    },
    {
      question: "A EMC pode cuidar de todo o processo desde Miami até a entrega no Brasil?",
      answer: "Sim. Com nosso escritório em Miami, gerenciamos coleta, transporte ao porto, embarque, frete internacional e todo o despacho aduaneiro até a entrega na sua residência.",
    },
  ],

  ctaTitle: "Transforme a Burocracia em Simplicidade",
  ctaDescription: "A importação do seu veículo não precisa ser um caminho de incertezas. Com a EMC, você tem a segurança de uma equipe que entende cada detalhe do despacho aduaneiro.",

  relatedServices: [
    { label: "Importação de Veículos", href: "/importacao-de-veiculos" },
    { label: "Exportação de Veículos", href: "/exportacao-de-veiculos" },
    { label: "Transporte Internacional", href: "/transporte-internacional-de-veiculos" },
    { label: "Importação de Clássicos", href: "/importacao-de-carros-classicos" },
  ],
};

export default function DespachoAduaneiro() {
  return <ServicePageLayout data={data} />;
}
