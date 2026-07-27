import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Positioning } from "@/components/site/Positioning";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { Services } from "@/components/site/Services";
import { Offers } from "@/components/site/Offers";
import { Membership } from "@/components/site/Membership";
import { Gallery } from "@/components/site/Gallery";
import { Testimonials } from "@/components/site/Testimonials";
import { VisitUs } from "@/components/site/VisitUs";
import { ContactForm } from "@/components/site/ContactForm";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { getSiteContent } from "@/lib/site-content";

// The homepage is prerendered and refreshed whenever staff save Settings,
// Services or Website content (those actions revalidate "/"). The hourly window
// is a safety net in case an edit path is ever added without one.
export const revalidate = 3600;

export default async function Home() {
  const { salon, services, offers, testimonials, plans } = await getSiteContent();

  return (
    <>
      <Header salon={salon} />
      <main>
        <Hero salon={salon} />
        <Positioning />
        <WhyChooseUs />
        <Services services={services} />
        <Offers offers={offers} salon={salon} />
        <Membership plans={plans} salon={salon} />
        <Gallery />
        <Testimonials testimonials={testimonials} />
        <VisitUs salon={salon} />
        <ContactForm salon={salon} services={services} />
      </main>
      <Footer salon={salon} />
      <WhatsAppFab salon={salon} />
    </>
  );
}
