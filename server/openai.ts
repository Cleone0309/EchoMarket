import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" 
});

/**
 * Generate product description, title, and SEO tags based on an image
 */
export async function generateProductDescription(
  imageUrl: string, 
  productName?: string, 
  category?: string
): Promise<{
  title: string;
  description: string;
  suggestedCategories: string[];
  seoTags: string[];
}> {
  try {
    // If using a real image but no API key, return mock data for development
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set, using mock data for development");
      return getMockProductDescription(productName, category);
    }

    const prompt = `
    Analyze this product image and generate the following information in JSON format:
    1. A compelling product title (20 words or less)
    2. A detailed marketing description (100-150 words)
    3. Suggested categories that this product would belong to (list of 3-5)
    4. SEO keywords/tags that would help this product be discovered (list of 5-10)
    
    ${productName ? `The product name is: ${productName}` : ''}
    ${category ? `The product category is: ${category}` : ''}
    
    Respond with properly formatted JSON with these keys: title, description, suggestedCategories, seoTags.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "user", 
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      title: result.title,
      description: result.description,
      suggestedCategories: result.suggestedCategories,
      seoTags: result.seoTags
    };
  } catch (error) {
    console.error("Error generating product description:", error);
    throw new Error(`Failed to generate product description: ${error.message}`);
  }
}

/**
 * Returns mock AI-generated product information for development without API keys
 */
function getMockProductDescription(
  productName?: string, 
  category?: string
): {
  title: string;
  description: string;
  suggestedCategories: string[];
  seoTags: string[];
} {
  const name = productName || "Premium Product";
  const cat = category || "Electronics";
  
  const mockResponses = {
    Electronics: {
      title: `Ultra HD Wireless Noise-Cancelling Headphones`,
      description: `Experience unparalleled audio quality with our premium wireless headphones. Featuring advanced noise-cancellation technology, these headphones create an immersive listening experience by blocking out ambient noise. With plush, ergonomic ear cushions and an adjustable headband, they're designed for all-day comfort. The built-in high-capacity battery provides up to 30 hours of playtime on a single charge, and quick-charge technology gives you 5 hours of listening with just 10 minutes of charging. Compatible with all Bluetooth devices and voice assistants, these headphones are perfect for music enthusiasts, frequent travelers, and professionals working in noisy environments.`,
      suggestedCategories: ["Audio Equipment", "Wireless Accessories", "Noise-Cancelling Devices", "Travel Gadgets"],
      seoTags: ["wireless headphones", "noise-cancelling", "bluetooth headphones", "premium audio", "long battery life", "comfortable headphones", "travel headphones"]
    },
    Fashion: {
      title: `Classic Fit Moisture-Wicking Performance Polo`,
      description: `Elevate your casual wardrobe with our premium performance polo. Crafted from innovative moisture-wicking fabric, this shirt keeps you cool and dry throughout the day. The classic fit design offers a timeless silhouette that's both comfortable and flattering, while the reinforced collar maintains its shape wash after wash. Available in a range of sophisticated colors, this versatile polo transitions seamlessly from the office to weekend outings. The breathable material provides UV protection and resists wrinkles, making it ideal for travel. Easy care instructions mean you can machine wash and wear with minimal maintenance. A staple piece for any modern wardrobe.`,
      suggestedCategories: ["Men's Apparel", "Performance Clothing", "Business Casual", "Golf Attire"],
      seoTags: ["performance polo", "moisture-wicking shirt", "men's business casual", "breathable polo", "wrinkle-resistant shirt", "golf apparel", "easy care clothing"]
    },
    Home: {
      title: `Ergonomic Memory Foam Contour Pillow with Cooling Gel`,
      description: `Transform your sleep experience with our revolutionary memory foam contour pillow. Engineered with premium high-density foam that adapts to your unique shape, this pillow provides exceptional support for your head, neck, and shoulders. The integrated cooling gel technology regulates temperature throughout the night, preventing overheating and ensuring continuous comfort. The ergonomic contour design aligns your spine properly, reducing pressure points and helping to prevent morning stiffness and pain. Encased in a hypoallergenic, removable cover that's machine washable, this pillow maintains a clean, healthy sleep environment. Ideal for side and back sleepers looking to improve sleep quality and wake up refreshed.`,
      suggestedCategories: ["Bedding", "Sleep Accessories", "Ergonomic Products", "Wellness Items"],
      seoTags: ["memory foam pillow", "cooling gel pillow", "ergonomic pillow", "neck support pillow", "side sleeper pillow", "temperature regulating bedding", "hypoallergenic pillow"]
    }
  };

  // Determine which mock to use based on the category
  let result;
  if (cat.toLowerCase().includes("electronic") || cat.toLowerCase().includes("tech")) {
    result = mockResponses.Electronics;
  } else if (cat.toLowerCase().includes("fashion") || cat.toLowerCase().includes("cloth") || cat.toLowerCase().includes("apparel")) {
    result = mockResponses.Fashion;
  } else {
    result = mockResponses.Home;
  }

  // If a product name was provided, try to incorporate it
  if (productName) {
    result.title = productName + " - " + result.title.split(" ").slice(0, 3).join(" ");
  }

  return result;
}
