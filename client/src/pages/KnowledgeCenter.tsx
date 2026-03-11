/* KnowledgeCenter — Hub de Conteúdo em Logística Automotiva */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Link, useRoute } from "wouter";
import { Search, BookOpen, ArrowRight, Ship, Globe, FileText, Plane, Car, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { openContact } from "@/lib/contact";

/* ── Category definitions ─────────────────────────────────── */
export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: string;
  tags: string[];
}

export const CATEGORIES = [
  {
    slug: "transporte-de-veiculos",
    label: "Transporte de Veículos",
    icon: Ship,
    description: "Guias completos sobre transporte marítimo, aéreo e terrestre de veículos nacionais e internacionais.",
    color: "text-blue-400",
  },
  {
    slug: "importacao",
    label: "Importação",
    icon: Globe,
    description: "Tudo sobre importação de veículos: legislação, custos, documentação e processos alfandegários.",
    color: "text-emerald-400",
  },
  {
    slug: "exportacao",
    label: "Exportação",
    icon: Plane,
    description: "Guias sobre exportação de veículos do Brasil para qualquer destino no mundo.",
    color: "text-amber-400",
  },
  {
    slug: "frete-internacional",
    label: "Frete Internacional",
    icon: FileText,
    description: "Comparações de modalidades, custos de frete, seguros e rotas internacionais.",
    color: "text-purple-400",
  },
  {
    slug: "carros-classicos",
    label: "Carros Clássicos",
    icon: Car,
    description: "Importação de veículos antigos, laudo ACB, placa preta e feiras internacionais.",
    color: "text-red-400",
  },
  {
    slug: "regulamentacoes",
    label: "Regulamentações",
    icon: Scale,
    description: "Legislação aduaneira, normas do DENATRAN, IBAMA, INMETRO e acordos internacionais.",
    color: "text-cyan-400",
  },
];

