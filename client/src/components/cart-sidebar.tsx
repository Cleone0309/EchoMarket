import { useEffect } from "react";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CartSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, totalItems, subtotal, updateQuantity, removeItem } = useCart();
  
  // Calculate tax (8% of subtotal)
  const tax = subtotal * 0.08;
  
  // Calculate total
  const total = subtotal + tax;
  
  // Add body scroll lock when cart is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex" onClick={onClose}>
      <div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-lg overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Your Cart ({totalItems})</h2>
            <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {items.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center p-4">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
                <p className="mt-1 text-gray-500">Looks like you haven't added any products to your cart yet.</p>
                <div className="mt-6">
                  <Button className="bg-primary hover:bg-blue-600" onClick={onClose}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 border-b">
                    <div className="bg-gray-100 rounded-lg w-20 h-20 overflow-hidden">
                      {item.product.imageUrl ? (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <div className="text-sm text-gray-500">
                        {item.product.category?.name || 'Uncategorized'}
                      </div>
                      <div className="flex items-center mt-2">
                        <button 
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="mx-2 font-medium">{item.quantity}</span>
                        <button 
                          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(Number(item.product.price) * item.quantity)}
                      </div>
                      <button 
                        className="text-sm text-gray-500 hover:text-red-500 mt-2 flex items-center"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t">
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button asChild className="w-full bg-primary hover:bg-blue-600">
                    <Link href="/checkout" onClick={onClose}>
                      Checkout Now
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={onClose}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
