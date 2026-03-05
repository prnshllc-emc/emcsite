/* Home Page — Assembles all sections in the correct order per blueprint */
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import BenefitsGrid from "@/components/BenefitsGrid";
import CTASection from "@/components/CTASection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ServicesSection from "@/components/ServicesSection";
import WhyUsSection from "@/components/WhyUsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main>
        {/* 1. Hero with Calculator */}
        <HeroSection />

        {/* 2. Stats */}
        <StatsSection />

        {/* 3. Benefits Grid */}
        <BenefitsGrid />

        {/* 4. CTA Secondary */}
        <CTASection
          title="Não arrisque seu patrimônio."
          description="A complexidade logística exige especialistas. Garanta a segurança do seu investimento com quem entende do assunto."
          buttonText="Falar com Especialista"
          variant="secondary"
        />

        {/* 5. Testimonials */}
        <TestimonialsSection />

        {/* 6. Services */}
        <ServicesSection />

        {/* 7. Why Us */}
        <WhyUsSection />

        {/* 8. CTA Primary */}
        <CTASection
          title="Pronto para realizar seu sonho?"
          description="Junte-se a centenas de clientes satisfeitos e traga seu veículo exclusivo para o Brasil com total tranquilidade."
          buttonText="Iniciar Minha Importação"
          variant="primary"
        />

        {/* 9. FAQ */}
        <FAQSection />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
