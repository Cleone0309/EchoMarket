import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-[#1A5A3A] text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A5A3A]/95 to-[#2A8C57]/70"></div>
      <div className="relative container mx-auto px-4 py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Descubra Brinquedos Incríveis para o Desenvolvimento
          </h1>
          <p className="text-lg text-[#A2D9C1] mb-8">
            Produtos educativos de qualidade para estimular a criatividade e aprendizado das crianças.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/80">
              <Link href="/products" className="inline-flex items-center">
                Explorar <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/25">
              <Link href="/products?sale=true">
                Ver Ofertas
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}
