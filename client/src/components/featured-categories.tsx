import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Laptop, ShoppingBag, Home, Dumbbell, Gamepad, MoreHorizontal } from "lucide-react";
import { Category } from "@shared/schema";

const iconMapping: Record<string, React.ReactNode> = {
  electronics: <Laptop className="text-4xl text-gray-400" />,
  fashion: <ShoppingBag className="text-4xl text-gray-400" />,
  home: <Home className="text-4xl text-gray-400" />,
  sports: <Dumbbell className="text-4xl text-gray-400" />,
  gaming: <Gamepad className="text-4xl text-gray-400" />,
  default: <MoreHorizontal className="text-4xl text-gray-400" />,
};

export default function FeaturedCategories() {
  const { data: categories = [], isLoading } = useQuery<Category[], Error>({
    queryKey: ["/api/categories"],
  });

  // Limit to 6 categories max
  const displayCategories = categories.slice(0, 5);
  
  // If no categories from API, use fallback categories
  const fallbackCategories = [
    { id: 1, name: "Electronics", slug: "electronics" },
    { id: 2, name: "Fashion", slug: "fashion" },
    { id: 3, name: "Home", slug: "home" },
    { id: 4, name: "Sports", slug: "sports" },
    { id: 5, name: "Gaming", slug: "gaming" },
  ];
  
  const categoriesToDisplay = displayCategories.length > 0 ? displayCategories : fallbackCategories;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categoriesToDisplay.map((category) => (
            <Link 
              key={category.id} 
              href={`/products?category=${category.slug}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden text-center"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {iconMapping[category.slug] || iconMapping.default}
              </div>
              <div className="p-4">
                <h3 className="font-medium">{category.name}</h3>
              </div>
            </Link>
          ))}
          
          <Link 
            href="/products"
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden text-center"
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <MoreHorizontal className="text-4xl text-gray-400" />
            </div>
            <div className="p-4">
              <h3 className="font-medium">More</h3>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
