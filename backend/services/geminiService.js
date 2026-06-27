// Using native fetch for OpenRouter API
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';

// Check if running in mock mode
const isMock = !OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-api-key';

// Helper to generate realistic mock nutrients for Indian hostel food items
const getMockNutrients = (foodText = '') => {
  const parts = foodText.toLowerCase().split(/,| and |&|\+/).map(s => s.trim()).filter(Boolean);
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let iron = 0;
  let estimatedCost = 0;
  const items = [];

  if (parts.length === 0) parts.push('standard hostel meal');

  parts.forEach(part => {
    let matched = false;

    if (part.includes('roti') || part.includes('chapati') || part.includes('paratha') || part.includes('puri') || part.includes('naan')) {
      const count = parseInt((part.match(/\d+/g) || [1])[0]) || 1;
      const name = part.includes('paratha') ? 'Paratha' : part.includes('puri') ? 'Puri' : part.includes('naan') ? 'Naan' : 'Roti';
      calories += count * 150;
      protein += count * 4;
      carbs += count * 25;
      fat += count * 5;
      iron += count * 1.0;
      estimatedCost += count * 15;
      items.push(`${count} ${name}`);
      matched = true;
    }
    else if (part.includes('dal') || part.includes('daal') || part.includes('dhal') || part.includes('pulse') || part.includes('lentil')) {
      calories += 150;
      protein += 8;
      carbs += 22;
      fat += 3;
      iron += 2.2;
      estimatedCost += 20;
      items.push('Dal (Lentil Soup)');
      matched = true;
    }
    else if (part.includes('rice') || part.includes('chawal') || part.includes('biryani') || part.includes('pulao')) {
      calories += 250;
      protein += 5;
      carbs += 50;
      fat += 3;
      iron += 0.8;
      estimatedCost += 40;
      items.push(part.includes('biryani') ? 'Biryani' : 'Rice');
      matched = true;
    }
    else if (part.includes('paneer')) {
      calories += 260;
      protein += 15;
      carbs += 4;
      fat += 21;
      iron += 0.5;
      estimatedCost += 70;
      items.push('Paneer Sabzi');
      matched = true;
    }
    else if (part.includes('chicken') || part.includes('murgh')) {
      calories += 310;
      protein += 26;
      carbs += 5;
      fat += 18;
      iron += 1.3;
      estimatedCost += 90;
      items.push('Chicken Curry');
      matched = true;
    }
    else if (part.includes('egg') || part.includes('anda')) {
      const count = parseInt((part.match(/\d+/g) || [2])[0]) || 2;
      calories += count * 75;
      protein += count * 6;
      carbs += count * 0.6;
      fat += count * 5;
      iron += count * 0.9;
      estimatedCost += count * 8;
      items.push(`${count} Egg(s)`);
      matched = true;
    }
    else if (part.includes('poha')) {
      calories += 250;
      protein += 4;
      carbs += 45;
      fat += 6;
      iron += 2.5;
      estimatedCost += 25;
      items.push('Poha');
      matched = true;
    }
    else if (part.includes('chole') || part.includes('chana') || part.includes('rajma')) {
      calories += 220;
      protein += 10;
      carbs += 35;
      fat += 4;
      iron += 3.0;
      estimatedCost += 30;
      items.push(part.includes('rajma') ? 'Rajma' : 'Chole (Chickpea Curry)');
      matched = true;
    }
    else if (part.includes('sabzi') || part.includes('aloo') || part.includes('bhindi')) {
      calories += 180;
      protein += 3;
      carbs += 20;
      fat += 10;
      iron += 1.5;
      estimatedCost += 25;
      items.push('Vegetable Sabzi');
      matched = true;
    }
    else if (part.includes('sweet') || part.includes('gulab') || part.includes('jamun') || part.includes('jalebi') || part.includes('rasgulla')) {
      calories += 300;
      protein += 3;
      carbs += 55;
      fat += 12;
      iron += 0.5;
      estimatedCost += 40;
      items.push('Indian Sweet / Dessert');
      matched = true;
    }
    else if (part.includes('maggi') || part.includes('noodles')) {
      calories += 380;
      protein += 8;
      carbs += 58;
      fat += 14;
      iron += 1.8;
      estimatedCost += 20;
      items.push('Instant Noodles');
      matched = true;
    }

    if (!matched) {
      // For any unrecognized item separated by a comma, give it generic values
      calories += 150;
      protein += 4;
      carbs += 20;
      fat += 5;
      iron += 0.5;
      estimatedCost += 25;
      // Capitalize the unknown part
      items.push(part.charAt(0).toUpperCase() + part.slice(1));
    }
  });

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
 */
const analyzeTextMeal = async (foodText) => {
  if (isMock) {
    console.log('⚠️ [Demo Mock Mode] Analyzing text meal locally:', foodText);
    return getMockNutrients(foodText);
  }

  try {
    const prompt = `You are a nutrition expert specializing in Indian cuisine. Analyze this Indian hostel food and return ONLY a valid JSON object (no markdown, no code blocks). The input may contain multiple comma-separated items and Hindi/regional terms (e.g., 'poha', 'daal', 'chawal', 'roti', 'sabzi'). You MUST identify and extract every single food item mentioned accurately. Food: "${foodText}". Return: { "calories": number, "protein": number (grams), "carbs": number (grams), "fat": number (grams), "iron": number (mg), "estimatedCost": number (INR), "items": ["item1", "item2"] }. Be realistic about portion sizes for a college student.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenRouter API');
    }

    const text = data.choices[0].message.content;
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    console.log('🍽️  Text meal analyzed:', parsed.items);
    return parsed;
  } catch (error) {
    console.error('❌ OpenRouter text analysis error, falling back to mock:', error.message);
    return getMockNutrients(foodText);
  }
};

/**
 * Analyze a food image and return estimated nutrients.
 */
const analyzeImageMeal = async (imageBuffer, mimeType) => {
  if (isMock) {
    console.log('⚠️ [Demo Mock Mode] Analyzing image meal locally');
    return getMockNutrients('Uploaded food image');
  }

  try {
    const prompt = `You are a nutrition expert. Look closely at this image. IF THE IMAGE DOES NOT CONTAIN FOOD: Return exactly { "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "iron": 0, "estimatedCost": 0, "items": [], "description": "No food detected in the image" } and nothing else. IF IT IS FOOD: 1) Identify ALL food items visible. 2) Estimate quantities. 3) Calculate approximate nutrients. Return ONLY valid JSON: { "calories": number, "protein": number, "carbs": number, "fat": number, "iron": number, "estimatedCost": number, "items": ["item1", "item2"], "description": "brief description" }. Assume Indian hostel context.`;
    const base64Data = imageBuffer.toString('base64');
    const imageUrl = `data:${mimeType};base64,${base64Data}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenRouter API');
    }

    const text = data.choices[0].message.content;
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    console.log('📸 Image meal analyzed:', parsed.items);
    return parsed;
  } catch (error) {
    console.error('❌ OpenRouter image analysis error, falling back to mock:', error.message);
    return getMockNutrients('Uploaded food image');
  }
};

module.exports = { analyzeTextMeal, analyzeImageMeal };