/* ── Article database (will be expanded as articles are created) ─── */
export const ARTICLES: Article[] = [
  // Transporte de Veículos
  {
    slug: "como-funciona-transporte-maritimo-veiculos",
    title: "Como Funciona o Transporte Marítimo de Veículos: Guia Completo 2026",
    description: "Entenda as modalidades RoRo e Container, prazos, custos e como escolher a melhor opção para transportar seu veículo por via marítima.",
    category: "transporte-de-veiculos",
    date: "2026-03-01",
    readTime: "12 min",
    tags: ["transporte marítimo", "RoRo", "container", "frete"],
  },
  {
    slug: "roro-vs-container-qual-melhor",
    title: "RoRo vs Container: Qual a Melhor Opção para Transportar Seu Veículo?",
    description: "Comparação detalhada entre as duas principais modalidades de transporte marítimo de veículos, com tabela de custos e prazos.",
    category: "transporte-de-veiculos",
    date: "2026-02-20",
    readTime: "10 min",
    tags: ["RoRo", "container", "comparação", "custos"],
  },
  // Importação
  {
    slug: "guia-completo-importacao-veiculos-brasil",
    title: "Guia Completo de Importação de Veículos para o Brasil em 2026",
    description: "Passo a passo detalhado para importar carros, motos e utilitários: documentação, impostos, prazos e dicas para economizar.",
    category: "importacao",
    date: "2026-03-05",
    readTime: "15 min",
    tags: ["importação", "veículos", "Brasil", "guia"],
  },
  {
    slug: "impostos-importacao-veiculos-brasil",
    title: "Impostos na Importação de Veículos: II, IPI, ICMS, PIS e COFINS Explicados",
    description: "Entenda cada imposto cobrado na importação de veículos, como são calculados e estratégias legais para otimizar custos.",
    category: "importacao",
    date: "2026-02-15",
    readTime: "11 min",
    tags: ["impostos", "II", "IPI", "ICMS", "tributação"],
  },
  {
    slug: "como-importar-carro-dos-eua",
    title: "Como Importar um Carro dos EUA para o Brasil: Passo a Passo",
    description: "Guia específico para importação de veículos americanos: leilões, dealers, documentação e logística EUA-Brasil.",
    category: "importacao",
    date: "2026-02-10",
    readTime: "13 min",
    tags: ["EUA", "importação", "leilões", "Copart", "IAAI"],
  },
  // Exportação
  {
    slug: "como-exportar-veiculo-do-brasil",
    title: "Como Exportar um Veículo do Brasil: Guia Completo",
    description: "Processo completo de exportação de veículos brasileiros: documentação, desembaraço, logística e mercados internacionais.",
    category: "exportacao",
    date: "2026-03-03",
    readTime: "12 min",
    tags: ["exportação", "Brasil", "documentação", "logística"],
  },
  // Frete Internacional
  {
    slug: "quanto-custa-frete-internacional-veiculo",
    title: "Quanto Custa o Frete Internacional de um Veículo em 2026?",
    description: "Tabela atualizada de custos de frete marítimo e aéreo para as principais rotas: EUA-Brasil, Europa-Brasil e Brasil-mundo.",
    category: "frete-internacional",
    date: "2026-03-08",
    readTime: "9 min",
    tags: ["frete", "custos", "tabela", "rotas"],
  },
  {
    slug: "seguro-transporte-internacional-veiculos",
    title: "Seguro para Transporte Internacional de Veículos: O Que Você Precisa Saber",
    description: "Tipos de seguro, coberturas All Risks, como acionar em caso de sinistro e quanto custa proteger seu veículo no transporte.",
    category: "frete-internacional",
    date: "2026-02-25",
    readTime: "8 min",
    tags: ["seguro", "All Risks", "transporte", "cobertura"],
  },
  // Carros Clássicos
  {
    slug: "importar-carro-classico-brasil-guia",
    title: "Importar Carro Clássico para o Brasil: Guia Definitivo 2026",
    description: "Tudo sobre importação de veículos antigos (+30 anos): isenção de IPI, laudo ACB, placa preta e feiras internacionais.",
    category: "carros-classicos",
    date: "2026-03-06",
    readTime: "14 min",
    tags: ["clássicos", "antigos", "ACB", "placa preta", "isenção"],
  },
  {
    slug: "feiras-internacionais-carros-classicos",
    title: "Principais Feiras Internacionais de Carros Clássicos para Compradores Brasileiros",
    description: "Calendário e guia das melhores feiras de veículos antigos nos EUA e Europa: Barrett-Jackson, Mecum, Retromobile e mais.",
    category: "carros-classicos",
    date: "2026-02-18",
    readTime: "10 min",
    tags: ["feiras", "Barrett-Jackson", "Mecum", "Retromobile"],
  },
  // Regulamentações
  {
    slug: "legislacao-importacao-veiculos-brasil-2026",
    title: "Legislação de Importação de Veículos no Brasil: Atualização 2026",
    description: "Resumo atualizado das normas do DENATRAN, IBAMA, INMETRO e Receita Federal para importação de veículos.",
    category: "regulamentacoes",
    date: "2026-03-10",
    readTime: "11 min",
    tags: ["legislação", "DENATRAN", "IBAMA", "INMETRO", "normas"],
  },
  {
    slug: "admissao-temporaria-veiculos-regras",
    title: "Admissão Temporária de Veículos: Regras, Prazos e Procedimentos",
    description: "Guia completo sobre o regime de admissão temporária: quem pode usar, documentação, prazos e obrigações fiscais.",
    category: "regulamentacoes",
    date: "2026-02-28",
    readTime: "9 min",
    tags: ["admissão temporária", "regime especial", "tributos", "prazos"],
  },
];

