import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Package2, Search, Calendar, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Order } from "@shared/schema";
import { Link } from "wouter";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  // Filter orders by search term
  const filteredOrders = orders.filter(order => 
    searchTerm 
      ? `#${order.id}`.includes(searchTerm) || 
        (order.status || "").toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );
  
  // Get badge color based on order status
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case 'shipped':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'delivered':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'canceled':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case 'pending':
      default:
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Your Orders | ShopSmart</title>
        <meta name="description" content="View and manage your order history at ShopSmart." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
            <p className="text-gray-500">
              View and track your order history
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders"
              className="pl-10 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              {searchTerm ? (
                <>
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-gray-500" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No matching orders found</h2>
                  <p className="text-gray-500 mb-4">
                    We couldn't find any orders matching your search.
                  </p>
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <ShoppingCart className="h-6 w-6 text-gray-500" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                  <p className="text-gray-500 mb-4">
                    You haven't placed any orders yet. Start shopping to place your first order!
                  </p>
                  <Button asChild className="bg-primary hover:bg-blue-600">
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Display orders */}
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={getStatusBadgeColor(order.status)}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Package2 className="h-4 w-4 mr-1" />
                      Items: {order.items?.length || "N/A"}
                    </span>
                    <span>Total: {formatCurrency(Number(order.total))}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* For demo purposes, display mock items if real items aren't available */}
                      {!order.items || order.items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                            Order items not available
                          </TableCell>
                        </TableRow>
                      ) : (
                        order.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.product?.name || `Product #${item.productId}`}
                            </TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(Number(item.price))}</TableCell>
                            <TableCell className="text-right">{formatCurrency(Number(item.total))}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                    <div>
                      <h4 className="font-medium mb-1">Shipping Address</h4>
                      <p className="text-sm text-gray-500">
                        {order.shippingAddress ? (
                          <>
                            {(order.shippingAddress as any).fullName}, 
                            {(order.shippingAddress as any).address}, 
                            {(order.shippingAddress as any).city}, 
                            {(order.shippingAddress as any).state} {(order.shippingAddress as any).zipCode}
                          </>
                        ) : (
                          "Address information not available"
                        )}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        Track Order
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status === "pending" && (
                        <Button variant="destructive" size="sm">
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
