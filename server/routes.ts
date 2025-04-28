import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { setupAuth } from "./auth";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { 
  products, 
  categories,
  cartItems,
  orders,
  orderItems,
  reviews,
  insertProductSchema,
  insertCategorySchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertReviewSchema,
} from "@shared/schema";
import { eq, and, like, desc, asc, sql, isNull, isNotNull } from "drizzle-orm";
import { generateProductDescription } from "./openai";
import { z } from "zod";

const scryptAsync = promisify(scrypt);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { 
        category, 
        search, 
        sort = "newest", 
        minPrice, 
        maxPrice, 
        rating, 
        limit = 20, 
        page = 1 
      } = req.query;
      
      let query = db.select().from(products);
      
      // Apply filters
      if (category) {
        const categoryData = await db.select().from(categories).where(eq(categories.slug, category as string)).limit(1);
        if (categoryData.length > 0) {
          query = query.where(eq(products.categoryId, categoryData[0].id));
        }
      }
      
      if (search) {
        query = query.where(like(products.name, `%${search}%`));
      }
      
      if (minPrice) {
        query = query.where(sql`${products.price} >= ${minPrice}`);
      }
      
      if (maxPrice) {
        query = query.where(sql`${products.price} <= ${maxPrice}`);
      }
      
      if (rating) {
        query = query.where(sql`${products.rating} >= ${rating}`);
      }
      
      // Apply sorting
      if (sort === "newest") {
        query = query.orderBy(desc(products.createdAt));
      } else if (sort === "price_asc") {
        query = query.orderBy(asc(products.price));
      } else if (sort === "price_desc") {
        query = query.orderBy(desc(products.price));
      } else if (sort === "popular") {
        query = query.orderBy(desc(products.reviewCount));
      }
      
      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      const productsList = await query.limit(Number(limit)).offset(offset);
      
      // Get total count for pagination
      const totalCountResult = await db.select({ count: sql`count(*)` }).from(products);
      const totalCount = Number(totalCountResult[0].count);
      
      const totalPages = Math.ceil(totalCount / Number(limit));
      
      res.json({
        products: productsList,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages,
          totalCount
        }
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:slugOrId", async (req, res) => {
    try {
      const { slugOrId } = req.params;
      
      // Check if slugOrId is a number (id) or string (slug)
      const isId = !isNaN(Number(slugOrId));
      
      let product;
      if (isId) {
        [product] = await db.select().from(products).where(eq(products.id, Number(slugOrId)));
      } else {
        [product] = await db.select().from(products).where(eq(products.slug, slugOrId));
      }
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Get related products (same category)
      const relatedProducts = await db
        .select()
        .from(products)
        .where(and(
          eq(products.categoryId, product.categoryId),
          sql`${products.id} != ${product.id}`
        ))
        .limit(4);
      
      // Get product reviews
      const productReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, product.id))
        .orderBy(desc(reviews.createdAt));
      
      res.json({
        product,
        relatedProducts,
        reviews: productReviews
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const productData = insertProductSchema.parse(req.body);
      
      const [product] = await db.insert(products).values(productData).returning();
      
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      const productData = insertProductSchema.parse(req.body);
      
      const [updatedProduct] = await db
        .update(products)
        .set(productData)
        .where(eq(products.id, Number(id)))
        .returning();
      
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      
      await db.delete(products).where(eq(products.id, Number(id)));
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categoriesList = await db.select().from(categories);
      res.json(categoriesList);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      
      const [category] = await db.insert(categories).values(categoryData).returning();
      
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ error: "Failed to create category" });
    }
  });

  // Cart
  app.get("/api/cart", async (req, res) => {
    try {
      let userCart;
      
      if (req.isAuthenticated()) {
        // If logged in, get user's cart
        userCart = await db
          .select({
            id: cartItems.id,
            productId: cartItems.productId,
            quantity: cartItems.quantity,
            product: products
          })
          .from(cartItems)
          .leftJoin(products, eq(cartItems.productId, products.id))
          .where(eq(cartItems.userId, req.user.id));
      } else {
        // If not logged in, get cart by session ID
        const sessionId = req.sessionID;
        userCart = await db
          .select({
            id: cartItems.id,
            productId: cartItems.productId,
            quantity: cartItems.quantity,
            product: products
          })
          .from(cartItems)
          .leftJoin(products, eq(cartItems.productId, products.id))
          .where(eq(cartItems.sessionId, sessionId));
      }
      
      res.json(userCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse(req.body);
      
      // Set the user ID if authenticated
      if (req.isAuthenticated()) {
        cartItemData.userId = req.user.id;
      } else {
        cartItemData.sessionId = req.sessionID;
      }
      
      // Check if item already exists in cart
      let existingItem;
      
      if (req.isAuthenticated()) {
        [existingItem] = await db
          .select()
          .from(cartItems)
          .where(and(
            eq(cartItems.userId, req.user.id),
            eq(cartItems.productId, cartItemData.productId)
          ));
      } else {
        [existingItem] = await db
          .select()
          .from(cartItems)
          .where(and(
            eq(cartItems.sessionId, req.sessionID),
            eq(cartItems.productId, cartItemData.productId)
          ));
      }
      
      if (existingItem) {
        // Update quantity if item already exists
        const [updatedItem] = await db
          .update(cartItems)
          .set({ quantity: existingItem.quantity + cartItemData.quantity })
          .where(eq(cartItems.id, existingItem.id))
          .returning();
        
        return res.json(updatedItem);
      }
      
      // Otherwise, add new item
      const [newItem] = await db.insert(cartItems).values(cartItemData).returning();
      
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(400).json({ error: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      // Validate the cart item belongs to the user
      let cartItem;
      
      if (req.isAuthenticated()) {
        [cartItem] = await db
          .select()
          .from(cartItems)
          .where(and(
            eq(cartItems.id, Number(id)),
            eq(cartItems.userId, req.user.id)
          ));
      } else {
        [cartItem] = await db
          .select()
          .from(cartItems)
          .where(and(
            eq(cartItems.id, Number(id)),
            eq(cartItems.sessionId, req.sessionID)
          ));
      }
      
      if (!cartItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      // Update the quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, Number(id)))
        .returning();
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(400).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate the cart item belongs to the user
      let cartItem;
      
      if (req.isAuthenticated()) {
        [cartItem] = await db
          .select()
          .from(cartItems)
          .where(and(
            eq(cartItems.id, Number(id)),
            eq(cartItems.userId, req.user.id)
          ));
      } else {
        [cartItem] = await db
          .select()
          .from(cartItems)
          .where(and(
            eq(cartItems.id, Number(id)),
            eq(cartItems.sessionId, req.sessionID)
          ));
      }
      
      if (!cartItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      // Delete the item
      await db.delete(cartItems).where(eq(cartItems.id, Number(id)));
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      let query = db.select().from(orders);
      
      if (req.user.role !== "admin") {
        // Regular users can only see their own orders
        query = query.where(eq(orders.userId, req.user.id));
      }
      
      const ordersList = await query.orderBy(desc(orders.createdAt));
      
      res.json(ordersList);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const { id } = req.params;
      
      let [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, Number(id)));
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Check if user is authorized to view this order
      if (req.user.role !== "admin" && order.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      // Get order items
      const items = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          total: orderItems.total,
          product: products
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, Number(id)));
      
      res.json({
        order,
        items
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const orderData = insertOrderSchema.parse(req.body);
      orderData.userId = req.user.id;
      
      // Start a transaction
      const [order] = await db.insert(orders).values(orderData).returning();
      
      // Add order items
      if (req.body.items && Array.isArray(req.body.items)) {
        const orderItemsData = req.body.items.map(item => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }));
        
        await db.insert(orderItems).values(orderItemsData);
      }
      
      // Clear the user's cart
      await db.delete(cartItems).where(eq(cartItems.userId, req.user.id));
      
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: "Failed to create order" });
    }
  });

  // Reviews
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      reviewData.userId = req.user.id;
      
      const [review] = await db.insert(reviews).values(reviewData).returning();
      
      // Update product rating and review count
      const productReviews = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.productId, reviewData.productId));
      
      const totalRating = productReviews.reduce((sum, r) => sum + Number(r.rating), 0);
      const avgRating = totalRating / productReviews.length;
      
      await db
        .update(products)
        .set({ 
          rating: avgRating.toFixed(1),
          reviewCount: productReviews.length
        })
        .where(eq(products.id, reviewData.productId));
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ error: "Failed to create review" });
    }
  });

  // AI Product Description Generation
  app.post("/api/generate-product-description", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    try {
      const { imageUrl, productName, category } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }
      
      const aiResult = await generateProductDescription(imageUrl, productName, category);
      
      res.json(aiResult);
    } catch (error) {
      console.error("Error generating product description:", error);
      res.status(500).json({ 
        error: "Failed to generate product description",
        details: error.message
      });
    }
  });

  // WhatsApp Chatbot Webhook (simulated)
  app.post("/api/whatsapp-webhook", async (req, res) => {
    try {
      const { 
        phone, 
        message, 
        userId
      } = req.body;
      
      // Simulate WhatsApp chatbot logic
      let response = "Thank you for your message! Our customer service team will get back to you soon.";
      
      // Simple keyword detection for automated responses
      const normalizedMessage = message.toLowerCase();
      
      if (normalizedMessage.includes("order status") || normalizedMessage.includes("my order")) {
        response = "To check your order status, please log in to your account and visit the 'My Orders' section. Alternatively, please provide your order number for assistance.";
      } else if (normalizedMessage.includes("return") || normalizedMessage.includes("exchange")) {
        response = "For returns or exchanges, please visit our Returns Policy page on the website. Items must be returned within 30 days of purchase with original packaging.";
      } else if (normalizedMessage.includes("shipping") || normalizedMessage.includes("delivery")) {
        response = "Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is available for an additional fee. International shipping may take 7-14 business days.";
      } else if (normalizedMessage.includes("payment") || normalizedMessage.includes("pay")) {
        response = "We accept all major credit cards, PayPal, and Apple Pay. Payment information is securely processed and encrypted.";
      } else if (normalizedMessage.includes("human") || normalizedMessage.includes("agent") || normalizedMessage.includes("representative")) {
        response = "I'm transferring you to a human agent. Someone will respond to you shortly. Our customer service hours are Monday-Friday, 9AM-6PM EST.";
      }
      
      res.json({ 
        success: true, 
        response 
      });
    } catch (error) {
      console.error("Error processing WhatsApp webhook:", error);
      res.status(500).json({ error: "Failed to process WhatsApp message" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
