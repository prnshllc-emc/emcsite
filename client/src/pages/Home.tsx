/* Home — SEO-optimized landing page assembling all institutional sections */
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import BenefitsGrid from "@/components/BenefitsGrid";
import CTASection from "@/components/CTASection";
import ServicesSection from "@/components/ServicesSection";
import WhyUsSection from "@/components/WhyUsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import OfficesSection from "@/components/OfficesSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main id="main-content" role="main">
        {/* 1. Hero — Institutional CTA + services card */}
        <HeroSection />

        {/* 2. Stats — Company numbers */}
        <StatsSection />

        {/* 3. About — Missão, Serviços, VC que Manda */}
        <BenefitsGrid />

        {/* 4. CTA 1 — Calculator */}
        <CTASection
          title="Quer saber quanto custa importar seu veículo?"
          description="Use nossa calculadora de importação online e simule todos os custos, impostos e taxas em minutos."
          buttonText="Simular Custos de Importação"
          variant="primary"
        />

        {/* 5. Services — All 6 services */}
        <ServicesSection />

        {/* 6. Why Us — Checklist + image */}
        <WhyUsSection />

        {/* 7. Testimonials — Video + cards */}
        <TestimonialsSection />

        {/* 8. CTA 2 — WhatsApp */}
        <CTASection
          title="Pronto para importar ou exportar seu veículo?"
          description="Fale com nossa equipe de especialistas e receba uma assessoria personalizada para seu projeto de logística automotiva."
          buttonText="Falar com Especialista"
          variant="secondary"
        />

        {/* 9. Offices — 3 locations */}
        <OfficesSection />

        {/* 10. FAQ */}
        <FAQSection />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