/* ── Category Page ────────────────────────────────────────── */
function CategoryPage({ categorySlug }: { categorySlug: string }) {
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  const categoryArticles = ARTICLES.filter((a) => a.category === categorySlug);

  if (!category) return null;

  const Icon = category.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="pt-28 pb-16 bg-gradient-to-b from-card to-background">
          <div className="container">
            <Link href="/centro-de-conhecimento" className="text-primary text-sm hover:underline mb-4 inline-block">
              &larr; Centro de Conhecimento
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${category.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display text-white">
                {category.label}
              </h1>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl font-body">{category.description}</p>
          </div>
        </section>

        {/* Articles */}
        <section className="py-12">
          <div className="container">
            {categoryArticles.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Artigos desta categoria serão publicados em breve.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {categoryArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-card">
          <div className="container text-center">
            <h2 className="text-2xl font-bold text-white mb-4 font-display">Tem dúvidas sobre {category.label.toLowerCase()}?</h2>
            <p className="text-gray-300 mb-6 font-body">Nossos especialistas podem ajudar com seu projeto específico.</p>
            <Button
              onClick={() => openContact(`Olá! Tenho dúvidas sobre ${category.label.toLowerCase()}.`)}
              className="bg-primary hover:bg-primary/90 font-bold"
            >
              Falar com Especialista
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

/* ── Article Card Component ───────────────────────────────── */
function ArticleCard({ article }: { article: Article }) {
  const category = CATEGORIES.find((c) => c.slug === article.category);
  return (
    <Link href={`/centro-de-conhecimento/${article.category}/${article.slug}`}>
      <article className="group p-6 rounded-xl border border-white/8 bg-card/80 hover:border-primary/25 transition-all duration-300 cursor-pointer h-full">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${category?.color || "text-primary"}`}>
            {category?.label}
          </span>
          <span className="text-gray-500 text-xs">&middot;</span>
          <span className="text-gray-500 text-xs">{article.readTime} de leitura</span>
        </div>
        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors mb-2 font-display leading-tight">
          {article.title}
        </h3>
        <p className="text-gray-400 text-sm font-body leading-relaxed mb-4">
          {article.description}
        </p>
        <div className="flex items-center gap-2 text-primary text-sm font-semibold">
          Ler artigo
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </article>
    </Link>
  );
}

/* ── Article Placeholder Page ─────────────────────────────── */
function ArticlePage({ categorySlug, articleSlug }: { categorySlug: string; articleSlug: string }) {
  const article = ARTICLES.find((a) => a.slug === articleSlug && a.category === categorySlug);
  const category = CATEGORIES.find((c) => c.slug === categorySlug);

  if (!article || !category) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Artigo não encontrado</h1>
            <Link href="/centro-de-conhecimento" className="text-primary hover:underline">
              Voltar ao Centro de Conhecimento
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Related articles from same category
  const related = ARTICLES.filter((a) => a.category === categorySlug && a.slug !== articleSlug).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Article Header */}
        <section className="pt-28 pb-12 bg-gradient-to-b from-card to-background">
          <div className="container max-w-4xl">
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-body">
              <Link href="/centro-de-conhecimento" className="hover:text-primary transition-colors">Centro de Conhecimento</Link>
              <span>/</span>
              <Link href={`/centro-de-conhecimento/${categorySlug}`} className="hover:text-primary transition-colors">{category.label}</Link>
            </nav>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display leading-tight mb-4">
              {article.title}
            </h1>
            <p className="text-gray-300 text-lg font-body mb-4">{article.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{new Date(article.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span>&middot;</span>
              <span>{article.readTime} de leitura</span>
            </div>
          </div>
        </section>

        {/* Article Body — placeholder for Markdown content */}
        <section className="py-12">
          <div className="container max-w-4xl">
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="bg-card/50 border border-white/10 rounded-xl p-8 text-center">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Conteúdo em preparação</h2>
                <p className="text-gray-400 font-body">
                  Este artigo está sendo finalizado por nossa equipe de especialistas. 
                  Enquanto isso, entre em contato para tirar suas dúvidas.
                </p>
                <Button
                  onClick={() => openContact(`Olá! Gostaria de saber mais sobre: ${article.title}`)}
                  className="mt-4 bg-primary hover:bg-primary/90"
                >
                  Falar com Especialista
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="py-12 bg-card">
            <div className="container max-w-4xl">
              <h2 className="text-2xl font-bold text-white mb-6 font-display">Artigos Relacionados</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map((a) => (
                  <Link key={a.slug} href={`/centro-de-conhecimento/${a.category}/${a.slug}`}>
                    <div className="p-4 rounded-lg border border-white/8 hover:border-primary/25 transition-all cursor-pointer">
                      <h3 className="text-sm font-bold text-white mb-2 font-display leading-tight hover:text-primary transition-colors">
                        {a.title}
                      </h3>
                      <span className="text-xs text-gray-500">{a.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16">
          <div className="container text-center">
            <h2 className="text-2xl font-bold text-white mb-4 font-display">Precisa de ajuda com seu projeto?</h2>
            <p className="text-gray-300 mb-6 font-body max-w-xl mx-auto">
              Nossa equipe de especialistas em logística automotiva pode ajudar com importação, exportação e transporte de veículos.
            </p>
            <Button
              onClick={() => openContact("Olá! Gostaria de uma assessoria personalizada.")}
              className="bg-primary hover:bg-primary/90 font-bold"
            >
              Solicitar Assessoria Gratuita
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />

      {/* JSON-LD Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.description,
            datePublished: article.date,
            author: {
              "@type": "Organization",
              name: "Enviando Meu Carro",
              url: "https://enviandomeucarro.com",
            },
            publisher: {
              "@type": "Organization",
              name: "Enviando Meu Carro",
              url: "https://enviandomeucarro.com",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://enviandomeucarro.com/centro-de-conhecimento/${categorySlug}/${articleSlug}`,
            },
          }),
        }}
      />
    </div>
  );
}

