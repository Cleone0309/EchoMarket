import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const { items, totalItems, subtotal, updateQuantity, removeItem } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const { toast } = useToast();
  
  // Calculate tax (8% of subtotal)
  const tax = subtotal * 0.08;
  
  // Calculate shipping (free for orders over $50)
  const shipping = subtotal >= 50 ? 0 : 5.99;
  
  // Calculate total
  const total = subtotal + tax + shipping;
  
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }
    
    setIsApplyingCoupon(true);
    
    // Simulate API call to validate coupon
    setTimeout(() => {
      toast({
        title: "Invalid coupon",
        description: "The coupon code you entered is invalid or has expired",
        variant: "destructive",
      });
      setIsApplyingCoupon(false);
    }, 1000);
  };
  
  return (
    <>
      <Helmet>
        <title>Your Cart | ShopSmart</title>
        <meta name="description" content="View and manage your shopping cart at ShopSmart." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="mx-auto h-16 w-16" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button asChild className="bg-primary hover:bg-blue-600">
              <Link href="/products">
                Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b">
                  <div className="col-span-6 font-medium">Product</div>
                  <div className="col-span-2 font-medium text-center">Price</div>
                  <div className="col-span-2 font-medium text-center">Quantity</div>
                  <div className="col-span-2 font-medium text-right">Total</div>
                </div>
                
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 sm:items-center border-b">
                    <div className="col-span-6 flex items-center">
                      <div className="w-20 h-20 rounded bg-gray-100 overflow-hidden mr-4 shrink-0">
                        {item.product.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.product.name}</h3>
                        <div className="text-sm text-gray-500">
                          {item.product.category?.name || 'Uncategorized'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 text-center">
                      <div className="sm:hidden inline-block font-medium mr-2">Price:</div>
                      {formatCurrency(item.product.price)}
                    </div>
                    
                    <div className="col-span-2">
                      <div className="sm:hidden inline-block font-medium mr-2">Quantity:</div>
                      <div className="flex items-center justify-center">
                        <button 
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="mx-2 w-10 text-center font-medium">{item.quantity}</span>
                        <button 
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-between sm:justify-end">
                      <div>
                        <div className="sm:hidden inline-block font-medium mr-2">Total:</div>
                        <span className="font-bold">
                          {formatCurrency(Number(item.product.price) * item.quantity)}
                        </span>
                      </div>
                      <button 
                        className="text-gray-500 hover:text-red-500 ml-4"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="p-4 flex flex-wrap gap-4 justify-between items-center">
                  <Link href="/products" className="text-primary hover:text-blue-700 flex items-center">
                    <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                    Continue Shopping
                  </Link>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex sm:w-auto">
                      <Input
                        type="text"
                        placeholder="Coupon code"
                        className="rounded-r-none"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        className="rounded-l-none"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                      >
                        {isApplyingCoupon ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatCurrency(shipping)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  
                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                
                <Button asChild className="w-full bg-primary hover:bg-blue-600">
                  <Link href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
                
                <div className="mt-6 space-y-2 text-sm text-gray-500">
                  <p className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Free shipping on orders over $50
                  </p>
                  <p className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Secure checkout with SSL encryption
                  </p>
                  <p className="flex items-center">
                    <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    30-day money-back guarantee
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
