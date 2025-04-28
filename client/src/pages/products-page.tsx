import ProductListing from "@/components/product-listing";
import { Helmet } from "react-helmet";

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title>Products | ShopSmart</title>
        <meta name="description" content="Browse our wide selection of products. Find the perfect item for your needs at ShopSmart." />
      </Helmet>
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">All Products</h1>
            <p className="text-gray-600">Browse our wide selection of products</p>
          </div>
        </div>
        
        <ProductListing />
      </div>
    </>
  );
}
