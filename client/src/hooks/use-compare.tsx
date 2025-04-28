import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type CompareContextType = {
  items: Product[];
  isLoading: boolean;
  error: Error | null;
  addItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearAll: () => void;
  isInCompare: (productId: number) => boolean;
};

export const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [compareIds, setCompareIds] = useState<number[]>(() => {
    // Inicializa a partir do localStorage se disponível
    const saved = localStorage.getItem("compareItems");
    return saved ? JSON.parse(saved) : [];
  });

  // Busca os produtos completos a partir dos IDs
  const { data: productsData, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products/compare", { ids: compareIds }],
    queryFn: async () => {
      if (compareIds.length === 0) return [];
      const queryString = compareIds.map(id => `id=${id}`).join("&");
      const res = await fetch(`/api/products/byIds?${queryString}`);
      if (!res.ok) throw new Error("Falha ao carregar produtos para comparação");
      return res.json();
    },
    enabled: compareIds.length > 0,
  });

  const items = productsData || [];

  // Persistir no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem("compareItems", JSON.stringify(compareIds));
  }, [compareIds]);

  const addItem = (productId: number) => {
    if (compareIds.includes(productId)) return;
    
    if (compareIds.length >= 4) {
      toast({
        title: "Limite atingido",
        description: "Você só pode comparar até 4 produtos ao mesmo tempo",
        variant: "destructive",
      });
      return;
    }
    
    setCompareIds(prev => [...prev, productId]);
    toast({
      title: "Produto adicionado",
      description: "Produto adicionado à comparação",
    });
  };

  const removeItem = (productId: number) => {
    setCompareIds(prev => prev.filter(id => id !== productId));
    toast({
      title: "Produto removido",
      description: "Produto removido da comparação",
    });
  };

  const clearAll = () => {
    setCompareIds([]);
    toast({
      title: "Lista limpa",
      description: "Todos os produtos foram removidos da comparação",
    });
  };

  const isInCompare = (productId: number) => {
    return compareIds.includes(productId);
  };

  return (
    <CompareContext.Provider
      value={{
        items,
        isLoading,
        error: error as Error | null,
        addItem,
        removeItem,
        clearAll,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare deve ser usado dentro de um CompareProvider");
  }
  return context;
}