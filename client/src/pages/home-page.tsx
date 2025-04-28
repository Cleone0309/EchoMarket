import HeroSection from "@/components/hero-section";
import FeaturedCategories from "@/components/featured-categories";
import FeaturedProducts from "@/components/featured-products";
import PromoSection from "@/components/promo-section";
import ProductListing from "@/components/product-listing";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>ShopSmart - Modern E-Commerce Store</title>
        <meta name="description" content="Discover amazing products for your lifestyle at ShopSmart. Shop the latest trending items with exclusive deals and fast shipping." />
      </Helmet>
      
      <main>
        <HeroSection />
        <FeaturedCategories />
        <FeaturedProducts />
        <PromoSection />
        <ProductListing />
      </main>
    </>
  );
}
