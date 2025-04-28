import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { 
  Package, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  ArrowUp,
  ArrowDown,
  Filter,
  LoaderCircle
} from "lucide-react";
import { Product } from "@shared/schema";

export default function AdminProducts() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Fetch products
  const { data, isLoading, error } = useQuery<{
    products: Product[];
    pagination: {
      totalCount: number;
      totalPages: number;
      page: number;
      limit: number;
    };
  }>({
    queryKey: ["/api/products", { sort: sortField, order: sortOrder }],
  });
  
  const products = data?.products || [];
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowDeleteDialog(false);
      setProductToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle delete confirmation
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };
  
  // Handle confirmed delete
  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };
  
  // Handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  
  // Filter products by search term
  const filteredProducts = products.filter((product) => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (product.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Error Loading Products</h1>
          <p>{error.message}</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/products"] })}
            className="mt-4 bg-primary hover:bg-blue-600"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Manage Products | ShopSmart Admin</title>
        <meta name="description" content="Manage your e-commerce products - add, edit, and delete products." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-gray-500">
              Manage your store products
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button asChild className="bg-primary hover:bg-blue-600">
              <Link href="/admin/products/add">
                <Plus className="mr-2 h-4 w-4" /> Add New Product
              </Link>
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>
              {isLoading ? "Loading products..." : `${data?.pagination?.totalCount || 0} products found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-64 md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Sort by {sortField === "createdAt" ? "Date" : 
                              sortField === "price" ? "Price" : 
                              sortField === "name" ? "Name" : 
                              sortField === "inventory" ? "Inventory" : 
                              "Custom"}
                      {sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSort("name")}>
                      Name {sortField === "name" && (
                        sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("price")}>
                      Price {sortField === "price" && (
                        sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("inventory")}>
                      Inventory {sortField === "inventory" && (
                        sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort("createdAt")}>
                      Date Added {sortField === "createdAt" && (
                        sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? "Try adjusting your search query" : "Get started by adding your first product"}
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
                {!searchTerm && (
                  <Button asChild className="mt-4 bg-primary hover:bg-blue-600">
                    <Link href="/admin/products/add">
                      <Plus className="mr-2 h-4 w-4" /> Add New Product
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Inventory</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category?.name || "Uncategorized"}</TableCell>
                        <TableCell className="text-right">
                          {product.compareAtPrice ? (
                            <div>
                              <span className="text-red-600 font-medium">
                                {formatCurrency(product.price)}
                              </span>
                              <span className="line-through text-gray-400 text-sm ml-1">
                                {formatCurrency(product.compareAtPrice)}
                              </span>
                            </div>
                          ) : (
                            formatCurrency(product.price)
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${Number(product.inventory) <= 0 ? 'text-red-600' : Number(product.inventory) < 10 ? 'text-amber-600' : 'text-green-600'}`}>
                            {product.inventory || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {product.isOnSale && (
                            <Badge className="mr-1 bg-amber-100 text-amber-800 hover:bg-amber-100">Sale</Badge>
                          )}
                          {product.isNew && (
                            <Badge className="mr-1 bg-green-100 text-green-800 hover:bg-green-100">New</Badge>
                          )}
                          {!product.isOnSale && !product.isNew && Number(product.inventory) <= 0 && (
                            <Badge variant="outline" className="text-red-600 border-red-200">Out of Stock</Badge>
                          )}
                          {!product.isOnSale && !product.isNew && Number(product.inventory) > 0 && (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/product/${product.slug}`}>
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/products/edit/${product.id}`}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(product)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center mt-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mr-2"
                  disabled={data.pagination.page === 1}
                  onClick={() => {
                    const newParams = {
                      sort: sortField,
                      order: sortOrder,
                      page: data.pagination.page - 1
                    };
                    queryClient.invalidateQueries({ queryKey: ["/api/products", newParams] });
                  }}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 mx-4">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={data.pagination.page === data.pagination.totalPages}
                  onClick={() => {
                    const newParams = {
                      sort: sortField,
                      order: sortOrder,
                      page: data.pagination.page + 1
                    };
                    queryClient.invalidateQueries({ queryKey: ["/api/products", newParams] });
                  }}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product <span className="font-medium">{productToDelete?.name}</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteProductMutation.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
