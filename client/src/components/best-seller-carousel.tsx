import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Loader2 } from "lucide-react";

export default function BestSellerCarousel() {
  const { data: productsData, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ["/api/products", { sort: "popular", limit: 8 }],
  });

  const products = productsData?.products || [];

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Mais Vendidos</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Nenhum produto disponível no momento.
          </div>
        ) : (
          <div className="relative px-14">
            <Carousel 
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {products.map((product) => (
                  <CarouselItem key={product.id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="p-1">
                      <ProductCard product={product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious 
                className="left-0 border-primary dark:border-gray-700 text-primary dark:text-gray-300 hover:bg-primary hover:text-white" 
              />
              <CarouselNext 
                className="right-0 border-primary dark:border-gray-700 text-primary dark:text-gray-300 hover:bg-primary hover:text-white" 
              />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}