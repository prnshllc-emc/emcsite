/* TermsOfUse — Comprehensive Terms of Use page complementing Privacy Policy */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function TermsOfUse() {
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
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Termos de Uso
              </h1>
              <p className="text-muted-foreground text-sm font-body mt-1">
                Última atualização: 09 de março de 2026
              </p>
            </div>
          </div>

          {/* Content */}
          <article className="prose prose-invert max-w-none space-y-8 font-body text-muted-foreground leading-relaxed">

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar o site <strong className="text-white">www.enviandomeucarro.com</strong> e seus subdomínios (incluindo calculadora.enviandomeucarro.com e importação.enviandomeucarro.com), você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição aqui prevista, solicitamos que não utilize nossos serviços ou navegue em nosso site.
              </p>
              <p>
                Estes Termos de Uso regulam a relação entre a <strong className="text-white">Enviando Meu Carro (EMC)</strong>, operada pela PRNSH LLC (EUA) e Enviando Meu Carro Com. Imp. e Exp. LTDA (Brasil), e os usuários de seus serviços digitais e presenciais. A utilização continuada do site após eventuais alterações nestes termos constitui aceitação tácita das modificações realizadas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">2. Definições</h2>
              <p>Para fins destes Termos de Uso, consideram-se as seguintes definições:</p>
              <div className="bg-card/50 border border-white/10 rounded-xl p-6 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white font-bold py-2 pr-4">Termo</th>
                      <th className="text-left text-white font-bold py-2">Definição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">EMC</td>
                      <td className="py-3">Enviando Meu Carro, incluindo suas entidades jurídicas PRNSH LLC e Enviando Meu Carro Com. Imp. e Exp. LTDA</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Usuário</td>
                      <td className="py-3">Qualquer pessoa física ou jurídica que acesse o site ou utilize os serviços da EMC</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Site</td>
                      <td className="py-3">O portal www.enviandomeucarro.com e todos os seus subdomínios</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Serviços</td>
                      <td className="py-3">Todos os serviços de importação, exportação, despacho aduaneiro e logística automotiva oferecidos pela EMC</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Conteúdo</td>
                      <td className="py-3">Textos, imagens, vídeos, logotipos, marcas, dados e demais materiais disponibilizados no site</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">3. Descrição dos Serviços</h2>
              <p>
                A EMC é uma empresa especializada em logística automotiva internacional, oferecendo os seguintes serviços:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {[
                  { title: "Importação de Veículos", desc: "Transporte e nacionalização de veículos do exterior para o Brasil" },
                  { title: "Exportação de Veículos", desc: "Envio de veículos do Brasil para qualquer destino internacional" },
                  { title: "Despacho Aduaneiro", desc: "Desembaraço completo junto à Receita Federal e órgãos competentes" },
                  { title: "Peças e Acessórios", desc: "Importação de peças originais e acessórios automotivos" },
                  { title: "Envios Aéreos", desc: "Transporte expresso via modal aéreo para cargas urgentes" },
                  { title: "Admissão Temporária", desc: "Regularização de veículos estrangeiros em território brasileiro" },
                ].map((service) => (
                  <div key={service.title} className="bg-card/50 border border-white/10 rounded-lg p-4">
                    <h3 className="text-white font-bold text-sm mb-1">{service.title}</h3>
                    <p className="text-xs">{service.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4">
                As informações disponibilizadas no site, incluindo a calculadora de importação, possuem caráter meramente informativo e estimativo, não constituindo proposta comercial vinculante. Os valores finais de cada operação serão definidos mediante orçamento formal, considerando as condições específicas de cada caso.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">4. Cadastro e Conta de Usuário</h2>
              <p>
                Determinadas funcionalidades do site podem exigir cadastro prévio. Ao se cadastrar, o Usuário se compromete a:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-sm">
                <li>Fornecer informações verdadeiras, completas e atualizadas;</li>
                <li>Manter a confidencialidade de suas credenciais de acesso;</li>
                <li>Notificar imediatamente a EMC sobre qualquer uso não autorizado de sua conta;</li>
                <li>Responsabilizar-se por todas as atividades realizadas em sua conta.</li>
              </ul>
              <p className="mt-3">
                A EMC reserva-se o direito de suspender ou cancelar contas que violem estes Termos de Uso, sem aviso prévio, especialmente em casos de informações falsas, atividades fraudulentas ou uso indevido da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">5. Obrigações do Usuário</h2>
              <p>Ao utilizar o site e os serviços da EMC, o Usuário compromete-se a:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-sm">
                <li>Utilizar o site e os serviços de forma lícita e em conformidade com a legislação aplicável;</li>
                <li>Não reproduzir, copiar, distribuir ou modificar qualquer conteúdo do site sem autorização prévia e expressa da EMC;</li>
                <li>Não utilizar mecanismos automatizados (bots, scrapers, crawlers) para acessar ou extrair dados do site;</li>
                <li>Não tentar acessar áreas restritas do site ou sistemas internos da EMC sem autorização;</li>
                <li>Não transmitir vírus, malware ou qualquer código malicioso através do site;</li>
                <li>Não utilizar o site para fins ilegais, difamatórios, discriminatórios ou que violem direitos de terceiros;</li>
                <li>Fornecer documentação verídica e completa quando solicitada para a prestação dos serviços.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">6. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo disponibilizado no site, incluindo, mas não se limitando a, textos, imagens, logotipos, marcas registradas, design, layout, código-fonte, vídeos e demais materiais, é de propriedade exclusiva da EMC ou de seus licenciadores, sendo protegido pelas leis brasileiras e internacionais de propriedade intelectual.
              </p>
              <div className="bg-card/50 border border-white/10 rounded-xl p-6 mt-4 space-y-3">
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Marca Registrada</h3>
                  <p className="text-sm">A marca "Enviando Meu Carro", o logotipo "EMC" e demais sinais distintivos são marcas registradas. O uso não autorizado constitui violação de direitos de propriedade industrial.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Conteúdo do Site</h3>
                  <p className="text-sm">É vedada a reprodução, distribuição, modificação ou utilização comercial do conteúdo do site sem autorização prévia e expressa da EMC, sob pena de responsabilização civil e criminal.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Uso Permitido</h3>
                  <p className="text-sm">O Usuário pode visualizar e imprimir conteúdo do site exclusivamente para uso pessoal e não comercial, desde que mantenha todos os avisos de propriedade intelectual.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">7. Calculadora de Importação</h2>
              <p>
                A calculadora de importação disponível em <strong className="text-white">calculadora.enviandomeucarro.com</strong> é uma ferramenta de simulação que fornece estimativas baseadas em dados públicos e parâmetros gerais. Os resultados apresentados:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-sm">
                <li>Possuem caráter meramente informativo e estimativo;</li>
                <li>Não constituem proposta comercial, orçamento ou compromisso de preço;</li>
                <li>Podem divergir dos valores finais devido a variações cambiais, alterações legislativas, condições específicas do veículo ou da operação;</li>
                <li>Não substituem a consulta a um especialista da EMC para obtenção de orçamento formal.</li>
              </ul>
              <p className="mt-3">
                A EMC não se responsabiliza por decisões tomadas exclusivamente com base nos resultados da calculadora, recomendando sempre a solicitação de um orçamento personalizado.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">8. Contratação de Serviços</h2>
              <p>
                A contratação dos serviços da EMC é formalizada mediante instrumento contratual específico, que estabelecerá:
              </p>
              <div className="bg-card/50 border border-white/10 rounded-xl p-6 mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white font-bold py-2 pr-4">Elemento</th>
                      <th className="text-left text-white font-bold py-2">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Escopo</td>
                      <td className="py-3">Descrição detalhada dos serviços a serem prestados</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Valores</td>
                      <td className="py-3">Honorários, custos operacionais, impostos e taxas aplicáveis</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Prazos</td>
                      <td className="py-3">Estimativas de tempo para cada etapa do processo</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Responsabilidades</td>
                      <td className="py-3">Obrigações de cada parte durante a operação</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-primary font-medium">Condições de Pagamento</td>
                      <td className="py-3">Formas, prazos e condições de pagamento acordadas</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                Os prazos informados são estimativas baseadas em condições normais de operação e podem sofrer alterações em razão de fatores externos, como atrasos em órgãos governamentais, condições climáticas, greves ou outras situações de força maior.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">9. Limitação de Responsabilidade</h2>
              <p>
                A EMC empenha-se em fornecer informações precisas e serviços de qualidade, porém:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-sm">
                <li>Não garante que o site estará disponível de forma ininterrupta ou livre de erros;</li>
                <li>Não se responsabiliza por danos diretos ou indiretos decorrentes da indisponibilidade temporária do site;</li>
                <li>Não se responsabiliza por conteúdo de sites de terceiros acessados através de links disponibilizados no site;</li>
                <li>Não se responsabiliza por perdas decorrentes de caso fortuito ou força maior que afetem a prestação dos serviços;</li>
                <li>Não se responsabiliza por alterações em legislação, regulamentação aduaneira ou tributária que impactem os custos ou prazos dos serviços após a contratação.</li>
              </ul>
              <p className="mt-3">
                A responsabilidade da EMC, em qualquer hipótese, estará limitada ao valor efetivamente pago pelo Usuário pelos serviços contratados, conforme estabelecido no contrato específico de prestação de serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">10. Newsletter e Comunicações</h2>
              <p>
                Ao se inscrever em nossa newsletter, o Usuário consente com o recebimento de comunicações periódicas por e-mail, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-sm">
                <li>Informações sobre importação e exportação de veículos;</li>
                <li>Novidades sobre serviços e promoções da EMC;</li>
                <li>Conteúdo educativo sobre logística automotiva internacional;</li>
                <li>Atualizações sobre legislação aduaneira e tributária relevante.</li>
              </ul>
              <p className="mt-3">
                O Usuário pode cancelar a inscrição na newsletter a qualquer momento, através do link de descadastramento presente em cada e-mail ou entrando em contato pelo endereço{" "}
                <a href={`mailto:${emailPrimary}`} className="text-primary hover:underline">{emailPrimary}</a>.
                O tratamento dos dados pessoais relacionados à newsletter está detalhado em nossa{" "}
                <Link href="/politica-de-privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">11. Legislação Aplicável e Foro</h2>
              <p>
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para operações envolvendo a entidade norte-americana (PRNSH LLC), aplicam-se subsidiariamente as leis do Estado da Flórida, Estados Unidos.
              </p>
              <div className="bg-card/50 border border-white/10 rounded-xl p-6 mt-4 space-y-3">
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Operações no Brasil</h3>
                  <p className="text-sm">Fica eleito o foro da Comarca de São Paulo, Estado de São Paulo, para dirimir quaisquer controvérsias decorrentes destes Termos de Uso, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Operações nos Estados Unidos</h3>
                  <p className="text-sm">Para operações conduzidas pela PRNSH LLC, eventuais disputas serão submetidas à jurisdição dos tribunais do Condado de Miami-Dade, Estado da Flórida, EUA.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">Resolução Alternativa</h3>
                  <p className="text-sm">As partes comprometem-se a buscar, preferencialmente, a resolução amigável de eventuais conflitos antes de recorrer ao Poder Judiciário, podendo utilizar mediação ou arbitragem como mecanismos alternativos.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">12. Política de Cookies</h2>
              <p>
                O site utiliza cookies e tecnologias similares para melhorar a experiência de navegação, analisar o tráfego e personalizar conteúdo. Para informações detalhadas sobre os tipos de cookies utilizados, suas finalidades e como gerenciá-los, consulte a seção específica em nossa{" "}
                <Link href="/politica-de-privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
              </p>
              <p className="mt-3">
                Ao continuar navegando no site, o Usuário consente com o uso de cookies essenciais para o funcionamento da plataforma. Cookies de análise e marketing podem ser gerenciados através das configurações do navegador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">13. Disposições Gerais</h2>
              <div className="space-y-4 mt-4">
                <div className="bg-card/50 border border-white/10 rounded-lg p-4">
                  <h3 className="text-white font-bold text-sm mb-1">Integralidade</h3>
                  <p className="text-sm">Estes Termos de Uso, juntamente com a Política de Privacidade e eventuais contratos específicos de prestação de serviços, constituem o acordo integral entre o Usuário e a EMC.</p>
                </div>
                <div className="bg-card/50 border border-white/10 rounded-lg p-4">
                  <h3 className="text-white font-bold text-sm mb-1">Independência das Cláusulas</h3>
                  <p className="text-sm">Caso qualquer disposição destes Termos seja considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.</p>
                </div>
                <div className="bg-card/50 border border-white/10 rounded-lg p-4">
                  <h3 className="text-white font-bold text-sm mb-1">Tolerância</h3>
                  <p className="text-sm">A eventual tolerância da EMC quanto ao descumprimento de qualquer disposição destes Termos não constituirá renúncia ao direito de exigir o cumprimento da obrigação.</p>
                </div>
                <div className="bg-card/50 border border-white/10 rounded-lg p-4">
                  <h3 className="text-white font-bold text-sm mb-1">Cessão</h3>
                  <p className="text-sm">O Usuário não poderá ceder ou transferir seus direitos e obrigações decorrentes destes Termos sem o consentimento prévio e por escrito da EMC.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">14. Alterações nos Termos de Uso</h2>
              <p>
                A EMC reserva-se o direito de modificar estes Termos de Uso a qualquer momento, mediante publicação da versão atualizada no site. As alterações entram em vigor na data de sua publicação. Recomendamos que o Usuário revise esta página periodicamente para estar ciente de eventuais atualizações.
              </p>
              <p className="mt-3">
                Alterações substanciais serão comunicadas de forma destacada no site ou por e-mail aos Usuários cadastrados. A continuidade do uso do site após a publicação das alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-white mb-3">15. Contato</h2>
              <p>
                Para dúvidas, sugestões ou reclamações relacionadas a estes Termos de Uso, entre em contato conosco:
              </p>
              <div className="bg-card/50 border border-white/10 rounded-xl p-6 mt-4 space-y-2 text-sm">
                <p><strong className="text-white">Enviando Meu Carro (EMC)</strong></p>
                <p>Razão Social: PRNSH LLC (EUA) / Enviando Meu Carro Com. Imp. e Exp. LTDA (Brasil)</p>
                <p>E-mail: <a href={`mailto:${emailPrimary}`} className="text-primary hover:underline">{emailPrimary}</a></p>
                <p>Site: <a href="https://www.enviandomeucarro.com" className="text-primary hover:underline">www.enviandomeucarro.com</a></p>
              </div>
              <p className="mt-4 text-sm">
                Consulte também nossa{" "}
                <Link href="/politica-de-privacidade" className="text-primary hover:underline">Política de Privacidade</Link>{" "}
                para informações sobre o tratamento de dados pessoais.
              </p>
            </section>

          </article>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
