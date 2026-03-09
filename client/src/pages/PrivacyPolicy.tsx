/* PrivacyPolicy — LGPD-compliant Privacy Policy page */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function PrivacyPolicy() {
  const { get } = useSiteSettings();
  const emailPrimary = get("email_primary");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main id="main-content" className="flex-1 pt-28 pb-20">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-body">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>

          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Política de Privacidade
              </h1>
              <p className="text-muted-foreground text-sm font-body mt-1">
                Última atualização: 09 de março de 2026
              </p>
            </div>
          </div>

          {/* Content */}
          <article className="prose prose-invert max-w-none space-y-8 font-body text-muted-foreground leading-relaxed">

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">1. Introdução</h2>
              <p>
                A <strong className="text-white">Enviando Meu Carro (EMC)</strong>, empresa especializada em importação e exportação de veículos, com sede em Miami, FL, EUA, e escritórios em São Paulo, SP e Itajaí, SC, Brasil, está comprometida com a proteção da privacidade e dos dados pessoais de seus clientes, parceiros e visitantes do site.
              </p>
              <p>
                Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos suas informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e demais legislações aplicáveis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">2. Dados que Coletamos</h2>
              <p>Podemos coletar os seguintes tipos de dados pessoais:</p>
              <div className="bg-card/50 border border-white/10 rounded-xl p-6 space-y-4 mt-4">
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Dados de Identificação</h3>
                  <p className="text-sm">Nome completo, CPF/CNPJ, RG, endereço, telefone e e-mail fornecidos voluntariamente em formulários de contato, solicitações de orçamento ou cadastro de clientes.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Dados de Navegação</h3>
                  <p className="text-sm">Endereço IP, tipo de navegador, páginas visitadas, tempo de permanência, origem do tráfego e interações com o site, coletados automaticamente por meio de cookies e ferramentas de análise (Google Analytics, Meta Pixel).</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Dados de Comunicação</h3>
                  <p className="text-sm">Mensagens enviadas via WhatsApp, e-mail ou formulários do site, incluindo o conteúdo das mensagens e metadados associados.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Dados de Newsletter</h3>
                  <p className="text-sm">Endereço de e-mail fornecido voluntariamente para recebimento de comunicações sobre importação e exportação de veículos, novidades e promoções.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">3. Finalidade do Tratamento</h2>
              <p>Utilizamos seus dados pessoais para as seguintes finalidades:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-sm">
                <li>Prestação de serviços de importação e exportação de veículos;</li>
                <li>Elaboração e envio de orçamentos personalizados;</li>
                <li>Comunicação sobre o andamento de processos logísticos;</li>
                <li>Envio de newsletters e comunicações de marketing (mediante consentimento);</li>
                <li>Análise de desempenho do site e melhoria da experiência do usuário;</li>
                <li>Cumprimento de obrigações legais e regulatórias;</li>
                <li>Prevenção de fraudes e segurança das operações.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">4. Base Legal para o Tratamento</h2>
              <p>O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais previstas na LGPD:</p>
              <div className="bg-card/50 border border-white/10 rounded-xl p-6 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white font-bold py-2 pr-4">Base Legal</th>
                      <th className="text-left text-white font-bold py-2">Aplicação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Consentimento</td>
                      <td className="py-3">Newsletter, cookies de marketing e comunicações promocionais</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Execução de Contrato</td>
                      <td className="py-3">Prestação de serviços de logística automotiva contratados</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Legítimo Interesse</td>
                      <td className="py-3">Análise de navegação, melhoria de serviços e segurança</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Obrigação Legal</td>
                      <td className="py-3">Cumprimento de exigências fiscais, aduaneiras e regulatórias</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">5. Cookies e Tecnologias de Rastreamento</h2>
              <p>Nosso site utiliza cookies e tecnologias similares para melhorar sua experiência de navegação. Os cookies utilizados incluem:</p>
              <div className="bg-card/50 border border-white/10 rounded-xl p-6 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white font-bold py-2 pr-4">Tipo</th>
                      <th className="text-left text-white font-bold py-2 pr-4">Ferramenta</th>
                      <th className="text-left text-white font-bold py-2">Finalidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Analíticos</td>
                      <td className="py-3 pr-4">Google Analytics (GA4)</td>
                      <td className="py-3">Análise de tráfego, comportamento de navegação e desempenho do site</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Marketing</td>
                      <td className="py-3 pr-4">Meta Pixel (Facebook)</td>
                      <td className="py-3">Medição de conversões e otimização de campanhas publicitárias</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Marketing</td>
                      <td className="py-3 pr-4">Google Ads</td>
                      <td className="py-3">Rastreamento de conversões e remarketing</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Essenciais</td>
                      <td className="py-3 pr-4">Sessão</td>
                      <td className="py-3">Funcionamento básico do site e autenticação</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm">
                Você pode gerenciar suas preferências de cookies através das configurações do seu navegador. A desativação de cookies pode afetar a funcionalidade do site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">6. Compartilhamento de Dados</h2>
              <p>Seus dados pessoais podem ser compartilhados com:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-sm">
                <li><strong className="text-white">Parceiros logísticos:</strong> transportadoras, despachantes aduaneiros e seguradoras, estritamente para a execução dos serviços contratados;</li>
                <li><strong className="text-white">Autoridades governamentais:</strong> quando exigido por lei, regulamentação ou ordem judicial;</li>
                <li><strong className="text-white">Prestadores de serviços de TI:</strong> plataformas de hospedagem, análise e comunicação, sob contratos de confidencialidade;</li>
                <li><strong className="text-white">Google e Meta:</strong> dados anonimizados de navegação para fins de análise e publicidade.</li>
              </ul>
              <p className="mt-3">Não vendemos, alugamos ou comercializamos seus dados pessoais a terceiros.</p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">7. Transferência Internacional de Dados</h2>
              <p>
                Devido à natureza internacional dos nossos serviços, seus dados podem ser transferidos e processados em diferentes países, incluindo Estados Unidos e Brasil. Garantimos que tais transferências são realizadas com as salvaguardas adequadas, em conformidade com a LGPD e demais legislações aplicáveis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">8. Retenção de Dados</h2>
              <p>
                Seus dados pessoais serão retidos pelo tempo necessário para cumprir as finalidades para as quais foram coletados, incluindo obrigações legais, contratuais, de prestação de contas ou requisição de autoridades competentes. Dados de newsletter são mantidos até que você solicite a exclusão ou cancele a inscrição.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">9. Seus Direitos (LGPD)</h2>
              <p>De acordo com a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {[
                  { title: "Confirmação e Acesso", desc: "Confirmar a existência e acessar seus dados pessoais" },
                  { title: "Correção", desc: "Solicitar a correção de dados incompletos ou desatualizados" },
                  { title: "Anonimização ou Bloqueio", desc: "Solicitar anonimização ou bloqueio de dados desnecessários" },
                  { title: "Eliminação", desc: "Solicitar a eliminação de dados tratados com base no consentimento" },
                  { title: "Portabilidade", desc: "Solicitar a portabilidade dos dados a outro fornecedor" },
                  { title: "Revogação do Consentimento", desc: "Revogar o consentimento a qualquer momento" },
                ].map((right) => (
                  <div key={right.title} className="bg-card/50 border border-white/10 rounded-lg p-4">
                    <h3 className="text-white font-bold text-sm mb-1">{right.title}</h3>
                    <p className="text-xs">{right.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm">
                Para exercer qualquer um desses direitos, entre em contato conosco pelo e-mail{" "}
                <a href={`mailto:${emailPrimary}`} className="text-primary hover:underline">{emailPrimary}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">10. Segurança dos Dados</h2>
              <p>
                Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acesso não autorizado, destruição, perda, alteração ou qualquer forma de tratamento inadequado. Utilizamos criptografia SSL/TLS em todas as comunicações, controle de acesso restrito e monitoramento contínuo de segurança.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">11. Alterações nesta Política</h2>
              <p>
                Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou na legislação aplicável. Recomendamos que você revise esta página regularmente. A data da última atualização será sempre indicada no topo deste documento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">12. Contato</h2>
              <p>
                Se você tiver dúvidas, solicitações ou reclamações sobre esta Política de Privacidade ou sobre o tratamento dos seus dados pessoais, entre em contato conosco:
              </p>
              <div className="bg-card/50 border border-white/10 rounded-xl p-6 mt-4 space-y-2 text-sm">
                <p><strong className="text-white">Enviando Meu Carro (EMC)</strong></p>
                <p>Controlador de Dados: PRNSH LLC / Enviando Meu Carro Com. Imp. e Exp. LTDA</p>
                <p>E-mail: <a href={`mailto:${emailPrimary}`} className="text-primary hover:underline">{emailPrimary}</a></p>
                <p>Site: <a href="https://www.enviandomeucarro.com" className="text-primary hover:underline">www.enviandomeucarro.com</a></p>
              </div>
            </section>

          </article>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
