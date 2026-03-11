/* KnowledgeCenter — Hub de Conteúdo em Logística Automotiva
 * Now powered by CMS database via tRPC (no more hardcoded articles).
 * Falls back to a placeholder if CMS data is not yet available.
 */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Link, useRoute } from "wouter";
import {
  Search,
  BookOpen,
  ArrowRight,
  Ship,
  Globe,
  FileText,
  Plane,
  Car,
  Scale,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { openContact } from "@/lib/contact";
import { trpc } from "@/lib/trpc";
import { trackCTAClick, trackWhatsAppClick } from "@/lib/analytics";

/* ── Icon map — maps DB icon name to Lucide component ──── */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Ship,
  Globe,
  FileText,
  Plane,
  Car,
  Scale,
};

/* ── Color map — maps DB color to Tailwind class ──────── */
const DEFAULT_COLORS: Record<string, string> = {
  "text-blue-400": "text-blue-400",
  "text-emerald-400": "text-emerald-400",
  "text-amber-400": "text-amber-400",
  "text-purple-400": "text-purple-400",
  "text-red-400": "text-red-400",
  "text-cyan-400": "text-cyan-400",
};

/* ── Types ─────────────────────────────────────────────── */
interface CmsArticle {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  content?: string | null;
  author: string | null;
  readTime: string | null;
  tags: string[];
  featuredImage: string | null;
  categoryId: number | null;
  categorySlug?: string | null;
  status: string;
  publishedAt: Date | string | null;
  createdAt: Date | string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface CmsCategory {
  id: number;
  slug: string;
  label: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  articleCount: number;
}

/* ── Category Page ────────────────────────────────────────── */
function CategoryPage({ categorySlug }: { categorySlug: string }) {
  const { data: categories = [], isLoading: catLoading } = trpc.cms.listCategories.useQuery();
  const { data: articlesData, isLoading: artLoading } = trpc.cms.listArticles.useQuery({
    categorySlug,
    limit: 50,
  });

  const category = categories.find((c: CmsCategory) => c.slug === categorySlug);
  const articles = articlesData?.articles ?? [];
  const isLoading = catLoading || artLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Categoria não encontrada</h1>
            <Link href="/centro-de-conhecimento" className="text-primary hover:underline">
              Voltar ao Centro de Conhecimento
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const IconComp = ICON_MAP[category.icon ?? ""] ?? BookOpen;
  const colorClass = category.color && DEFAULT_COLORS[category.color] ? DEFAULT_COLORS[category.color] : "text-primary";

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
              <div className={`w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${colorClass}`}>
                <IconComp className="w-6 h-6" />
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
            {articles.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Artigos desta categoria serão publicados em breve.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {articles.map((article: CmsArticle) => (
                  <ArticleCard key={article.slug} article={article} categories={categories} />
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
              onClick={() => {
                trackCTAClick("Falar com Especialista", `knowledge_category_${category.slug}`, "whatsapp", "Falar com Especialista");
                trackWhatsAppClick(`knowledge_category_${category.slug}`, `Olá! Tenho dúvidas sobre ${category.label.toLowerCase()}.`);
                openContact(`Olá! Tenho dúvidas sobre ${category.label.toLowerCase()}.`, "site", "whatsapp", `conhecimento_categoria_${category.slug}`);
              }}
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
function ArticleCard({ article, categories }: { article: CmsArticle; categories: CmsCategory[] }) {
  const category = categories.find((c: CmsCategory) => c.id === article.categoryId);
  const catSlug = article.categorySlug ?? category?.slug ?? "geral";
  const colorClass = category?.color && DEFAULT_COLORS[category.color] ? DEFAULT_COLORS[category.color] : "text-primary";
  const dateStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })
    : article.createdAt
      ? new Date(article.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })
      : "";

  return (
    <Link href={`/centro-de-conhecimento/${catSlug}/${article.slug}`}>
      <article className="group p-6 rounded-xl border border-white/8 bg-card/80 hover:border-primary/25 transition-all duration-300 cursor-pointer h-full">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold uppercase tracking-wider ${colorClass}`}>
            {category?.label ?? "Geral"}
          </span>
          <span className="text-gray-500 text-xs">&middot;</span>
          <span className="text-gray-500 text-xs">{article.readTime ?? "5 min"} de leitura</span>
          {article.status === "draft" && (
            <>
              <span className="text-gray-500 text-xs">&middot;</span>
              <span className="text-amber-400/80 text-xs font-medium">Em preparação</span>
            </>
          )}
        </div>
        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors mb-2 font-display leading-tight">
          {article.title}
        </h3>
        <p className="text-gray-400 text-sm font-body leading-relaxed mb-4">
          {article.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary text-sm font-semibold">
            Ler artigo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          {dateStr && <span className="text-gray-500 text-xs">{dateStr}</span>}
        </div>
      </article>
    </Link>
  );
}

/* ── Article Page ─────────────────────────────────────────── */
function ArticlePage({ categorySlug, articleSlug }: { categorySlug: string; articleSlug: string }) {
  const { data: article, isLoading } = trpc.cms.getArticle.useQuery({ slug: articleSlug });
  const { data: categories = [] } = trpc.cms.listCategories.useQuery();
  const { data: relatedData } = trpc.cms.listArticles.useQuery({
    categorySlug,
    limit: 4,
  });

  const category = categories.find((c: CmsCategory) => c.slug === categorySlug);
  const related = (relatedData?.articles ?? []).filter((a: CmsArticle) => a.slug !== articleSlug).slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
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

  const hasContent = article.status === "published" && article.content;
  const articleDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
    : article.createdAt
      ? new Date(article.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
      : "";

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
              <Link href={`/centro-de-conhecimento/${categorySlug}`} className="hover:text-primary transition-colors">{category?.label ?? categorySlug}</Link>
            </nav>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display leading-tight mb-4">
              {article.title}
            </h1>
            <p className="text-gray-300 text-lg font-body mb-4">{article.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              {articleDate && <span>{articleDate}</span>}
              {article.readTime && (
                <>
                  <span>&middot;</span>
                  <span>{article.readTime} de leitura</span>
                </>
              )}
              {article.author && (
                <>
                  <span>&middot;</span>
                  <span>Por {article.author}</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Article Body */}
        <section className="py-12">
          <div className="container max-w-4xl">
            {hasContent ? (
              <div
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:font-display prose-headings:text-white
                  prose-p:text-gray-300 prose-p:font-body prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white
                  prose-li:text-gray-300
                  prose-table:border-white/10
                  prose-th:text-white prose-th:border-white/10
                  prose-td:text-gray-300 prose-td:border-white/10"
                dangerouslySetInnerHTML={{ __html: article.content! }}
              />
            ) : (
              <div className="bg-card/50 border border-white/10 rounded-xl p-8 text-center">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Conteúdo em preparação</h2>
                <p className="text-gray-400 font-body">
                  Este artigo está sendo finalizado por nossa equipe de especialistas.
                  Enquanto isso, entre em contato para tirar suas dúvidas.
                </p>
                <Button
                  onClick={() => {
                    trackCTAClick("Falar com Especialista", `knowledge_article_${article.slug}`, "whatsapp", "Falar com Especialista");
                    trackWhatsAppClick(`knowledge_article_${article.slug}`, `Olá! Gostaria de saber mais sobre: ${article.title}`);
                    openContact(`Olá! Gostaria de saber mais sobre: ${article.title}`, "site", "whatsapp", `conhecimento_artigo_${article.slug}`);
                  }}
                  className="mt-4 bg-primary hover:bg-primary/90"
                >
                  Falar com Especialista
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="py-12 bg-card">
            <div className="container max-w-4xl">
              <h2 className="text-2xl font-bold text-white mb-6 font-display">Artigos Relacionados</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map((a: CmsArticle) => {
                  const relCatSlug = a.categorySlug ?? categorySlug;
                  return (
                    <Link key={a.slug} href={`/centro-de-conhecimento/${relCatSlug}/${a.slug}`}>
                      <div className="p-4 rounded-lg border border-white/8 hover:border-primary/25 transition-all cursor-pointer">
                        <h3 className="text-sm font-bold text-white mb-2 font-display leading-tight hover:text-primary transition-colors">
                          {a.title}
                        </h3>
                        <span className="text-xs text-gray-500">{a.readTime ?? "5 min"}</span>
                      </div>
                    </Link>
                  );
                })}
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
              onClick={() => {
                trackCTAClick("Assessoria Personalizada", "knowledge_article_bottom", "whatsapp", "Solicitar Assessoria");
                trackWhatsAppClick("knowledge_article_bottom", "Olá! Gostaria de uma assessoria personalizada.");
                openContact("Olá! Gostaria de uma assessoria personalizada.", "site", "whatsapp", "conhecimento_assessoria");
              }}
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
            "@type": article.schemaData?.["@type"] ?? "Article",
            headline: article.metaTitle ?? article.title,
            description: article.metaDescription ?? article.description,
            datePublished: article.publishedAt ?? article.createdAt,
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
  const { data: categories = [], isLoading: catLoading } = trpc.cms.listCategories.useQuery();
  const { data: articlesData, isLoading: artLoading } = trpc.cms.listArticles.useQuery({
    limit: 50,
    search: search.trim() || undefined,
  });

  const articles = articlesData?.articles ?? [];
  const isLoading = catLoading || artLoading;

  // Latest articles (sorted by date)
  const latestArticles = useMemo(
    () =>
      [...articles]
        .sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 6),
    [articles]
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

        {/* Loading state */}
        {isLoading && (
          <section className="py-12">
            <div className="container flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </section>
        )}

        {/* Search results */}
        {!isLoading && search.trim() && (
          <section className="py-12">
            <div className="container">
              <h2 className="text-xl font-bold text-white mb-6 font-display">
                {articles.length} resultado{articles.length !== 1 ? "s" : ""} para &ldquo;{search}&rdquo;
              </h2>
              {articles.length === 0 ? (
                <p className="text-gray-400 font-body">Nenhum artigo encontrado. Tente outro termo de busca.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {articles.map((article: CmsArticle) => (
                    <ArticleCard key={article.slug} article={article} categories={categories} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Categories + Latest Articles */}
        {!isLoading && !search.trim() && (
          <>
            <section className="py-12">
              <div className="container">
                <h2 className="text-2xl font-bold text-white mb-8 font-display">Categorias</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat: CmsCategory) => {
                    const IconComp = ICON_MAP[cat.icon ?? ""] ?? BookOpen;
                    const colorClass = cat.color && DEFAULT_COLORS[cat.color] ? DEFAULT_COLORS[cat.color] : "text-primary";
                    return (
                      <Link key={cat.slug} href={`/centro-de-conhecimento/${cat.slug}`}>
                        <div className="group p-5 rounded-xl border border-white/8 bg-card/80 hover:border-primary/25 transition-all duration-300 cursor-pointer">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${colorClass}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white group-hover:text-primary transition-colors font-display">
                                {cat.label}
                              </h3>
                              <span className="text-xs text-gray-500">{cat.articleCount} artigo{cat.articleCount !== 1 ? "s" : ""}</span>
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
            {latestArticles.length > 0 && (
              <section className="py-12 bg-card">
                <div className="container">
                  <h2 className="text-2xl font-bold text-white mb-8 font-display">Artigos Recentes</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestArticles.map((article: CmsArticle) => (
                      <ArticleCard key={article.slug} article={article} categories={categories} />
                    ))}
                  </div>
                </div>
              </section>
            )}
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
              onClick={() => {
                trackCTAClick("Falar com Especialista", "knowledge_main_bottom", "whatsapp", "Falar com Especialista");
                trackWhatsAppClick("knowledge_main_bottom", "Olá! Tenho uma dúvida sobre logística automotiva.");
                openContact("Olá! Tenho uma dúvida sobre logística automotiva.", "site", "whatsapp", "conhecimento_duvida");
              }}
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
