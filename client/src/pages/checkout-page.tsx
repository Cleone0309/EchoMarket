import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet";
import { CreditCard, DollarSign, LucideShoppingCart } from "lucide-react";

// Form schema
const checkoutSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  sameAddress: z.boolean().default(true),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZipCode: z.string().optional(),
  paymentMethod: z.enum(["credit_card", "paypal"]),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  saveInfo: z.boolean().default(false),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { items, totalItems, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  
  // Calculate tax (8% of subtotal)
  const tax = subtotal * 0.08;
  
  // Calculate shipping (free for orders over $50)
  const shipping = subtotal >= 50 ? 0 : 5.99;
  
  // Calculate total
  const total = subtotal + tax + shipping;
  
  // Payment step
  const [paymentStep, setPaymentStep] = useState<"details" | "payment" | "confirmation">("details");
  
  // Form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
      sameAddress: true,
      paymentMethod: "credit_card",
      saveInfo: false,
    },
  });
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      // Map cart items to order items
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        total: Number(item.product.price) * item.quantity,
      }));
      
      // Create shipping address
      const shippingAddress = {
        fullName: data.fullName,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
      };
      
      // Create billing address
      const billingAddress = data.sameAddress 
        ? shippingAddress 
        : {
            fullName: data.fullName,
            address: data.billingAddress,
            city: data.billingCity,
            state: data.billingState,
            zipCode: data.billingZipCode,
            phone: data.phone,
          };
      
      // Create order
      const order = {
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress,
        billingAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus: "pending", // Will be updated after payment processing
        items: orderItems,
        notes: data.notes,
      };
      
      const res = await apiRequest("POST", "/api/orders", order);
      return await res.json();
    },
    onSuccess: (data) => {
      // Clear cart
      clearCart();
      
      // Show success toast
      toast({
        title: "Order placed successfully!",
        description: `Your order #${data.id} has been placed and is being processed.`,
      });
      
      // Redirect to confirmation page (we'll use the same page with a different step)
      setPaymentStep("confirmation");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: CheckoutFormValues) => {
    if (paymentStep === "details") {
      // Move to payment step
      setPaymentStep("payment");
    } else if (paymentStep === "payment") {
      // Process payment and create order
      createOrderMutation.mutate(values);
    }
  };
  
  // Handle step change
  const handleBackToDetails = () => {
    setPaymentStep("details");
  };
  
  // Handle continue shopping
  const handleContinueShopping = () => {
    setLocation("/products");
  };
  
  // If no items in cart, redirect to cart page
  if (items.length === 0 && paymentStep !== "confirmation") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-amber-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            You need to add items to your cart before proceeding to checkout.
          </p>
          <Button asChild className="bg-primary hover:bg-blue-600">
            <a href="/products">Browse Products</a>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Checkout | ShopSmart</title>
        <meta name="description" content="Secure checkout process for your order at ShopSmart." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        {paymentStep === "confirmation" ? (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
                <CardDescription>
                  Thank you for your purchase. We've received your order and are processing it now.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span>Order Number:</span>
                    <span className="font-medium">#123456</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Order Date:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Order Total:</span>
                    <span className="font-medium">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payment Method:</span>
                    <span className="font-medium">Credit Card</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">What's Next?</h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-600 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>You'll receive an order confirmation email shortly.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-600 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Your items will be processed and shipped within 1-2 business days.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-600 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>You can track your order status in the "My Orders" section of your account.</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <a href="/orders">View My Orders</a>
                </Button>
                <Button className="bg-primary hover:bg-blue-600" onClick={handleContinueShopping}>
                  Continue Shopping
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {paymentStep === "details" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Shipping Information</CardTitle>
                        <CardDescription>
                          Enter your shipping details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="john@example.com" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="New York" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="NY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Zip Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="10001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="sameAddress"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Billing address is the same as shipping address
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        {!form.watch("sameAddress") && (
                          <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-medium">Billing Address</h3>
                            
                            <FormField
                              control={form.control}
                              name="billingAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Billing Street Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123 Main St" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="billingCity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input placeholder="New York" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="billingState"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                      <Input placeholder="NY" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="billingZipCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Zip Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="10001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )}
                        
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Order Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Special instructions for delivery, etc." 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter>
                        <Button 
                          type="submit" 
                          className="ml-auto bg-primary hover:bg-blue-600"
                        >
                          Continue to Payment
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                  
                  {paymentStep === "payment" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Information</CardTitle>
                        <CardDescription>
                          Choose your payment method
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Payment Method</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <div className="flex items-center space-x-3 space-y-0">
                                    <RadioGroupItem value="credit_card" id="credit_card" />
                                    <label 
                                      htmlFor="credit_card" 
                                      className="flex items-center cursor-pointer"
                                    >
                                      <CreditCard className="mr-2 h-4 w-4" />
                                      Credit / Debit Card
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-3 space-y-0">
                                    <RadioGroupItem value="paypal" id="paypal" />
                                    <label 
                                      htmlFor="paypal" 
                                      className="flex items-center cursor-pointer"
                                    >
                                      <DollarSign className="mr-2 h-4 w-4" />
                                      PayPal
                                    </label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {form.watch("paymentMethod") === "credit_card" && (
                          <div className="space-y-4 pt-4">
                            <FormField
                              control={form.control}
                              name="cardName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name on Card</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="cardNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Card Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="1234 5678 9012 3456" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="cardExpiry"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Expiration Date (MM/YY)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="MM/YY" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cardCvc"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CVC</FormLabel>
                                    <FormControl>
                                      <Input placeholder="123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )}
                        
                        {form.watch("paymentMethod") === "paypal" && (
                          <div className="pt-4 text-center">
                            <p className="text-sm text-gray-500 mb-4">
                              You will be redirected to PayPal to complete your payment after review.
                            </p>
                            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
                              <p className="font-medium">PayPal Sandbox Mode</p>
                              <p className="text-sm">This is a development environment. No actual payment will be processed.</p>
                            </div>
                          </div>
                        )}
                        
                        <FormField
                          control={form.control}
                          name="saveInfo"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Save payment information for future purchases
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={handleBackToDetails}
                        >
                          Back to Shipping
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-primary hover:bg-blue-600"
                          disabled={createOrderMutation.isPending}
                        >
                          {createOrderMutation.isPending ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>Place Order</>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </form>
              </Form>
            </div>
            
            <div className="lg:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>
                    {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-[300px] overflow-auto space-y-3 pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden shrink-0">
                          {item.product.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <LucideShoppingCart className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                          <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(Number(item.product.price) * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          formatCurrency(shipping)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (8%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <svg className="h-5 w-5 text-green-600 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">Secure payment processing</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="h-5 w-5 text-green-600 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">Free shipping on orders over $50</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="h-5 w-5 text-green-600 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">30-day money-back guarantee</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
