import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ShoppingCart, Heart, Star, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/product-card";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency, getRatingText } from "@/lib/utils";
import { Helmet } from "react-helmet";
import { Product, Review } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ProductPage() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug || "";
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  // Fetch product details
  const { data, isLoading, error } = useQuery<{
    product: Product;
    relatedProducts: Product[];
    reviews: Review[];
  }>({
    queryKey: [`/api/products/${slug}`],
  });
  
  const product = data?.product;
  const relatedProducts = data?.relatedProducts || [];
  const reviews = data?.reviews || [];
  
  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [slug]);
  
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addItem(product.id, quantity);
      
      toast({
        title: "Added to cart",
        description: `${product.name} (${quantity}) has been added to your cart`,
      });
      
      // Reset quantity
      setQuantity(1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="md:w-1/2">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
          </div>
          <div className="md:w-1/2">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p>The product you're looking for could not be found or has been removed.</p>
          <Button asChild className="mt-4 bg-primary hover:bg-blue-600">
            <a href="/products">Browse Products</a>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{product.name} | ShopSmart</title>
        <meta name="description" content={product.description || `Buy ${product.name} at ShopSmart`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Image */}
          <div className="md:w-1/2">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full aspect-square object-cover rounded-lg"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-24 w-24 text-gray-300" />
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="md:w-1/2">
            {product.isOnSale && (
              <div className="inline-block bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                Sale
              </div>
            )}
            
            {product.isNew && (
              <div className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 ml-2">
                New
              </div>
            )}
            
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex text-amber-500 mr-2">
                <span className="font-medium">{getRatingText(Number(product.rating || 0))}</span>
              </div>
              <span className="text-sm text-gray-600">
                {product.reviewCount} {product.reviewCount === 1 ? 'avaliação' : 'avaliações'}
              </span>
            </div>
            
            <div className="mb-4">
              {product.compareAtPrice ? (
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                  <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded">
                    {Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)}% de desconto
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            
            <div className="prose prose-sm mb-6">
              <p>{product.description}</p>
            </div>
            
            <div className="mb-6 flex items-center">
              <div className="mr-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <div className="flex items-center">
                  <button 
                    className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 mx-2 text-center"
                  />
                  <button 
                    className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponibilidade
                </label>
                {product.inventory && product.inventory > 0 ? (
                  <span className="text-green-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    Em Estoque
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                    </svg>
                    Fora de Estoque
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button 
                className="flex-1 bg-primary hover:bg-blue-600"
                onClick={handleAddToCart}
                disabled={!product.inventory || product.inventory === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Adicionar ao Carrinho
              </Button>
              <Button variant="outline" className="flex-1">
                <Heart className="mr-2 h-4 w-4" /> Adicionar à Lista de Desejos
              </Button>
            </div>
            
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex items-center text-sm">
                <Truck className="h-4 w-4 text-gray-500 mr-2" />
                <span>Frete grátis em compras acima de R$250</span>
              </div>
              <div className="flex items-center text-sm">
                <RotateCcw className="h-4 w-4 text-gray-500 mr-2" />
                <span>Política de devolução em 30 dias</span>
              </div>
              <div className="flex items-center text-sm">
                <ShieldCheck className="h-4 w-4 text-gray-500 mr-2" />
                <span>Pagamento seguro</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full border-b">
              <TabsTrigger value="description">Descrição</TabsTrigger>
              <TabsTrigger value="specifications">Especificações</TabsTrigger>
              <TabsTrigger value="reviews">
                Avaliações ({reviews.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-6">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description || 'Sem descrição disponível.' }} />
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="border-b pb-2">
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-medium">{product.category?.name || 'Uncategorized'}</div>
                </div>
                <div className="border-b pb-2">
                  <div className="text-sm text-gray-500">SKU</div>
                  <div className="font-medium">SKU-{product.id.toString().padStart(6, '0')}</div>
                </div>
                <div className="border-b pb-2">
                  <div className="text-sm text-gray-500">Brand</div>
                  <div className="font-medium">ShopSmart</div>
                </div>
                <div className="border-b pb-2">
                  <div className="text-sm text-gray-500">Weight</div>
                  <div className="font-medium">0.5 kg</div>
                </div>
                <div className="border-b pb-2">
                  <div className="text-sm text-gray-500">Dimensions</div>
                  <div className="font-medium">10 × 10 × 10 cm</div>
                </div>
                <div className="border-b pb-2">
                  <div className="text-sm text-gray-500">Color</div>
                  <div className="font-medium">Various</div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="py-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium">No reviews yet</h3>
                  <p className="text-gray-500 mt-1">Be the first to review this product</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="font-medium">
                              {review.title || `User ${review.userId}`}
                            </span>
                            {review.isVerified && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                Verified purchase
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex text-amber-500 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Minus(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function Plus(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
