import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
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
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Fetch recent orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
  });
  
  // Fetch products count
  const { data: productsData, isLoading: productsLoading } = useQuery<any>({
    queryKey: ["/api/products", { limit: 1 }],
  });

  const productCount = productsData?.pagination?.totalCount || 0;
  
  // Get order statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const pendingOrders = orders.filter(order => order.status === "pending").length;
  
  if (!user || user.role !== "admin") {
    return null; // Protected route should handle this
  }
  
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | ShopSmart</title>
        <meta name="description" content="Admin dashboard for ShopSmart e-commerce platform." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-500">
              Manage your store, products, and orders
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
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <div className="bg-blue-100 p-2 rounded-full">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{formatCurrency(totalRevenue)}</h3>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>12% from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm">Total Orders</p>
                <div className="bg-green-100 p-2 rounded-full">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{totalOrders}</h3>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>8% from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm">Total Products</p>
                <div className="bg-purple-100 p-2 rounded-full">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                {productsLoading ? "Loading..." : productCount}
              </h3>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>5% from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm">Pending Orders</p>
                <div className="bg-amber-100 p-2 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{pendingOrders}</h3>
              <div className="flex items-center text-sm text-amber-600">
                <span>Needs attention</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Orders and Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest customer orders that require processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    When customers place orders, they will appear here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>User #{order.userId}</TableCell>
                        <TableCell>
                          <div className={`
                            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                              order.status === 'shipped' ? 'bg-green-100 text-green-800' : 
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {order.status}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(order.total))}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {orders.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/orders">
                      View All Orders <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Store performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Conversion Rate</h4>
                    <span className="text-green-600 text-sm">+4.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">65% of visitors complete a purchase</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Average Order Value</h4>
                    <span className="text-green-600 text-sm">+12.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{formatCurrency(82.45)} per order</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Cart Abandonment</h4>
                    <span className="text-red-600 text-sm">-2.1%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">32% of carts are abandoned</p>
                </div>
                
                <div className="flex justify-center mt-4">
                  <Button variant="outline" size="sm">
                    View Full Analytics <BarChart3 className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
              <Link href="/admin/products">
                <Package className="h-6 w-6 mb-2" />
                <span>Manage Products</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
              <Link href="/admin/orders">
                <ShoppingBag className="h-6 w-6 mb-2" />
                <span>Process Orders</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
              <Link href="/admin/customers">
                <Users className="h-6 w-6 mb-2" />
                <span>Customer Accounts</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
              <Link href="/admin/analytics">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span>View Analytics</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
