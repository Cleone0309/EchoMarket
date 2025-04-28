import { useState } from "react";
import { Link } from "wouter";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency, getRatingText } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await addItem(product.id, 1);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Wishlist functionality would be implemented here
    setIsAddingToWishlist(true);
    setTimeout(() => setIsAddingToWishlist(false), 1000);
  };

  return (
    <Link 
      href={`/product/${product.slug}`}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart size={48} />
            </div>
          )}
        </div>
        
        <div className={`absolute top-2 right-2 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          <button 
            className="bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
            onClick={handleAddToWishlist}
            disabled={isAddingToWishlist}
          >
            <Heart className={`h-4 w-4 ${isAddingToWishlist ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
          </button>
        </div>
        
        {product.isNew && (
          <div className="absolute top-2 left-2">
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-md">New</span>
          </div>
        )}
        
        {product.isOnSale && (
          <div className="absolute top-2 left-2">
            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-md">Sale</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
        <div className="text-sm text-gray-500 mb-2">{product.category?.name || 'Uncategorized'}</div>
        
        {product.rating && product.reviewCount ? (
          <div className="flex items-center mb-2">
            <div className="flex text-amber-500 mr-1">
              <span className="font-medium">{getRatingText(Number(product.rating))}</span>
            </div>
            <span className="text-sm text-gray-500">({product.reviewCount} avaliações)</span>
          </div>
        ) : null}
        
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg">
            {product.compareAtPrice ? (
              <>
                <span className="line-through text-gray-400 text-sm mr-1">
                  {formatCurrency(product.compareAtPrice)}
                </span>
                {formatCurrency(product.price)}
              </>
            ) : (
              formatCurrency(product.price)
            )}
          </div>
          <button 
            className="bg-primary hover:bg-blue-600 text-white rounded-lg p-2 transition-colors"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
