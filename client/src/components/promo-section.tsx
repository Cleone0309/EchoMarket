import { useState } from "react";
import { Truck, RotateCcw, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function PromoSection() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Inscrição realizada com sucesso!",
        description: "Verifique seu email para receber o código de desconto",
      });
      setEmail("");
      setIsSubscribing(false);
    }, 1000);
  };

  return (
    <section className="py-12 bg-[#2A8C57] text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h2 className="text-3xl font-bold mb-4">Ganhe 20% de Desconto no Seu Primeiro Pedido</h2>
            <p className="text-[#A2D9C1] mb-6">
              Inscreva-se em nossa newsletter e receba um código de desconto para sua primeira compra. 
              Fique por dentro das novidades em produtos e ofertas exclusivas.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Seu endereço de email"
                className="rounded-lg bg-white/10 border border-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#14532d] focus:bg-white/20 flex-grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="bg-[#14532d] hover:bg-[#0f3d22] text-white font-medium py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
                disabled={isSubscribing}
              >
                {isSubscribing ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : "Inscrever-se"}
              </Button>
            </form>
          </div>
          
          <div className="md:w-1/2">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="rounded-full bg-[#14532d] h-12 w-12 flex items-center justify-center">
                  <Truck className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Frete Grátis</h3>
                  <p className="text-[#A2D9C1] text-sm">Em compras acima de R$200</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="rounded-full bg-[#1e8a4c] h-12 w-12 flex items-center justify-center">
                  <RotateCcw className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Devolução Facilitada</h3>
                  <p className="text-[#A2D9C1] text-sm">Garantia de 30 dias para devolução</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-[#27aa5e] h-12 w-12 flex items-center justify-center">
                  <Headphones className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Suporte 24/7</h3>
                  <p className="text-[#A2D9C1] text-sm">Converse com nosso atendimento ao cliente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
