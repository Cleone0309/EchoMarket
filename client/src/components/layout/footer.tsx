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
              <span className="text-xl font-bold text-primary">Viva Brinquedos</span>
            </div>
            <p className="text-gray-400 mb-4">
              Sua loja especializada em brinquedos educativos de qualidade. Desenvolvendo crianças mais felizes e criativas através da brincadeira.
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
            <h3 className="font-bold text-lg mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link href="/products?category=montessori" className="text-gray-400 hover:text-white transition-colors">
                  Montessori
                </Link>
              </li>
              <li>
                <Link href="/products?new=true" className="text-gray-400 hover:text-white transition-colors">
                  Lançamentos
                </Link>
              </li>
              <li>
                <Link href="/products?sort=popular" className="text-gray-400 hover:text-white transition-colors">
                  Mais Vendidos
                </Link>
              </li>
              <li>
                <Link href="/products?sale=true" className="text-gray-400 hover:text-white transition-colors">
                  Ofertas Especiais
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Atendimento ao Cliente</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Política de Envio
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-white transition-colors">
                  Acompanhar Pedido
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="text-primary mt-1 mr-3" size={16} />
                <span className="text-gray-400">Avenida Paulista, 1234, São Paulo - SP</span>
              </li>
              <li className="flex items-start">
                <Phone className="text-primary mt-1 mr-3" size={16} />
                <span className="text-gray-400">(11) 99999-9999</span>
              </li>
              <li className="flex items-start">
                <Mail className="text-primary mt-1 mr-3" size={16} />
                <span className="text-gray-400">contato@vivabrinquedos.com.br</span>
              </li>
              <li className="flex items-start">
                <Clock className="text-primary mt-1 mr-3" size={16} />
                <span className="text-gray-400">Seg-Sex: 9h às 18h, Sáb: 10h às 16h</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Viva Brinquedos Educativos. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="h-6 text-gray-500">Formas de Pagamento: </span>
              <span className="text-gray-400">Visa</span>
              <span className="text-gray-400">Mastercard</span>
              <span className="text-gray-400">Pix</span>
              <span className="text-gray-400">Boleto</span>
              <span className="text-gray-400">PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
