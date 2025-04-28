import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { StarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@shared/schema";
import { getQueryParams, buildQueryString } from "@/lib/utils";
import ProductCard from "@/components/product-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function ProductListing() {
  const [location, setLocation] = useLocation();
  const queryParams = getQueryParams(window.location.search);

  // State for filters
  const [category, setCategory] = useState<string>(queryParams.category || "");
  const [search, setSearch] = useState<string>(queryParams.search || "");
  const [minPrice, setMinPrice] = useState<string>(queryParams.minPrice || "");
  const [maxPrice, setMaxPrice] = useState<string>(queryParams.maxPrice || "");
  const [rating, setRating] = useState<string>(queryParams.rating || "");
  const [sort, setSort] = useState<string>(queryParams.sort || "newest");
  const [page, setPage] = useState<number>(Number(queryParams.page) || 1);

  // Parse current query parameters
  useEffect(() => {
    const params = getQueryParams(window.location.search);
    setCategory(params.category || "");
    setSearch(params.search || "");
    setMinPrice(params.minPrice || "");
    setMaxPrice(params.maxPrice || "");
    setRating(params.rating || "");
    setSort(params.sort || "newest");
    setPage(Number(params.page) || 1);
  }, [location]);

  // Fetch products
  const { data, isLoading } = useQuery<{ 
    products: Product[],
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalCount: number;
    }
  }>({
    queryKey: ["/api/products", {
      category,
      search,
      minPrice,
      maxPrice,
      rating,
      sort,
      page,
      limit: 6
    }],
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { page: 1, limit: 6, totalPages: 1, totalCount: 0 };

  // Apply filters
  const applyFilters = () => {
    const params = {
      category,
      search,
      minPrice,
      maxPrice,
      rating,
      sort,
      page: 1 // Reset to first page when filters change
    };
    
    setLocation(`/products${buildQueryString(params)}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setCategory("");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setRating("");
    setSort("newest");
    setPage(1);
    setLocation("/products");
  };

  // Change page
  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    const params = {
      ...getQueryParams(window.location.search),
      page: newPage
    };
    
    setLocation(`/products${buildQueryString(params)}`);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSort(value);
    
    const params = {
      ...getQueryParams(window.location.search),
      sort: value,
      page: 1 // Reset to first page when sort changes
    };
    
    setLocation(`/products${buildQueryString(params)}`);
  };

  return (
    <section id="products" className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">All Products</h2>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">Sort by:</span>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <Checkbox
                      checked={category === "electronics"}
                      onCheckedChange={() => setCategory(category === "electronics" ? "" : "electronics")}
                      className="mr-2"
                    />
                    <span>Electronics (24)</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox
                      checked={category === "fashion"}
                      onCheckedChange={() => setCategory(category === "fashion" ? "" : "fashion")}
                      className="mr-2"
                    />
                    <span>Fashion (42)</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox
                      checked={category === "home"}
                      onCheckedChange={() => setCategory(category === "home" ? "" : "home")}
                      className="mr-2"
                    />
                    <span>Home & Kitchen (18)</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox
                      checked={category === "sports"}
                      onCheckedChange={() => setCategory(category === "sports" ? "" : "sports")}
                      className="mr-2"
                    />
                    <span>Sports (15)</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox
                      checked={category === "gaming"}
                      onCheckedChange={() => setCategory(category === "gaming" ? "" : "gaming")}
                      className="mr-2"
                    />
                    <span>Gaming (10)</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex space-x-4 mb-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        className="w-full"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Max"
                        className="w-full"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Customer Rating</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <Checkbox
                      checked={rating === "5"}
                      onCheckedChange={() => setRating(rating === "5" ? "" : "5")}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} className="text-amber-500 h-4 w-4 fill-amber-500" />
                      ))}
                      <span className="ml-1">& Up</span>
                    </span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox
                      checked={rating === "4"}
                      onCheckedChange={() => setRating(rating === "4" ? "" : "4")}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      {[1, 2, 3, 4].map((star) => (
                        <StarIcon key={star} className="text-amber-500 h-4 w-4 fill-amber-500" />
                      ))}
                      <StarIcon className="text-amber-500 h-4 w-4" />
                      <span className="ml-1">& Up</span>
                    </span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox
                      checked={rating === "3"}
                      onCheckedChange={() => setRating(rating === "3" ? "" : "3")}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      {[1, 2, 3].map((star) => (
                        <StarIcon key={star} className="text-amber-500 h-4 w-4 fill-amber-500" />
                      ))}
                      {[4, 5].map((star) => (
                        <StarIcon key={star} className="text-amber-500 h-4 w-4" />
                      ))}
                      <span className="ml-1">& Up</span>
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={applyFilters} 
                  className="w-full bg-primary hover:bg-blue-600"
                >
                  Apply Filters
                </Button>
                <Button 
                  onClick={clearFilters} 
                  variant="outline" 
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden h-[400px] animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="mr-2"
                    onClick={() => changePage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, idx) => {
                    const pageNumber = page <= 3 
                      ? idx + 1 
                      : (page >= pagination.totalPages - 2 
                        ? pagination.totalPages - 4 + idx 
                        : page - 2 + idx);
                      
                    if (pageNumber > 0 && pageNumber <= pagination.totalPages) {
                      return (
                        <Button
                          key={pageNumber}
                          variant={page === pageNumber ? "default" : "outline"}
                          size="icon"
                          className="mr-2 h-10 w-10"
                          onClick={() => changePage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    }
                    return null;
                  })}
                  
                  {pagination.totalPages > 5 && page < pagination.totalPages - 2 && (
                    <>
                      <span className="mx-2">...</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="mr-2 h-10 w-10"
                        onClick={() => changePage(pagination.totalPages)}
                      >
                        {pagination.totalPages}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changePage(page + 1)}
                    disabled={page === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