/* ── Main Knowledge Center Listing ────────────────────────── */
export default function KnowledgeCenter() {
  const [, categoryParams] = useRoute("/centro-de-conhecimento/:category");
  const [, articleParams] = useRoute("/centro-de-conhecimento/:category/:article");

  // Route to article page
  if (articleParams?.category && articleParams?.article) {
    return <ArticlePage categorySlug={articleParams.category} articleSlug={articleParams.article} />;
  }

  // Route to category page
  if (categoryParams?.category) {
    return <CategoryPage categorySlug={categoryParams.category} />;
  }

  // Main listing
  return <KnowledgeCenterListing />;
}

function KnowledgeCenterListing() {
  const [search, setSearch] = useState("");

  const filteredArticles = useMemo(() => {
    if (!search.trim()) return ARTICLES;
    const q = search.toLowerCase();
    return ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [search]);

  // Latest articles (sorted by date)
  const latestArticles = useMemo(
    () => [...ARTICLES].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6),
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="pt-28 pb-16 bg-gradient-to-b from-card to-background">
          <div className="container text-center">
            <span className="section-badge mb-4 inline-block">Conhecimento</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display mb-4">
              Centro de Conhecimento em{" "}
              <span className="text-primary">Logística Automotiva</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto font-body mb-8">
              Guias, artigos e tutoriais sobre importação, exportação e transporte internacional de veículos.
              Conteúdo produzido por especialistas com mais de 10 anos de experiência.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar artigos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card/80 border-white/15 focus:border-primary h-12 text-base"
              />
            </div>
          </div>
        </section>

        {/* Search results */}
        {search.trim() && (
          <section className="py-12">
            <div className="container">
              <h2 className="text-xl font-bold text-white mb-6 font-display">
                {filteredArticles.length} resultado{filteredArticles.length !== 1 ? "s" : ""} para "{search}"
              </h2>
              {filteredArticles.length === 0 ? (
                <p className="text-gray-400 font-body">Nenhum artigo encontrado. Tente outro termo de busca.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Categories */}
        {!search.trim() && (
          <>
            <section className="py-12">
              <div className="container">
                <h2 className="text-2xl font-bold text-white mb-8 font-display">Categorias</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const count = ARTICLES.filter((a) => a.category === cat.slug).length;
                    return (
                      <Link key={cat.slug} href={`/centro-de-conhecimento/${cat.slug}`}>
                        <div className="group p-5 rounded-xl border border-white/8 bg-card/80 hover:border-primary/25 transition-all duration-300 cursor-pointer">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${cat.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white group-hover:text-primary transition-colors font-display">
                                {cat.label}
                              </h3>
                              <span className="text-xs text-gray-500">{count} artigo{count !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm font-body leading-relaxed">{cat.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Latest Articles */}
            <section className="py-12 bg-card">
              <div className="container">
                <h2 className="text-2xl font-bold text-white mb-8 font-display">Artigos Recentes</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latestArticles.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* CTA */}
        <section className="py-16">
          <div className="container text-center">
            <h2 className="text-2xl font-bold text-white mb-4 font-display">Não encontrou o que procurava?</h2>
            <p className="text-gray-300 mb-6 font-body max-w-xl mx-auto">
              Nossa equipe de especialistas pode responder suas dúvidas sobre importação, exportação e logística automotiva.
            </p>
            <Button
              onClick={() => openContact("Olá! Tenho uma dúvida sobre logística automotiva.")}
              className="bg-primary hover:bg-primary/90 font-bold"
            >
              Falar com Especialista
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />

      {/* JSON-LD CollectionPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Centro de Conhecimento em Logística Automotiva",
            description: "Guias, artigos e tutoriais sobre importação, exportação e transporte internacional de veículos.",
            url: "https://enviandomeucarro.com/centro-de-conhecimento",
            publisher: {
              "@type": "Organization",
              name: "Enviando Meu Carro",
              url: "https://enviandomeucarro.com",
            },
          }),
        }}
      />
    </div>
  );
}
