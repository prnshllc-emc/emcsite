/**
 * Seed CMS data — Populates the 6 Knowledge Center categories
 * and 12 article stubs into the database via the CMS REST API.
 *
 * Usage: node scripts/seed-cms-data.mjs
 */
import 'dotenv/config';

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api/cms`;
const API_KEY = process.env.CMS_API_KEY;

if (!API_KEY) {
  console.error('❌ CMS_API_KEY not set');
  process.exit(1);
}

const headers = {
  'x-cms-api-key': API_KEY,
  'Content-Type': 'application/json',
};

// ── Categories ──────────────────────────────────────────────
const CATEGORIES = [
  {
    slug: "transporte-de-veiculos",
    label: "Transporte de Veículos",
    description: "Guias completos sobre transporte marítimo, aéreo e terrestre de veículos nacionais e internacionais.",
    icon: "Ship",
    color: "text-blue-400",
    sortOrder: 1,
  },
  {
    slug: "importacao",
    label: "Importação",
    description: "Tudo sobre importação de veículos: legislação, custos, documentação e processos alfandegários.",
    icon: "Globe",
    color: "text-emerald-400",
    sortOrder: 2,
  },
  {
    slug: "exportacao",
    label: "Exportação",
    description: "Guias sobre exportação de veículos do Brasil para qualquer destino no mundo.",
    icon: "Plane",
    color: "text-amber-400",
    sortOrder: 3,
  },
  {
    slug: "frete-internacional",
    label: "Frete Internacional",
    description: "Comparações de modalidades, custos de frete, seguros e rotas internacionais.",
    icon: "FileText",
    color: "text-purple-400",
    sortOrder: 4,
  },
  {
    slug: "carros-classicos",
    label: "Carros Clássicos",
    description: "Importação de veículos antigos, laudo ACB, placa preta e feiras internacionais.",
    icon: "Car",
    color: "text-red-400",
    sortOrder: 5,
  },
  {
    slug: "regulamentacoes",
    label: "Regulamentações",
    description: "Legislação aduaneira, normas do DENATRAN, IBAMA, INMETRO e acordos internacionais.",
    icon: "Scale",
    color: "text-cyan-400",
    sortOrder: 6,
  },
];

// ── Articles ────────────────────────────────────────────────
const ARTICLES = [
  // Transporte de Veículos
  {
    slug: "como-funciona-transporte-maritimo-veiculos",
    title: "Como Funciona o Transporte Marítimo de Veículos: Guia Completo 2026",
    description: "Entenda as modalidades RoRo e Container, prazos, custos e como escolher a melhor opção para transportar seu veículo por via marítima.",
    categorySlug: "transporte-de-veiculos",
    readTime: "12 min",
    tags: ["transporte marítimo", "RoRo", "container", "frete"],
    metaTitle: "Transporte Marítimo de Veículos: Guia Completo 2026 | EMC",
    metaDescription: "Entenda as modalidades RoRo e Container, prazos, custos e como escolher a melhor opção para transportar seu veículo por via marítima.",
  },
  {
    slug: "roro-vs-container-qual-melhor",
    title: "RoRo vs Container: Qual a Melhor Opção para Transportar Seu Veículo?",
    description: "Comparação detalhada entre as duas principais modalidades de transporte marítimo de veículos, com tabela de custos e prazos.",
    categorySlug: "transporte-de-veiculos",
    readTime: "10 min",
    tags: ["RoRo", "container", "comparação", "custos"],
    metaTitle: "RoRo vs Container: Qual Melhor para Transporte de Veículos | EMC",
    metaDescription: "Comparação detalhada entre RoRo e Container para transporte marítimo de veículos. Tabela de custos, prazos e vantagens.",
  },
  // Importação
  {
    slug: "guia-completo-importacao-veiculos-brasil",
    title: "Guia Completo de Importação de Veículos para o Brasil em 2026",
    description: "Passo a passo detalhado para importar carros, motos e utilitários: documentação, impostos, prazos e dicas para economizar.",
    categorySlug: "importacao",
    readTime: "15 min",
    tags: ["importação", "veículos", "Brasil", "guia"],
    metaTitle: "Guia Completo de Importação de Veículos para o Brasil 2026 | EMC",
    metaDescription: "Passo a passo para importar carros, motos e utilitários para o Brasil. Documentação, impostos, prazos e dicas.",
  },
  {
    slug: "impostos-importacao-veiculos-brasil",
    title: "Impostos na Importação de Veículos: II, IPI, ICMS, PIS e COFINS Explicados",
    description: "Entenda cada imposto cobrado na importação de veículos, como são calculados e estratégias legais para otimizar custos.",
    categorySlug: "importacao",
    readTime: "11 min",
    tags: ["impostos", "II", "IPI", "ICMS", "tributação"],
    metaTitle: "Impostos na Importação de Veículos: II, IPI, ICMS Explicados | EMC",
    metaDescription: "Entenda cada imposto na importação de veículos e estratégias legais para otimizar custos tributários.",
  },
  {
    slug: "como-importar-carro-dos-eua",
    title: "Como Importar um Carro dos EUA para o Brasil: Passo a Passo",
    description: "Guia específico para importação de veículos americanos: leilões, dealers, documentação e logística EUA-Brasil.",
    categorySlug: "importacao",
    readTime: "13 min",
    tags: ["EUA", "importação", "leilões", "Copart", "IAAI"],
    metaTitle: "Como Importar Carro dos EUA para o Brasil: Passo a Passo | EMC",
    metaDescription: "Guia completo para importar veículos americanos. Leilões Copart e IAAI, documentação e logística EUA-Brasil.",
  },
  // Exportação
  {
    slug: "como-exportar-veiculo-do-brasil",
    title: "Como Exportar um Veículo do Brasil: Guia Completo",
    description: "Processo completo de exportação de veículos brasileiros: documentação, desembaraço, logística e mercados internacionais.",
    categorySlug: "exportacao",
    readTime: "12 min",
    tags: ["exportação", "Brasil", "documentação", "logística"],
    metaTitle: "Como Exportar Veículo do Brasil: Guia Completo | EMC",
    metaDescription: "Processo completo de exportação de veículos brasileiros. Documentação, desembaraço e mercados internacionais.",
  },
  // Frete Internacional
  {
    slug: "quanto-custa-frete-internacional-veiculo",
    title: "Quanto Custa o Frete Internacional de um Veículo em 2026?",
    description: "Tabela atualizada de custos de frete marítimo e aéreo para as principais rotas: EUA-Brasil, Europa-Brasil e Brasil-mundo.",
    categorySlug: "frete-internacional",
    readTime: "9 min",
    tags: ["frete", "custos", "tabela", "rotas"],
    metaTitle: "Custo do Frete Internacional de Veículos 2026 | EMC",
    metaDescription: "Tabela atualizada de custos de frete marítimo e aéreo para veículos nas principais rotas internacionais.",
  },
  {
    slug: "seguro-transporte-internacional-veiculos",
    title: "Seguro para Transporte Internacional de Veículos: O Que Você Precisa Saber",
    description: "Tipos de seguro, coberturas All Risks, como acionar em caso de sinistro e quanto custa proteger seu veículo no transporte.",
    categorySlug: "frete-internacional",
    readTime: "8 min",
    tags: ["seguro", "All Risks", "transporte", "cobertura"],
    metaTitle: "Seguro para Transporte Internacional de Veículos | EMC",
    metaDescription: "Tipos de seguro, coberturas All Risks e como proteger seu veículo no transporte internacional.",
  },
  // Carros Clássicos
  {
    slug: "importar-carro-classico-brasil-guia",
    title: "Importar Carro Clássico para o Brasil: Guia Definitivo 2026",
    description: "Tudo sobre importação de veículos antigos (+30 anos): isenção de IPI, laudo ACB, placa preta e feiras internacionais.",
    categorySlug: "carros-classicos",
    readTime: "14 min",
    tags: ["clássicos", "antigos", "ACB", "placa preta", "isenção"],
    metaTitle: "Importar Carro Clássico para o Brasil: Guia Definitivo 2026 | EMC",
    metaDescription: "Guia completo sobre importação de veículos antigos. Isenção de IPI, laudo ACB, placa preta e feiras internacionais.",
  },
  {
    slug: "feiras-internacionais-carros-classicos",
    title: "Principais Feiras Internacionais de Carros Clássicos para Compradores Brasileiros",
    description: "Calendário e guia das melhores feiras de veículos antigos nos EUA e Europa: Barrett-Jackson, Mecum, Retromobile e mais.",
    categorySlug: "carros-classicos",
    readTime: "10 min",
    tags: ["feiras", "Barrett-Jackson", "Mecum", "Retromobile"],
    metaTitle: "Feiras Internacionais de Carros Clássicos para Brasileiros | EMC",
    metaDescription: "Calendário e guia das melhores feiras de veículos antigos nos EUA e Europa para compradores brasileiros.",
  },
  // Regulamentações
  {
    slug: "legislacao-importacao-veiculos-brasil-2026",
    title: "Legislação de Importação de Veículos no Brasil: Atualização 2026",
    description: "Resumo atualizado das normas do DENATRAN, IBAMA, INMETRO e Receita Federal para importação de veículos.",
    categorySlug: "regulamentacoes",
    readTime: "11 min",
    tags: ["legislação", "DENATRAN", "IBAMA", "INMETRO", "normas"],
    metaTitle: "Legislação de Importação de Veículos no Brasil 2026 | EMC",
    metaDescription: "Resumo atualizado das normas do DENATRAN, IBAMA, INMETRO e Receita Federal para importação de veículos.",
  },
  {
    slug: "admissao-temporaria-veiculos-regras",
    title: "Admissão Temporária de Veículos: Regras, Prazos e Procedimentos",
    description: "Guia completo sobre o regime de admissão temporária: quem pode usar, documentação, prazos e obrigações fiscais.",
    categorySlug: "regulamentacoes",
    readTime: "9 min",
    tags: ["admissão temporária", "regime especial", "tributos", "prazos"],
    metaTitle: "Admissão Temporária de Veículos: Regras e Procedimentos | EMC",
    metaDescription: "Guia completo sobre admissão temporária de veículos. Regras, prazos, documentação e obrigações fiscais.",
  },
];

async function run() {
  console.log('\n📦 Seeding CMS data...\n');

  // 1. Seed categories via bulk endpoint
  console.log('📁 Seeding categories...');
  const catRes = await fetch(`${BASE_URL}/categories/bulk`, {
    method: 'POST',
    headers,
    body: JSON.stringify(CATEGORIES),
  });
  if (!catRes.ok) {
    console.error('❌ Failed to seed categories:', await catRes.text());
    process.exit(1);
  }
  const catResult = await catRes.json();
  console.log(`  ✅ ${catResult.total} categories processed:`, catResult.data.map(c => `${c.slug} (${c.action})`).join(', '));

  // 2. Get category map (slug → id)
  const catListRes = await fetch(`${BASE_URL}/categories`, { headers });
  const { data: categories } = await catListRes.json();
  const catMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log(`  📋 Category map:`, Object.fromEntries(catMap));

  // 3. Seed articles via bulk endpoint
  console.log('\n📝 Seeding articles...');
  const articlesWithCategoryId = ARTICLES.map(({ categorySlug, ...rest }) => ({
    ...rest,
    categoryId: catMap.get(categorySlug) || null,
    status: 'draft', // Start as draft — content curation task will fill and publish
    author: 'Equipe EMC',
  }));

  const artRes = await fetch(`${BASE_URL}/articles/bulk`, {
    method: 'POST',
    headers,
    body: JSON.stringify(articlesWithCategoryId),
  });
  if (!artRes.ok) {
    console.error('❌ Failed to seed articles:', await artRes.text());
    process.exit(1);
  }
  const artResult = await artRes.json();
  console.log(`  ✅ ${artResult.total} articles processed:`);
  for (const a of artResult.data) {
    console.log(`    ${a.action === 'error' ? '❌' : '✅'} ${a.slug} → ${a.action}${a.id ? ` (id: ${a.id})` : ''}${a.error ? `: ${a.error}` : ''}`);
  }

  // 4. Verify
  console.log('\n🔍 Verifying...');
  const healthRes = await fetch(`${BASE_URL}/health`, { headers });
  const health = await healthRes.json();
  console.log(`  📊 Articles: ${health.counts.articles}, Categories: ${health.counts.categories}, Media: ${health.counts.media}`);

  console.log('\n✅ CMS data seeding complete!\n');
}

run().catch(console.error);
