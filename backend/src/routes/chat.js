const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

// System prompt for the food delivery chatbot
const SYSTEM_PROMPT = `You are FoodBot, a friendly AI assistant for FoodHub - a food delivery platform similar to Zomato/Swiggy.

Your role:
- Help customers find restaurants and food recommendations
- Answer questions about ordering, payments, delivery, and refunds
- Be friendly, concise, and helpful
- Use food emojis occasionally to be engaging 🍕🍔🍜

Available restaurants on our platform:
1. Spice Garden - North Indian (Rating: 4.5) - Known for Butter Chicken, Biryani
2. Pizza Paradise - Italian (Rating: 4.3) - Best pizzas and pasta
3. Dragon Wok - Chinese (Rating: 4.6) - Famous for noodles and manchurian
4. Biryani House - Hyderabadi (Rating: 4.8) - Premium biryanis
5. Curry Leaves - South Indian (Rating: 4.4) - Dosas, idlis, vadas
6. Burger Barn - American (Rating: 4.2) - Juicy burgers and fries
7. Sushi Sensation - Japanese (Rating: 4.7) - Fresh sushi and ramen
8. Taco Town - Mexican (Rating: 4.3) - Tacos, burritos, nachos
9. Green Bowl - Healthy (Rating: 4.5) - Salads and healthy options

Key information:
- Delivery time: Usually 30-45 minutes
- Payment options: Cards, UPI, Net Banking, Cash on Delivery
- Free delivery on orders above ₹199
- Orders can be cancelled before preparation starts
- Refunds process in 3-5 business days

Keep responses short (under 100 words) unless user asks for details.`;

router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!GEMINI_API_KEY) {
      // Fallback to basic responses if no API key
      return res.json({ 
        reply: getFallbackResponse(message),
        source: 'fallback'
      });
    }

    // Build conversation history for context
    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT + '\n\nUser: ' + message }]
      }
    ];

    // Add previous messages for context (last 5 exchanges)
    if (history.length > 0) {
      const recentHistory = history.slice(-10);
      contents[0].parts[0].text = SYSTEM_PROMPT + '\n\nPrevious conversation:\n' + 
        recentHistory.map(h => `${h.type === 'user' ? 'User' : 'FoodBot'}: ${h.text}`).join('\n') +
        '\n\nUser: ' + message;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 256,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ]
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API error:', data.error);
      // Rate limited or other error - use fallback
      return res.json({ 
        reply: getFallbackResponse(message),
        source: 'fallback',
        error: data.error.message
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(message);
    
    res.json({ reply, source: 'gemini' });

  } catch (error) {
    console.error('Chat error:', error);
    res.json({ 
      reply: getFallbackResponse(req.body.message),
      source: 'fallback'
    });
  }
});

// Fallback responses when API is unavailable
function getFallbackResponse(message) {
  const lower = message.toLowerCase();
  
  if (lower.match(/hi|hello|hey|good/)) {
    return "Hello! 👋 I'm FoodBot, your AI assistant. How can I help you today?";
  }
  if (lower.match(/restaurant|best|recommend|suggest|food|eat/)) {
    return "🍽️ We have amazing restaurants! Top picks: Spice Garden (North Indian ⭐4.5), Dragon Wok (Chinese ⭐4.6), Biryani House (Hyderabadi ⭐4.8). Browse all on our home page!";
  }
  if (lower.match(/order|place|how/)) {
    return "📦 To order: 1) Select a restaurant 2) Add items to cart 3) Click 'Place Order' 4) Pay & enjoy! You'll get a confirmation with Order ID.";
  }
  if (lower.match(/track|where|status/)) {
    return "🔍 To track: Login → My Orders → View real-time status. Need help with a specific order? Share your Order ID!";
  }
  if (lower.match(/pay|payment|card|upi/)) {
    return "💳 We accept: Credit/Debit Cards, UPI (GPay, PhonePe), Net Banking, Cash on Delivery. All transactions are secure!";
  }
  if (lower.match(/cancel|refund/)) {
    return "❌ To cancel: My Orders → Select order → Cancel. Orders can only be cancelled before preparation. Refunds take 3-5 business days.";
  }
  if (lower.match(/deliver|time|fast/)) {
    return "🚚 Delivery: 30-45 mins average. Free delivery on orders ₹199+. Live tracking available!";
  }
  if (lower.match(/thank|bye/)) {
    return "You're welcome! 😊 Enjoy your meal! Feel free to ask if you need anything else.";
  }
  
  return "I can help you with restaurant recommendations, ordering, tracking, payments, or delivery info. What would you like to know? 🍕";
}

module.exports = router;
