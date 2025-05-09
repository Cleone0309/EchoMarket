import HeroSection from "@/components/hero-section";
import BestSellerCarousel from "@/components/best-seller-carousel";
import FeaturedProducts from "@/components/featured-products";
import PromoSection from "@/components/promo-section";
import ProductListing from "@/components/product-listing";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Viva Brinquedos Educativos - Desenvolvimento Infantil</title>
        <meta name="description" content="Descubra brinquedos educativos de qualidade na Viva Brinquedos. Produtos que estimulam a criatividade e aprendizado das crianças com entrega rápida." />
      </Helmet>
      
      <main>
        <HeroSection />
        <BestSellerCarousel />
        <FeaturedProducts />
        <PromoSection />
        <ProductListing />
      </main>
    </>
  );
}
