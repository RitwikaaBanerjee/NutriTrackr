const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if running in mock mode
const isMock = !process.env.GEMINI_API_KEY || 
               process.env.GEMINI_API_KEY === 'your-gemini-api-key';

// Helper to generate realistic mock nutrients for Indian hostel food items
const getMockNutrients = (foodText = '') => {
  const text = foodText.toLowerCase();
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let iron = 0;
  let estimatedCost = 0;
  const items = [];

  if (text.includes('roti') || text.includes('chapati')) {
    const count = (text.match(/\d+/g) || [2])[0];
    const rotis = parseInt(count) || 2;
    calories += rotis * 120;
    protein += rotis * 3;
    carbs += rotis * 22;
    fat += rotis * 1;
    iron += rotis * 0.8;
    estimatedCost += rotis * 7;
    items.push(`${rotis} Roti`);
  }
  if (text.includes('dal') || text.includes('pulse') || text.includes('lentil')) {
    calories += 150;
    protein += 8;
    carbs += 22;
    fat += 3;
    iron += 2.2;
    estimatedCost += 20;
    items.push('Dal (Lentil Soup)');
  }
  if (text.includes('rice') || text.includes('chawal')) {
    calories += 200;
    protein += 4;
    carbs += 44;
    fat += 0.5;
    iron += 0.4;
    estimatedCost += 15;
    items.push('Steamed Rice');
  }
  if (text.includes('paneer')) {
    calories += 260;
    protein += 15;
    carbs += 4;
    fat += 21;
    iron += 0.5;
    estimatedCost += 70;
    items.push('Paneer Sabzi');
  }
  if (text.includes('chicken') || text.includes('murgh')) {
    calories += 310;
    protein += 26;
    carbs += 5;
    fat += 18;
    iron += 1.3;
    estimatedCost += 90;
    items.push('Chicken Curry');
  }
  if (text.includes('egg') || text.includes('anda')) {
    const count = parseInt((text.match(/\d+/g) || [2])[0]) || 2;
    calories += count * 75;
    protein += count * 6;
    carbs += count * 0.6;
    fat += count * 5;
    iron += count * 0.9;
    estimatedCost += count * 8;
    items.push(`${count} Egg(s)`);
  }
  if (text.includes('maggi') || text.includes('noodles') || text.includes('ramen')) {
    calories += 380;
    protein += 8;
    carbs += 58;
    fat += 14;
    iron += 1.8;
    estimatedCost += 20;
    items.push('Maggi Instant Noodles');
  }
  if (text.includes('chai') || text.includes('tea')) {
    calories += 60;
    protein += 1;
    carbs += 10;
    fat += 2;
    iron += 0.1;
    estimatedCost += 10;
    items.push('Chai (Indian Tea)');
  }
  if (text.includes('coffee')) {
    calories += 80;
    protein += 1.5;
    carbs += 12;
    fat += 2.5;
    iron += 0.1;
    estimatedCost += 15;
    items.push('Coffee');
  }
  if (text.includes('milk') || text.includes('doodh')) {
    calories += 150;
    protein += 8;
    carbs += 12;
    fat += 8;
    iron += 0.1;
    estimatedCost += 25;
    items.push('1 Glass of Milk');
  }
  if (text.includes('apple') || text.includes('seb')) {
    calories += 95;
    protein += 0.5;
    carbs += 25;
    fat += 0.3;
    iron += 0.2;
    estimatedCost += 20;
    items.push('Apple');
  }
  if (text.includes('banana') || text.includes('kela')) {
    calories += 105;
    protein += 1.3;
    carbs += 27;
    fat += 0.4;
    iron += 0.3;
    estimatedCost += 10;
    items.push('Banana');
  }
  if (text.includes('sandwich') || text.includes('bread')) {
    calories += 250;
    protein += 7;
    carbs += 32;
    fat += 10;
    iron += 1.1;
    estimatedCost += 30;
    items.push('Vegetable Sandwich');
  }
  if (text.includes('samosa')) {
    const count = parseInt((text.match(/\d+/g) || [1])[0]) || 1;
    calories += count * 260;
    protein += count * 4;
    carbs += count * 32;
    fat += count * 13;
    iron += count * 0.9;
    estimatedCost += count * 12;
    items.push(`${count} Samosa`);
  }

  if (items.length === 0) {
    calories = 320;
    protein = 8;
    carbs = 42;
    fat = 10;
    iron = 1.0;
    estimatedCost = 35;
    items.push(foodText || 'Standard Hostel Meal');
  }

  return {
    calories,
    protein: parseFloat(protein.toFixed(1)),
    carbs: parseFloat(carbs.toFixed(1)),
    fat: parseFloat(fat.toFixed(1)),
    iron: parseFloat(iron.toFixed(1)),
    estimatedCost,
    items,
    description: `[Demo Mock Mode] Analyzed: ${foodText || 'Standard Hostel Meal'}`
  };
};

/**
 * Analyze a text description of food and return estimated nutrients.
 *
 * @param {string} foodText - A natural-language description of the meal
 *                            e.g. "2 chapati, dal, rice, sabzi"
 * @returns {Object} Parsed nutrient data from Gemini
 */
const analyzeTextMeal = async (foodText) => {
  if (isMock) {
    console.log('⚠️ [Demo Mock Mode] Analyzing text meal locally:', foodText);
    return getMockNutrients(foodText);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a nutrition expert. Analyze this Indian hostel food and return ONLY a valid JSON object (no markdown, no code blocks). Food: "${foodText}". Return: { "calories": number, "protein": number (grams), "carbs": number (grams), "fat": number (grams), "iron": number (mg), "estimatedCost": number (INR), "items": ["item1", "item2"] }. Be realistic about portion sizes for a college student.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    console.log('🍽️  Text meal analyzed:', parsed.items);
    return parsed;
  } catch (error) {
    console.error('❌ Gemini text analysis error, falling back to mock:', error.message);
    return getMockNutrients(foodText);
  }
};

/**
 * Analyze a food image and return estimated nutrients.
 *
 * @param {Buffer} imageBuffer - The raw image data
 * @param {string} mimeType   - MIME type of the image (e.g. "image/jpeg")
 * @returns {Object} Parsed nutrient data from Gemini
 */
const analyzeImageMeal = async (imageBuffer, mimeType) => {
  if (isMock) {
    console.log('⚠️ [Demo Mock Mode] Analyzing image meal locally');
    return getMockNutrients('Uploaded food image');
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a nutrition expert. Look at this food image and: 1) Identify all food items visible 2) Estimate quantities 3) Calculate approximate nutrients. Return ONLY valid JSON (no markdown): { "calories": number, "protein": number (grams), "carbs": number (grams), "fat": number (grams), "iron": number (mg), "estimatedCost": number (INR), "items": ["item1", "item2"], "description": "brief description of food" }. Assume Indian hostel context.`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    console.log('📸 Image meal analyzed:', parsed.items);
    return parsed;
  } catch (error) {
    console.error('❌ Gemini image analysis error, falling back to mock:', error.message);
    return getMockNutrients('Uploaded food image');
  }
};

module.exports = { analyzeTextMeal, analyzeImageMeal };
