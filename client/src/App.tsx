import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SiteSettingsProvider } from "./contexts/SiteSettingsContext";
import { lazy, Suspense } from "react";
import Home from "./pages/Home";
import CookieConsentBanner from "./components/CookieConsent";

const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));

/* Service Pages — deep SEO content */
const ImportacaoVeiculos = lazy(() => import("./pages/services/ImportacaoVeiculos"));
const ExportacaoVeiculos = lazy(() => import("./pages/services/ExportacaoVeiculos"));
const DespachoAduaneiro = lazy(() => import("./pages/services/DespachoAduaneiro"));
const TransporteInternacional = lazy(() => import("./pages/services/TransporteInternacional"));
const ImportacaoClassicos = lazy(() => import("./pages/services/ImportacaoClassicos"));
const AdmissaoTemporaria = lazy(() => import("./pages/services/AdmissaoTemporaria"));
const KnowledgeCenter = lazy(() => import("./pages/KnowledgeCenter"));

/* Route & Cost Pages — high-intent SEO */
const BrasilEUA = lazy(() => import("./pages/routes/BrasilEUA"));
const BrasilEuropa = lazy(() => import("./pages/routes/BrasilEuropa"));
const EUABrasil = lazy(() => import("./pages/routes/EUABrasil"));
const CustoImportar = lazy(() => import("./pages/routes/CustoImportar"));
const CustoExportar = lazy(() => import("./pages/routes/CustoExportar"));

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/politica-de-privacidade"} component={PrivacyPolicy} />
        <Route path={"/termos-de-uso"} component={TermsOfUse} />
        {/* Service Pages */}
        <Route path={"/importacao-de-veiculos"} component={ImportacaoVeiculos} />
        <Route path={"/exportacao-de-veiculos"} component={ExportacaoVeiculos} />
        <Route path={"/despacho-aduaneiro"} component={DespachoAduaneiro} />
        <Route path={"/transporte-internacional-de-veiculos"} component={TransporteInternacional} />
        <Route path={"/importacao-de-carros-classicos"} component={ImportacaoClassicos} />
        <Route path={"/admissao-temporaria"} component={AdmissaoTemporaria} />
        {/* Route Pages */}
        <Route path={"/rotas/enviar-carro-brasil-estados-unidos"} component={BrasilEUA} />
        <Route path={"/rotas/enviar-carro-brasil-europa"} component={BrasilEuropa} />
        <Route path={"/rotas/importar-carro-estados-unidos-brasil"} component={EUABrasil} />
        {/* Cost Pages */}
        <Route path={"/custos/quanto-custa-importar-veiculo"} component={CustoImportar} />
        <Route path={"/custos/quanto-custa-exportar-carro"} component={CustoExportar} />
        {/* Knowledge Center */}
        <Route path={"/centro-de-conhecimento/:category/:article"} component={KnowledgeCenter} />
        <Route path={"/centro-de-conhecimento/:category"} component={KnowledgeCenter} />
        <Route path={"/centro-de-conhecimento"} component={KnowledgeCenter} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <SiteSettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <CookieConsentBanner />
          </TooltipProvider>
        </SiteSettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
