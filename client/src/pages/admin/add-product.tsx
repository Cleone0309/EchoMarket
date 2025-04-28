import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import { insertProductSchema } from "@shared/schema";
import { 
  ArrowLeft, 
  ImagePlus, 
  LoaderCircle, 
  Sparkles, 
  Package,
  Save
} from "lucide-react";

// Extend schema for form
const productFormSchema = insertProductSchema.extend({
  image: z.instanceof(FileList).optional(),
  generateDescription: z.boolean().default(false),
}).omit({ slug: true });

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AddProduct() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Create product form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      price: "0.00",
      description: "",
      inventory: 0,
      isNew: true,
      isOnSale: false,
      generateDescription: false,
    },
  });
  
  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      form.setValue("image", files);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // If AI generation is enabled, trigger it
      if (form.watch("generateDescription")) {
        generateAIDescription(file);
      }
    }
  };
  
  // Generate AI description
  const generateAIDescription = async (imageFile: File) => {
    try {
      setIsGeneratingAI(true);
      
      // First upload the image to get a URL
      const imageUrl = await uploadImage(imageFile);
      
      // Then call the AI description API
      const productName = form.watch("name");
      const categoryId = form.watch("categoryId");
      let categoryName = "product";
      
      // Find category name if categoryId is provided
      if (categoryId) {
        const category = categories.find(c => c.id === Number(categoryId));
        if (category) {
          categoryName = category.name;
        }
      }
      
      const response = await apiRequest("POST", "/api/generate-product-description", {
        imageUrl,
        productName,
        category: categoryName
      });
      
      const aiResult = await response.json();
      
      // Update form with AI generated content
      form.setValue("name", aiResult.title || form.watch("name"));
      form.setValue("description", aiResult.description || "");
      form.setValue("seoTitle", aiResult.title || "");
      form.setValue("seoDescription", aiResult.description ? aiResult.description.substring(0, 160) : "");
      form.setValue("seoKeywords", aiResult.seoTags ? aiResult.seoTags.join(", ") : "");
      
      toast({
        title: "AI Description Generated",
        description: "Product details have been updated with AI suggestions."
      });
    } catch (error) {
      toast({
        title: "Failed to generate AI description",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      let imageUrl = null;
      
      // Upload image if provided
      if (data.image instanceof FileList && data.image.length > 0) {
        imageUrl = await uploadImage(data.image[0]);
      }
      
      // Create product data
      const productData = {
        ...data,
        slug: slugify(data.name),
        imageUrl,
        price: parseFloat(data.price as string),
      };
      
      // Remove image and generateDescription fields
      delete productData.image;
      delete productData.generateDescription;
      
      // Send to API
      const response = await apiRequest("POST", "/api/products", productData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Created",
        description: "Your product has been successfully created."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setLocation("/admin/products");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Form submission
  const onSubmit = (values: ProductFormValues) => {
    createProductMutation.mutate(values);
  };
  
  return (
    <>
      <Helmet>
        <title>Add New Product | ShopSmart Admin</title>
        <meta name="description" content="Add a new product to your e-commerce store." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/admin/products")}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Adicionar Novo Produto</h1>
            <p className="text-gray-500">Crie um novo produto para sua loja</p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="description">Descrição</TabsTrigger>
                    <TabsTrigger value="images">Mídia</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general">
                    <Card>
                      <CardHeader>
                        <CardTitle>Product Information</CardTitle>
                        <CardDescription>
                          Enter the basic details for your product
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter product name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" min="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="compareAtPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Compare at Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    min="0" 
                                    placeholder="Optional"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value ? e.target.value : undefined)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Original price before discount
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(Number(value))}
                                  value={field.value?.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="inventory"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inventory</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    step="1"
                                    {...field}
                                    value={field.value}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Available stock quantity
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="isNew"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md shadow-sm">
                                <div>
                                  <FormLabel className="text-base">New Product</FormLabel>
                                  <FormDescription>
                                    Mark as a new arrival product
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="isOnSale"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md shadow-sm">
                                <div>
                                  <FormLabel className="text-base">On Sale</FormLabel>
                                  <FormDescription>
                                    Mark as a sale/discounted product
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="description">
                    <Card>
                      <CardHeader>
                        <CardTitle>Product Description</CardTitle>
                        <CardDescription>
                          Provide detailed information about your product
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your product in detail..." 
                                  className="min-h-[200px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Provide details about features, specifications, materials, etc.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="images">
                    <Card>
                      <CardHeader>
                        <CardTitle>Product Images</CardTitle>
                        <CardDescription>
                          Upload images of your product
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <FormField
                            control={form.control}
                            name="image"
                            render={({ field: { value, onChange, ...field } }) => (
                              <FormItem>
                                <FormLabel>Main Product Image</FormLabel>
                                <FormControl>
                                  <div className="flex flex-col items-center">
                                    <div className="w-full h-64 border-2 border-dashed rounded-lg p-4 flex items-center justify-center mb-4 bg-gray-50 relative">
                                      {imagePreview ? (
                                        <img 
                                          src={imagePreview} 
                                          alt="Product preview" 
                                          className="max-h-full object-contain"
                                        />
                                      ) : (
                                        <div className="text-center">
                                          <ImagePlus className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                          <p className="text-gray-500">
                                            Drag and drop an image here or click to upload
                                          </p>
                                          <p className="text-xs text-gray-400 mt-1">
                                            PNG, JPG, or WEBP up to 5MB
                                          </p>
                                        </div>
                                      )}
                                      <Input
                                        id="product-image"
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                        {...field}
                                      />
                                    </div>
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  This will be the main image displayed for your product.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="generateDescription"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 border rounded-md p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  <div className="flex items-center">
                                    <Sparkles className="h-4 w-4 text-amber-500 mr-2" />
                                    Generate AI Content from Image
                                  </div>
                                </FormLabel>
                                <FormDescription>
                                  Automatically generate product title, description, and SEO content based on the uploaded image.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="seo">
                    <Card>
                      <CardHeader>
                        <CardTitle>SEO Information</CardTitle>
                        <CardDescription>
                          Optimize your product for search engines
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="seoTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SEO Title</FormLabel>
                              <FormControl>
                                <Input placeholder="SEO-friendly title" {...field} />
                              </FormControl>
                              <FormDescription>
                                Optimized title for search engines (defaults to product name if left empty)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="seoDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Brief description for search results" 
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Keep between 120-160 characters for best results
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="seoKeywords"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Keywords</FormLabel>
                              <FormControl>
                                <Input placeholder="keyword1, keyword2, keyword3" {...field} />
                              </FormControl>
                              <FormDescription>
                                Comma-separated keywords related to the product
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Sidebar - 1/3 width */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status:</span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Draft
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Visibility:</span>
                        <span className="text-sm">Public</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Created:</span>
                        <span className="text-sm">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-blue-600"
                      disabled={createProductMutation.isPending}
                    >
                      {createProductMutation.isPending ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Product
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setLocation("/admin/products")}
                    >
                      Cancel
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* AI Content Generation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
                      AI Content Generation
                    </CardTitle>
                    <CardDescription>
                      Use AI to automatically generate product content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Upload a product image and enable AI content generation to automatically:
                      </p>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Generate product title
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Create detailed product description
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Suggest appropriate categories
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          Generate SEO optimized content
                        </li>
                      </ul>
                      
                      {isGeneratingAI && (
                        <div className="bg-amber-50 text-amber-800 p-3 rounded-md flex items-center">
                          <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
                          Generating AI content...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Preview Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Product preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-16 w-16 text-gray-300" />
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium truncate">
                          {form.watch("name") || "Product Name"}
                        </h3>
                        <div className="text-sm text-gray-500 mb-2">
                          {categories.find(c => c.id === Number(form.watch("categoryId")))?.name || "Category"}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="font-bold">
                            ${parseFloat(form.watch("price") || "0").toFixed(2)}
                          </div>
                          <Button size="sm" className="h-8 w-8 p-0" disabled>
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
