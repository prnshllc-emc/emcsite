import fs from 'fs';
import path from 'path';

const json = JSON.parse(fs.readFileSync('/home/ubuntu/generate_route_pages.json', 'utf-8'));

const pageConfigs = [
  { filename: 'BrasilEUA.tsx', slug: 'enviar-carro-brasil-estados-unidos' },
  { filename: 'BrasilEuropa.tsx', slug: 'enviar-carro-brasil-europa' },
  { filename: 'EUABrasil.tsx', slug: 'importar-carro-estados-unidos-brasil' },
  { filename: 'CustoImportar.tsx', slug: 'quanto-custa-importar-veiculo' },
  { filename: 'CustoExportar.tsx', slug: 'quanto-custa-exportar-carro' },
];

const outDir = '/home/ubuntu/enviando-meu-carro/client/src/pages/routes';
fs.mkdirSync(outDir, { recursive: true });

for (let i = 0; i < json.results.length; i++) {
  const result = json.results[i];
  const config = pageConfigs[i];
  
  let pageData;
  try {
    pageData = JSON.parse(result.output.page_json);
  } catch (e) {
    // Try to fix truncated JSON
    let raw = result.output.page_json;
    // Remove trailing incomplete content and close arrays/objects
    const lastComplete = raw.lastIndexOf('}');
    if (lastComplete > 0) {
      raw = raw.substring(0, lastComplete + 1);
      // Count open brackets
      const opens = (raw.match(/\[/g) || []).length;
      const closes = (raw.match(/\]/g) || []).length;
      for (let j = 0; j < opens - closes; j++) raw += ']';
      const openBraces = (raw.match(/\{/g) || []).length;
      const closeBraces = (raw.match(/\}/g) || []).length;
      for (let j = 0; j < openBraces - closeBraces; j++) raw += '}';
    }
    try {
      pageData = JSON.parse(raw);
    } catch (e2) {
      console.error(`Failed to parse page ${i}: ${e2.message}`);
      // Create minimal fallback data
      pageData = createFallbackData(config.slug);
    }
  }

  // Ensure all required fields exist
  pageData = ensureFields(pageData, config.slug);
  
  const component = generateComponent(config.filename.replace('.tsx', ''), pageData);
  fs.writeFileSync(path.join(outDir, config.filename), component);
  console.log(`Created ${config.filename} (${result.output.word_count} words)`);
}

function ensureFields(data, slug) {
  const defaults = {
    title: slug.replace(/-/g, ' '),
    subtitle: '',
    metaDescription: '',
    origin: 'Brasil',
    destination: 'Destino',
    introText: '',
    sections: [],
    steps: [],
    costFactors: [],
    timeline: '30-45 dias',
    modalities: [],
    documents: [],
    faqs: [],
    relatedRoutes: [],
    ctaText: 'Olá! Gostaria de uma cotação.',
    calculatorLink: 'https://calculadora.enviandomeucarro.com',
  };
  return { ...defaults, ...data };
}

function createFallbackData(slug) {
  return {
    title: slug.replace(/-/g, ' '),
    subtitle: 'Guia completo com custos e prazos',
    metaDescription: '',
    origin: 'Brasil',
    destination: 'Destino',
    introText: 'Conteúdo em preparação.',
    sections: [],
    steps: [],
    costFactors: [],
    timeline: '30-45 dias',
    modalities: [],
    documents: [],
    faqs: [],
    relatedRoutes: [],
    ctaText: 'Olá! Gostaria de uma cotação.',
    calculatorLink: 'https://calculadora.enviandomeucarro.com',
  };
}

function generateComponent(name, data) {
  // Escape backticks and dollar signs in strings
  const jsonStr = JSON.stringify(data, null, 2)
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
  
  return `/* ${name} — Auto-generated route/cost page */
import RoutePageLayout from "@/components/RoutePageLayout";
import type { RoutePageData } from "@/components/RoutePageLayout";

const PAGE_DATA: RoutePageData = ${JSON.stringify(data, null, 2)};

export default function ${name}() {
  return <RoutePageLayout data={PAGE_DATA} />;
}
`;
}

console.log('Done! Created 5 route pages.');
