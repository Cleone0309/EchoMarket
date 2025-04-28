import { Link } from "wouter";
import { ShoppingBag, MapPin, Phone, Mail, Clock } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="text-primary text-2xl" />
              <span className="text-xl font-bold">ShopSmart</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your one-stop shop for all things modern and trendy. We offer the best prices on the latest products.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebookF />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaPinterestP />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-gray-400 hover:text-white transition-colors">
                  Featured Items
                </Link>
              </li>
              <li>
                <Link href="/products?new=true" className="text-gray-400 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?sort=popular" className="text-gray-400 hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/products?sale=true" className="text-gray-400 hover:text-white transition-colors">
                  Special Offers
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="text-primary mt-1 mr-3" size={16} />
                <span className="text-gray-400">123 Commerce St, Anytown, AN 12345</span>
              </li>
              <li className="flex items-start">
                <Phone className="text-primary mt-1 mr-3" size={16} />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <Mail className="text-primary mt-1 mr-3" size={16} />
                <span className="text-gray-400">support@shopsmart.com</span>
              </li>
              <li className="flex items-start">
                <Clock className="text-primary mt-1 mr-3" size={16} />
                <span className="text-gray-400">Mon-Fri: 9AM-6PM, Sat: 10AM-5PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} ShopSmart. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="h-6 text-gray-500">Payment Methods: </span>
              <span className="text-gray-400">Visa</span>
              <span className="text-gray-400">Mastercard</span>
              <span className="text-gray-400">American Express</span>
              <span className="text-gray-400">PayPal</span>
              <span className="text-gray-400">Apple Pay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
