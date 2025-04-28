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
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Subscription successful!",
        description: "Check your email for the discount code",
      });
      setEmail("");
      setIsSubscribing(false);
    }, 1000);
  };

  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h2 className="text-3xl font-bold mb-4">Get 20% Off Your First Order</h2>
            <p className="text-gray-300 mb-6">
              Sign up for our newsletter and receive a discount code for your first purchase. 
              Stay updated with the latest products and exclusive deals.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Your email address"
                className="rounded-lg bg-white/10 border border-white/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/20 flex-grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="bg-primary hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors whitespace-nowrap"
                disabled={isSubscribing}
              >
                {isSubscribing ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : "Subscribe Now"}
              </Button>
            </form>
          </div>
          
          <div className="md:w-1/2">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="rounded-full bg-primary h-12 w-12 flex items-center justify-center">
                  <Truck className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Free Shipping</h3>
                  <p className="text-gray-400 text-sm">On orders over $50</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="rounded-full bg-green-500 h-12 w-12 flex items-center justify-center">
                  <RotateCcw className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Easy Returns</h3>
                  <p className="text-gray-400 text-sm">30 day money back guarantee</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-amber-500 h-12 w-12 flex items-center justify-center">
                  <Headphones className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">24/7 Support</h3>
                  <p className="text-gray-400 text-sm">Chat with our customer service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
