import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import CartSidebar from "@/components/cart-sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingBag, User, Menu, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { totalItems } = useCart();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Close mobile menu on location change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center">
                <ShoppingBag className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold">ShopSmart</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/products" className="font-medium hover:text-primary transition-colors">
                Products
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="font-medium hover:text-primary transition-colors flex items-center">
                  Categories <ChevronDown size={16} className="ml-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem asChild>
                    <Link href="/products?category=electronics">Electronics</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/products?category=fashion">Fashion</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/products?category=home">Home</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/products?category=sports">Sports</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/products?category=gaming">Gaming</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/products?sale=true" className="font-medium hover:text-primary transition-colors">
                Deals
              </Link>
              <Link href="#" className="font-medium hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <form onSubmit={handleSearch}>
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                </form>
              </div>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="hover:text-primary transition-colors">
                    <User className="h-5 w-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>
                      <span className="font-medium">Hi, {user.username}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard">Admin Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/products">Manage Products</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth" className="hover:text-primary transition-colors">
                  <User className="h-5 w-5" />
                </Link>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary transition-colors relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 space-y-3 bg-white border-t">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                className="bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            </form>
            <Link href="/" className="block py-2 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/products" className="block py-2 hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="/products?category=electronics" className="block py-2 hover:text-primary transition-colors pl-4">
              - Electronics
            </Link>
            <Link href="/products?category=fashion" className="block py-2 hover:text-primary transition-colors pl-4">
              - Fashion
            </Link>
            <Link href="/products?category=home" className="block py-2 hover:text-primary transition-colors pl-4">
              - Home
            </Link>
            <Link href="/products?category=sports" className="block py-2 hover:text-primary transition-colors pl-4">
              - Sports
            </Link>
            <Link href="/products?category=gaming" className="block py-2 hover:text-primary transition-colors pl-4">
              - Gaming
            </Link>
            <Link href="/products?sale=true" className="block py-2 hover:text-primary transition-colors">
              Deals
            </Link>
            <Link href="#" className="block py-2 hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        )}
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
