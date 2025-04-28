import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";

export default function FeaturedProducts() {
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 4;
  
  const { data: productsData, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ["/api/products", { featured: true, limit: 8 }],
  });
  
  const products = productsData?.products || [];
  
  const totalPages = Math.ceil(products.length / productsPerPage);
  
  const nextSlide = () => {
    setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
  };
  
  const prevSlide = () => {
    setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages);
  };
  
  const displayedProducts = products.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          {!isLoading && products.length > productsPerPage && (
            <div className="flex space-x-2">
              <button 
                className="rounded-full w-10 h-10 bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                className="rounded-full w-10 h-10 bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                onClick={nextSlide}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden h-[320px] animate-pulse">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
