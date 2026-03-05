/* Home — Landing page assembling all institutional sections */
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

      <main>
        {/* 1. Hero — Institutional CTA + services card */}
        <HeroSection />

        {/* 2. Stats — Company numbers */}
        <StatsSection />

        {/* 3. About — Missão, Serviços, VC que Manda */}
        <BenefitsGrid />

        {/* 4. CTA 1 — Institutional */}
        <CTASection
          title="Quer saber quanto custa transportar seu veículo?"
          description="Use nossa calculadora online e simule todos os custos em minutos."
          buttonText="Simular Agora"
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
          title="Pronto para dar o próximo passo?"
          description="Fale com nossa equipe e receba uma assessoria personalizada para seu projeto."
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
