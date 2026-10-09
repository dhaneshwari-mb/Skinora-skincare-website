/* ==========================================================================
   SKINORA — PERSONALIZED SKINCARE INTELLIGENCE ENGINE & COMPANION
   ========================================================================== */

// 1. CONFIGURATION & SECURITY NOTE
const CONFIG = {
    // Developer note: Never expose production Gemini API keys in client-side code!
    // Move requests to a backend or serverless function before production.
    GEMINI_API_KEY: "YOUR_GEMINI_API_KEY",
    GEMINI_MODEL: "gemini-1.5-flash",
    STORAGE_KEYS: {
        PROFILE: "skinora_profile",
        ROUTINE: "skinora_routine",
        HYDRATION: "skinora_hydration",
        JOURNAL: "skinora_journal",
        FAVORITES: "skinora_favorites",
        STREAK: "skinora_streak",
        THEME: "skinora_theme",
        SETTINGS: "skinora_settings"
    }
};

// 2. GLOBAL APP STATE
const AppState = {
    profile: null,
    aiPlan: null,
    hydration: { today: 0, goal: 2.5, history: {} },
    routineCompleted: { morning: {}, night: {}, date: "" },
    streak: { count: 0, lastActiveDate: "", milestonesUnlocked: [] },
    journal: [],
    favorites: { ingredients: [], products: [], articles: [] },
    theme: "light",
    currentView: "landing",
    activeInsightIndex: 0
};

// 3. DATABASES: INGREDIENTS, PRODUCTS, ARTICLES & INSIGHTS

const INGREDIENTS_DB = [
    {
        id: "niacinamide",
        name: "Niacinamide (Vitamin B3)",
        category: "Acne / Oil",
        categoryKey: "Acne / Oil",
        summary: "Versatile water-soluble vitamin that balances sebum, shrinks appearance of pores, and strengthens skin barrier.",
        usedFor: "Oil balance, pore appearance, uneven skin tone, barrier support",
        goodFor: "Oily, Combination, Normal, Sensitive skin",
        howToUse: "Apply 2-5% concentration morning or evening before heavier creams.",
        considerations: "Rarely causes irritation. Avoid mixing in high concentrations with pure L-Ascorbic Acid.",
        note: "SKINORA NOTE: Niacinamide is one of the safest multi-tasking actives for all skin types."
    },
    {
        id: "hyaluronic-acid",
        name: "Hyaluronic Acid",
        category: "Hydration",
        categoryKey: "Hydration",
        summary: "Powerful humectant capable of holding up to 1,000 times its weight in water to plump dehydration lines.",
        usedFor: "Deep hydration, plumpness, smoothing fine dehydration lines",
        goodFor: "All skin types (Dry, Dehydrated, Oily, Combination, Sensitive)",
        howToUse: "Apply to damp skin after cleansing, then seal in with a moisturizer.",
        considerations: "In dry climates, always lock with an occlusive moisturizer to prevent water loss.",
        note: "SKINORA NOTE: Best applied on damp skin right out of the shower!"
    },
    {
        id: "ceramides",
        name: "Ceramides (NP, AP, EOP)",
        category: "Barrier Repair",
        categoryKey: "Barrier Repair",
        summary: "Lipids naturally found in skin that reinforce the intercellular lipid matrix and lock in hydration.",
        usedFor: "Barrier restoration, moisture locking, reducing redness and stinging",
        goodFor: "Dry, Sensitive, Compromised, Normal skin",
        howToUse: "Found in rich barrier cream formulations; use twice daily.",
        considerations: "Extremely gentle and non-comedogenic when formulated correctly.",
        note: "SKINORA NOTE: Essential when using exfoliating acids or retinoids."
    },
    {
        id: "vitamin-c",
        name: "Vitamin C (L-Ascorbic Acid)",
        category: "Brightening",
        categoryKey: "Brightening",
        summary: "Potent antioxidant that neutralizes free radicals, fades dark spots, and boosts collagen synthesis.",
        usedFor: "Hyperpigmentation, dullness, antioxidant protection, collagen support",
        goodFor: "Normal, Combination, Oily skin (Gentler derivatives for Sensitive)",
        howToUse: "Apply in the morning on clean skin before sunscreen.",
        considerations: "Store in a cool, dark place to prevent oxidation (turning brown).",
        note: "SKINORA NOTE: Synergizes with Sunscreen for maximum daily UV protection."
    },
    {
        id: "salicylic-acid",
        name: "Salicylic Acid (BHA)",
        category: "Acne / Oil",
        categoryKey: "Acne / Oil",
        summary: "Oil-soluble beta hydroxy acid that penetrates deep into pores to dissolve sebum, blackheads, and dead skin cells.",
        usedFor: "Blackheads, clogged pores, active acne, excess sebum",
        goodFor: "Oily, Combination, Acne-prone skin",
        howToUse: "Use 1-3 times a week at night. Follow with hydrating serum and moisturizer.",
        considerations: "Can dry out skin if overused. Avoid mixing with retinol on the same night.",
        note: "SKINORA NOTE: The gold standard active for clearing stubborn blackheads."
    },
    {
        id: "azelaic-acid",
        name: "Azelaic Acid",
        category: "Calming",
        categoryKey: "Calming",
        summary: "Dermatologist-favorite active that gently targets rosacea redness, post-acne dark marks, and inflammation.",
        usedFor: "Redness, rosacea, post-inflammatory hyperpigmentation (PIH), mild breakouts",
        goodFor: "Sensitive, Redness-prone, Acne-prone, Combination skin",
        howToUse: "Apply 10% OTC concentration after cleansing morning or night.",
        considerations: "May cause mild initial tingling; highly tolerated compared to other acids.",
        note: "SKINORA NOTE: Exceptional for fading dark marks left behind by acne."
    },
    {
        id: "retinol",
        name: "Retinol / Retinoids",
        category: "Anti-Aging",
        categoryKey: "Anti-Aging",
        summary: "Gold-standard Vitamin A derivative that speeds cellular turnover, boosts collagen, and smooths texture.",
        usedFor: "Fine lines, texture renewal, firming, acne prevention",
        goodFor: "Normal, Combination, Oily, Aging skin (Caution for Sensitive)",
        howToUse: "Apply pea-sized amount at night on completely dry skin. Start 2x/week.",
        considerations: "Requires strict morning sunscreen use. May cause initial purging or flaking.",
        note: "SKINORA NOTE: Introduce slowly using the sandwich method (Moisturizer - Retinol - Moisturizer)."
    },
    {
        id: "centella-asiatica",
        name: "Centella Asiatica (Cica / Madecassoside)",
        category: "Calming",
        categoryKey: "Calming",
        summary: "Traditional botanical herb renowned for soothing irritation, accelerating wound recovery, and calming inflammation.",
        usedFor: "Redness relief, barrier soothing, repairing compromised skin",
        goodFor: "Sensitive, Reactive, Acne-prone, Inflamed skin",
        howToUse: "Can be used morning and night in serums or cica balms.",
        considerations: "Exceptionally gentle with virtually no known contraindications.",
        note: "SKINORA NOTE: Your emergency rescue active when your skin barrier feels stinging!"
    },
    {
        id: "squalane",
        name: "Plant-Derived Squalane",
        category: "Hydration",
        categoryKey: "Hydration",
        summary: "Lightweight, non-greasy lipid that mimics natural skin sebum to lock moisture without clogging pores.",
        usedFor: "Non-comedogenic hydration, softening texture, sealing moisture",
        goodFor: "All skin types, including Oily and Acne-prone",
        howToUse: "Apply 2-3 drops as the last step in your night routine.",
        considerations: "Look for 100% sugarcane-derived squalane.",
        note: "SKINORA NOTE: Feels like a luxury facial oil but never clogs pores."
    },
    {
        id: "peptides",
        name: "Signal Peptides (Matrixyl, Copper Peptides)",
        category: "Anti-Aging",
        categoryKey: "Anti-Aging",
        summary: "Short chains of amino acids that signal skin cells to build collagen and elastin proteins.",
        usedFor: "Skin elasticity, firmness, fine lines, barrier repair",
        goodFor: "All skin types, mature skin, sensitive skin needing repair",
        howToUse: "Apply serum morning or evening before heavier creams.",
        considerations: "Avoid combining direct copper peptides with strong direct acids (AHA/BHA).",
        note: "SKINORA NOTE: A gentle, non-irritating alternative to retinol for firming."
    }
];

const PRODUCTS_DB = [
    {
        id: "p1",
        name: "Purifying Gentle Foaming Cleanser",
        brand: "SKINORA Labs",
        category: "Cleanser",
        skinType: "Oily, Combination",
        ingredients: ["Niacinamide", "Zinc PCA", "Centella Asiatica"],
        description: "A pH-balanced foaming gel that removes excess sebum without stripping the skin's natural moisture barrier.",
        whyRecommend: "Formulated specifically to dissolve oil while keeping skin calm and hydrated."
    },
    {
        id: "p2",
        name: "Hydra-Plump Hyaluronic Serum 2%",
        brand: "SKINORA Labs",
        category: "Serum",
        skinType: "All Skin Types",
        ingredients: ["Hyaluronic Acid", "Panthenol", "Glycerin"],
        description: "Multi-weight hyaluronic acid complex that penetrates multiple epidermal layers for instant plumpness.",
        whyRecommend: "Delivers deep hydration without weight or stickiness."
    },
    {
        id: "p3",
        name: "Ceramide Barrier Restoration Cream",
        brand: "SKINORA Labs",
        category: "Moisturizer",
        skinType: "Dry, Sensitive, Normal",
        ingredients: ["Ceramides", "Squalane", "Centella Asiatica"],
        description: "Rich, cocooning cream enriched with 3 essential ceramides and plant squalane to repair damaged barriers.",
        whyRecommend: "Provides 24-hour hydration lock and calms redness immediately."
    },
    {
        id: "p4",
        name: "Invisible Fluid Sunscreen SPF 50+",
        brand: "SKINORA Labs",
        category: "Sunscreen",
        skinType: "All Skin Types",
        ingredients: ["Niacinamide", "Vitamin E", "Centella"],
        description: "Ultra-lightweight broad-spectrum daily fluid with zero white cast and a natural satin finish.",
        whyRecommend: "Daily UV protection enriched with antioxidant protection."
    },
    {
        id: "p5",
        name: "BHA Pore Refining 2% Solution",
        brand: "SKINORA Labs",
        category: "Treatment",
        skinType: "Oily, Combination",
        ingredients: ["Salicylic Acid", "Green Tea Extract", "Azelaic Acid"],
        description: "Leave-on liquid exfoliant that clears blackheads, reduces breakouts, and refines pore texture.",
        whyRecommend: "Targets stubborn pore congestion gently without flaking."
    }
];

const ARTICLES_DB = [
    {
        id: "art-1",
        title: "Understanding Your Skin Barrier: The Moisture Shield",
        category: "basics",
        categoryName: "Skin Basics",
        readTime: "4 min read",
        summary: "Learn what the stratum corneum is and how ceramides protect your skin from redness, breakouts, and dryness.",
        content: `
      <h2>What is the Skin Barrier?</h2>
      <p>Your skin barrier (stratum corneum) acts as your body's outer protective shield. It operates like a brick wall where skin cells (corneocytes) are the bricks and lipids (ceramides, cholesterol, fatty acids) are the mortar.</p>
      
      <h2>Signs Your Barrier is Compromised</h2>
      <ul>
        <li>Stinging or burning when applying gentle moisturizers</li>
        <li>Persistent tightness despite applying creams</li>
        <li>Flaking, redness, or unexpected sudden breakouts</li>
      </ul>

      <h2>How to Repair It</h2>
      <p>Simplify your routine to 3 core steps: a gentle fragrance-free cleanser, a ceramide-rich barrier cream, and daily broad-spectrum sunscreen. Pause all active exfoliating acids and retinoids for 2 weeks.</p>
    `
    },
    {
        id: "art-2",
        title: "How to Layer Skincare Actives Correctly",
        category: "routine",
        categoryName: "Routine Masterclass",
        readTime: "5 min read",
        summary: "Master the rule of thin-to-thick viscosity and avoid ingredient conflicts like Retinol + AHA/BHA.",
        content: `
      <h2>The Golden Rule of Layering</h2>
      <p>Always apply products from thinnest consistency to thickest consistency: Cleanser ➔ Toner/Essence ➔ Water Serums ➔ Oil Serums ➔ Moisturizer ➔ Sunscreen (AM) or Facial Oil (PM).</p>

      <h2>Actives Combinations to Avoid</h2>
      <ul>
        <li><strong>Retinol + Strong AHA/BHA:</strong> Can cause severe peeling and barrier rupture. Use on alternate nights!</li>
        <li><strong>Vitamin C + Salicylic Acid:</strong> Can over-acidify skin causing redness. Use Vitamin C AM, Salicylic PM.</li>
      </ul>
    `
    },
    {
        id: "art-3",
        title: "The Science of Daily Sun Protection",
        category: "lifestyle",
        categoryName: "Lifestyle & Glow",
        readTime: "3 min read",
        summary: "Why UVA rays age your skin through window glass and how daily SPF prevents hyperpigmentation.",
        content: `
      <h2>UVA vs UVB Rays</h2>
      <p><strong>UVB (Burning):</strong> Causes sunburns on the surface.<br><strong>UVA (Aging):</strong> Penetrates deep into the dermis, breaking down collagen and causing dark spots. UVA rays penetrate clouds and window glass!</p>
      
      <h2>Application Amount</h2>
      <p>Use the two-finger rule (index and middle finger lines of sunscreen) for face and neck coverage every morning.</p>
    `
    }
];

const INSIGHTS_LIST = [
    { title: "Consistency Beats Intensity", text: "Gentle daily maintenance yields far better skin barrier health than aggressive weekly peels.", tag: "Barrier Health" },
    { title: "Apply Hydrators to Damp Skin", text: "Hyaluronic acid works best when applied immediately after cleansing on moist skin to lock in hydration.", tag: "Hydration Tip" },
    { title: "Sunscreen is Your #1 Anti-Aging Active", text: "Up to 80% of visible premature skin aging is caused by daily indoor and outdoor UVA radiation.", tag: "UV Protection" },
    { title: "Listen to Skin Stinging", text: "If your usual moisturizer stings upon application, your skin barrier is compromised. Pause active acids for 5-7 days.", tag: "Safety Warning" },
    { title: "Sleep Restores Cell Turnover", text: "During deep sleep cycles, skin blood flow increases and collagen repair accelerates.", tag: "Lifestyle" }
];

// 4. LOCAL SKINCARE RECOMMENDATION ENGINE (FALLBACK INTELLIGENCE)
function generateLocalSkincarePlan(profile) {
    const skinType = profile.skinType || "Normal";
    const concerns = profile.concerns || [];

    let morningRoutine = [];
    let nightRoutine = [];
    let suggestedIngredients = [];
    let avoidIngredients = [];
    let lifestyleTips = [];
    let balanceScore = 85;

    // BASE ROUTINE GENERATION BY SKIN TYPE
    if (skinType === "Oily" || skinType === "Combination") {
        morningRoutine = [
            { step: "01", category: "Cleanser", name: "Purifying Gentle Foaming Gel Cleanser", purpose: "Removes excess overnight sebum without stripping natural lipids.", ingredient: "Zinc PCA & Niacinamide", why: "Balances oil production and leaves skin fresh." },
            { step: "02", category: "Serum", name: "Niacinamide 5% Pore Refining Serum", purpose: "Regulates sebum excretion and visibly tightens pore walls.", ingredient: "Niacinamide", why: "Prevents clogged pores throughout the day." },
            { step: "03", category: "Moisturizer", name: "Lightweight Oil-Free Gel Moisturizer", purpose: "Provides essential water hydration without heavy occlusives.", ingredient: "Hyaluronic Acid & Panthenol", why: "Keeps skin bouncy without greasy shine." },
            { step: "04", category: "Sunscreen", name: "Fluid SPF 50+ Sunscreen", purpose: "Broad-spectrum UV protection with a matte finish.", ingredient: "Vitamin E", why: "Protects against UV hyperpigmentation." }
        ];

        nightRoutine = [
            { step: "01", category: "Cleanser", name: "Gentle Foaming Cleanser", purpose: "Double cleanse to remove daily pollutants and SPF.", ingredient: "Centella Asiatica", why: "Calms evening inflammation." },
            { step: "02", category: "Treatment", name: "Salicylic Acid 2% Liquid Exfoliant (2-3x / wk)", purpose: "Dissolves pore congestion and blackheads deep inside pores.", ingredient: "Salicylic Acid (BHA)", why: "Targeted acne and blackhead treatment." },
            { step: "03", category: "Moisturizer", name: "Barrier Support Gel Cream", purpose: "Restores hydration overnight.", ingredient: "Ceramides & Squalane", why: "Maintains skin barrier repair during sleep." }
        ];

        suggestedIngredients = ["Niacinamide", "Salicylic Acid (BHA)", "Hyaluronic Acid", "Zinc PCA", "Centella Asiatica"];
        avoidIngredients = ["Heavy Coconut Oil", "Pure Cocoa Butter", "High-alcohol toners", "Harsh walnut scrubs"];
    } else if (skinType === "Dry" || skinType === "Sensitive") {
        morningRoutine = [
            { step: "01", category: "Cleanser", name: "Hydrating Cream Cleanser", purpose: "Cleanses delicately while respecting natural skin lipid lipids.", ingredient: "Glycerin & Ceramides", why: "Prevents morning tightness." },
            { step: "02", category: "Serum", name: "Multi-Depth Hyaluronic Acid Serum", purpose: "Draws water deep into dehydrated skin layers.", ingredient: "Hyaluronic Acid", why: "Plumps dryness lines immediately." },
            { step: "03", category: "Moisturizer", name: "Rich Ceramide Barrier Repair Cream", purpose: "Locks in hydration with essential skin lipids.", ingredient: "Ceramides NP & Plant Squalane", why: "Seals moisture all day long." },
            { step: "04", category: "Sunscreen", name: "Hydrating Mineral/Fluid Sunscreen SPF 50+", purpose: "Comfortable UV shield with zero sting.", ingredient: "Centella & Zinc Oxide", why: "Shields delicate skin from solar irritation." }
        ];

        nightRoutine = [
            { step: "01", category: "Cleanser", name: "Nourishing Cleansing Milk", purpose: "Removes impurities gently without stripping.", ingredient: "Panthenol", why: "Leaves skin soft and supple." },
            { step: "02", category: "Treatment / Serum", name: "Soothe Cica Repair Essence", purpose: "Calms redness and repairs micro-cracks in skin barrier.", ingredient: "Centella Asiatica & Azelaic Acid", why: "Relieves sensitivity overnight." },
            { step: "03", category: "Moisturizer", name: "Deep Recovery Overnight Balm", purpose: "Intense moisture seal during restorative sleep.", ingredient: "Ceramides & Squalane", why: "Wakes up soft, non-flaky skin." }
        ];

        suggestedIngredients = ["Ceramides", "Hyaluronic Acid", "Centella Asiatica", "Squalane", "Azelaic Acid", "Panthenol"];
        avoidIngredients = ["High percentage Glycolic Acid", "Fragrance / Essential Oils", "Harsh foaming sulfates (SLS)", "Physical gritty scrubs"];
    } else {
        // Normal / Combination maintenance
        morningRoutine = [
            { step: "01", category: "Cleanser", name: "Balanced Gentle Cleanser", purpose: "Refreshes skin for the day.", ingredient: "Glycerin", why: "Maintains optimal pH." },
            { step: "02", category: "Serum", name: "Vitamin C Antioxidant Glow Serum", purpose: "Brightens skin tone and fights daily oxidative stress.", ingredient: "Vitamin C", why: "Boosts daytime radiance." },
            { step: "03", category: "Moisturizer", name: "Daily Balance Lotion", purpose: "Lightweight hydration.", ingredient: "Hyaluronic Acid", why: "Smooth, balanced canvas." },
            { step: "04", category: "Sunscreen", name: "Broad Spectrum Fluid SPF 50+", purpose: "Daily sun protection.", ingredient: "Niacinamide", why: "Prevents sun spots." }
        ];

        nightRoutine = [
            { step: "01", category: "Cleanser", name: "Gentle Cleanser", purpose: "Removes daily sunscreen and grime.", ingredient: "Centella", why: "Clean skin base." },
            { step: "02", category: "Serum", name: "Niacinamide 5% Barrier Serum", purpose: "Refines texture and balances skin tone.", ingredient: "Niacinamide", why: "Promotes smooth skin." },
            { step: "03", category: "Moisturizer", name: "Hydrating Night Cream", purpose: "Nourishes overnight.", ingredient: "Ceramides", why: "Barrier maintenance." }
        ];

        suggestedIngredients = ["Niacinamide", "Hyaluronic Acid", "Vitamin C", "Ceramides"];
        avoidIngredients = ["Over-exfoliating with multiple acids simultaneously"];
    }

    // Adjust balance score based on concerns
    if (concerns.includes("Acne / Breakouts")) balanceScore -= 5;
    if (concerns.includes("Redness") || concerns.includes("Sensitivity")) balanceScore -= 5;
    if (profile.lifestyle && profile.lifestyle.water < 2.0) balanceScore -= 5;

    return {
        summary: `Based on your self-reported ${skinType} skin profile and concerns (${concerns.join(", ") || "General Maintenance"}), SKINORA has generated a conservative, barrier-first skincare ritual. Focus on consistent hydration, targeted gentle actives, and daily SPF protection.`,
        skinType: skinType,
        concerns: concerns,
        morningRoutine: morningRoutine,
        nightRoutine: nightRoutine,
        ingredients: suggestedIngredients,
        avoid: avoidIngredients,
        lifestyleTips: [
            { title: "Hydration Target", desc: `Aim for at least ${profile.lifestyle ? profile.lifestyle.water : 2.5}L of water daily to support intracellular hydration.` },
            { title: "Sleep Restoration", desc: "Ensure 7-8 hours of quality sleep to optimize overnight dermal cellular repair." },
            { title: "Sun Protection First", desc: "Apply sunscreen every single morning regardless of indoor or cloud cover." }
        ],
        dermatologistNote: "This is general skincare guidance, not a medical diagnosis. For severe, painful, rapidly worsening, or persistent skin problems, consult a board-certified dermatologist.",
        balanceScore: Math.max(70, balanceScore)
    };
}

// 5. GEMINI AI API INTEGRATION WITH FALLBACK
async function fetchGeminiSkinPlan(profile) {
    const apiKey = (AppState.settings && AppState.settings.geminiKey) || CONFIG.GEMINI_API_KEY;

    // Fallback if no valid key set
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.trim() === "") {
        console.log("Using SKINORA Curated Intelligence Engine (No Gemini API Key provided).");
        return generateLocalSkincarePlan(profile);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const promptText = `
You are a dermatologist-informed skincare education assistant for SKINORA.
Based on the following user self-reported profile:
- Skin Type: ${profile.skinType}
- Target Concerns: ${profile.concerns.join(", ")}
- Lifestyle: Water intake ${profile.lifestyle.water}L, Sleep: ${profile.lifestyle.sleep}, Stress: ${profile.lifestyle.stress}, Sun exposure: ${profile.lifestyle.sun}
- Habits: Current products: ${profile.habits.products.join(", ")}, Exfoliation: ${profile.habits.exfoliation}, Night consistency: ${profile.habits.consistency}

Provide a structured, conservative skincare routine in JSON format. Do not claim to cure medical diseases.
Format your response ONLY as valid raw JSON with NO markdown code block wrappers (no backticks):
{
  "summary": "2-3 sentences overview of strategy",
  "skinType": "${profile.skinType}",
  "concerns": ${JSON.stringify(profile.concerns)},
  "morningRoutine": [
    { "step": "01", "category": "Cleanser", "name": "...", "purpose": "...", "ingredient": "...", "why": "..." }
  ],
  "nightRoutine": [
    { "step": "01", "category": "Cleanser", "name": "...", "purpose": "...", "ingredient": "...", "why": "..." }
  ],
  "ingredients": ["Suggested active 1", "Suggested active 2"],
  "avoid": ["Ingredient to avoid 1", "Ingredient to avoid 2"],
  "lifestyleTips": [
    { "title": "...", "desc": "..." }
  ],
  "dermatologistNote": "This is general skincare information, not a medical diagnosis. For persistent or severe problems, consult a qualified dermatologist.",
  "balanceScore": 88
}
  `;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini HTTP error ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Clean JSON response string if wrapped in markdown
        const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedData = JSON.parse(cleanedText);

        // Validate required fields
        if (!parsedData.morningRoutine || !parsedData.nightRoutine) {
            throw new Error("Invalid structured JSON schema returned from AI.");
        }

        showToast("Gemini AI plan generated successfully!", "success");
        return parsedData;

    } catch (error) {
        console.warn("Gemini AI fetch failed or key invalid. Falling back to local intelligence engine:", error.message);
        showToast("Using SKINORA's curated skincare guidance.", "info");
        return generateLocalSkincarePlan(profile);
    }
}

// ==========================================================================
// 6. PERSISTENCE & LOCAL STORAGE MANAGEMENT
// ==========================================================================
function loadStateFromStorage() {
    try {
        const todayStr = new Date().toISOString().split("T")[0];

        const savedProfile = localStorage.getItem(CONFIG.STORAGE_KEYS.PROFILE);
        if (savedProfile) AppState.profile = JSON.parse(savedProfile);

        const savedRoutine = localStorage.getItem(CONFIG.STORAGE_KEYS.ROUTINE);
        if (savedRoutine) AppState.aiPlan = JSON.parse(savedRoutine);

        const savedHydration = localStorage.getItem(CONFIG.STORAGE_KEYS.HYDRATION);
        if (savedHydration) {
            const parsed = JSON.parse(savedHydration);
            AppState.hydration.goal = parsed.goal || 2.5;
            AppState.hydration.history = parsed.history || {};
            AppState.hydration.today = AppState.hydration.history[todayStr] || 0;
        }

        const savedTracker = localStorage.getItem(CONFIG.STORAGE_KEYS.STREAK);
        if (savedTracker) {
            AppState.streak = JSON.parse(savedTracker);
        }

        const savedJournal = localStorage.getItem(CONFIG.STORAGE_KEYS.JOURNAL);
        if (savedJournal) AppState.journal = JSON.parse(savedJournal);

        const savedFavs = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES);
        if (savedFavs) AppState.favorites = JSON.parse(savedFavs);

        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
        if (savedTheme) AppState.theme = savedTheme;

        const savedSettings = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
        if (savedSettings) AppState.settings = JSON.parse(savedSettings);

    } catch (e) {
        console.error("Error loading localStorage:", e);
    }
}

function saveStateToStorage() {
    try {
        const todayStr = new Date().toISOString().split("T")[0];
        if (AppState.profile) localStorage.setItem(CONFIG.STORAGE_KEYS.PROFILE, JSON.stringify(AppState.profile));
        if (AppState.aiPlan) localStorage.setItem(CONFIG.STORAGE_KEYS.ROUTINE, JSON.stringify(AppState.aiPlan));

        AppState.hydration.history[todayStr] = AppState.hydration.today;
        localStorage.setItem(CONFIG.STORAGE_KEYS.HYDRATION, JSON.stringify({
            goal: AppState.hydration.goal,
            history: AppState.hydration.history
        }));

        localStorage.setItem(CONFIG.STORAGE_KEYS.STREAK, JSON.stringify(AppState.streak));
        localStorage.setItem(CONFIG.STORAGE_KEYS.JOURNAL, JSON.stringify(AppState.journal));
        localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(AppState.favorites));
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, AppState.theme);
        if (AppState.settings) localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(AppState.settings));
    } catch (e) {
        console.error("Error saving state:", e);
    }
}

// ==========================================================================
// 7. ROUTER & NAVIGATION CONTROLLER
// ==========================================================================
function navigateTo(viewId) {
    AppState.currentView = viewId;

    // Close mobile drawer & overlay if open
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar) sidebar.classList.remove("mobile-open");
    if (overlay) overlay.classList.remove("active");

    // Toggle active view panel
    const panels = document.querySelectorAll(".view-panel");
    panels.forEach(panel => {
        if (panel.id === `view-${viewId}`) {
            panel.classList.add("active");
        } else {
            panel.classList.remove("active");
        }
    });

    // Update navigation button active state
    document.querySelectorAll(".nav-item, .mobile-nav-item").forEach(btn => {
        if (btn.dataset.view === viewId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Re-render view specific dynamic components
    if (viewId === "dashboard") renderDashboard();
    if (viewId === "ai-plan") renderAiPlan();
    if (viewId === "routine") renderRoutineDetails();
    if (viewId === "hydration") renderHydrationView();
    if (viewId === "tracker") renderTrackerView();
    if (viewId === "journal") renderJournalView();
    if (viewId === "progress") renderProgressView();
    if (viewId === "ingredients") renderIngredientsGrid();
    if (viewId === "products") renderProductsGrid();
    if (viewId === "favorites") renderFavoritesView();
    if (viewId === "school") renderSchoolView();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================================================
// 8. ONBOARDING WIZARD CONTROLLER
// ==========================================================================
let onboardingStep = 1;
const onboardingState = {
    skinType: "",
    concerns: [],
    lifestyle: { sleep: "6-7 hours (Moderate)", water: 2.0, stress: "Moderate Stress", sun: "Moderate (1-2 hours)", makeup: "Light / Tinted Moisturizer" },
    habits: { products: ["Cleanser", "Moisturizer", "Sunscreen"], exfoliation: "1-2 times per week", consistency: "Moderate (Most nights)", name: "Glow Seeker" }
};

function initOnboarding() {
    const stepPanels = document.querySelectorAll(".onboarding-step-panel");
    const prevBtn = document.getElementById("onboarding-prev-btn");
    const nextBtn = document.getElementById("onboarding-next-btn");

    // Skin type option cards
    document.querySelectorAll(".skin-type-grid .option-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".skin-type-grid .option-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            onboardingState.skinType = card.dataset.value;
        });
    });

    // Water slider update
    const waterSlider = document.getElementById("water-intake-range");
    const waterValDisplay = document.getElementById("water-slider-val");
    if (waterSlider && waterValDisplay) {
        waterSlider.addEventListener("input", (e) => {
            waterValDisplay.textContent = parseFloat(e.target.value).toFixed(1);
            onboardingState.lifestyle.water = parseFloat(e.target.value);
        });
    }

    // Navigation Next/Prev
    nextBtn.addEventListener("click", async () => {
        if (onboardingStep === 1 && !onboardingState.skinType) {
            showToast("Please select your skin type to continue.", "info");
            return;
        }

        if (onboardingStep < 5) {
            onboardingStep++;
            updateOnboardingUI();
        }
    });

    prevBtn.addEventListener("click", () => {
        if (onboardingStep > 1) {
            onboardingStep--;
            updateOnboardingUI();
        }
    });

    // Generate Plan button
    document.getElementById("generate-plan-btn").addEventListener("click", async () => {
        // Gather final step inputs
        const selectedConcerns = Array.from(document.querySelectorAll("input[name='concerns']:checked")).map(cb => cb.value);
        onboardingState.concerns = selectedConcerns.length > 0 ? selectedConcerns : ["General Maintenance"];

        onboardingState.lifestyle.sleep = document.getElementById("sleep-quality-select").value;
        onboardingState.lifestyle.stress = document.getElementById("stress-level-select").value;
        onboardingState.lifestyle.sun = document.getElementById("sun-exposure-select").value;
        onboardingState.lifestyle.makeup = document.getElementById("makeup-usage-select").value;

        const selectedProds = Array.from(document.querySelectorAll("input[name='habits-products']:checked")).map(cb => cb.value);
        onboardingState.habits.products = selectedProds;
        onboardingState.habits.exfoliation = document.getElementById("exfoliation-freq").value;
        onboardingState.habits.consistency = document.getElementById("routine-consistency").value;
        onboardingState.habits.name = document.getElementById("user-display-name").value || "Glow Seeker";

        // Save profile into AppState
        AppState.profile = onboardingState;

        showToast("Analyzing skin profile with AI...", "info");
        const generatedPlan = await fetchGeminiSkinPlan(onboardingState);
        AppState.aiPlan = generatedPlan;

        saveStateToStorage();
        updateUserHeaderBadges();

        showToast("Skin plan created!", "success");
        navigateTo("ai-plan");
    });
}

function updateOnboardingUI() {
    document.querySelectorAll(".onboarding-step-panel").forEach(panel => {
        if (parseInt(panel.dataset.step) === onboardingStep) {
            panel.classList.add("active");
        } else {
            panel.classList.remove("active");
        }
    });

    const titles = ["Skin Type", "Concerns", "Lifestyle", "Habits", "Summary"];
    document.getElementById("onboarding-step-label").textContent = `Step ${onboardingStep} of 5`;
    document.getElementById("onboarding-step-title").textContent = titles[onboardingStep - 1];
    document.getElementById("onboarding-progress-fill").style.width = `${(onboardingStep / 5) * 100}%`;

    document.getElementById("onboarding-prev-btn").disabled = onboardingStep === 1;
    const nextBtn = document.getElementById("onboarding-next-btn");
    if (onboardingStep === 5) {
        nextBtn.classList.add("hidden");
    } else {
        nextBtn.classList.remove("hidden");
    }

    // Populate summary if step 5
    if (onboardingStep === 5) {
        document.getElementById("summary-skin-type").textContent = onboardingState.skinType || "Normal";
        const concernsContainer = document.getElementById("summary-concerns");
        const selectedConcerns = Array.from(document.querySelectorAll("input[name='concerns']:checked")).map(cb => cb.value);
        concernsContainer.innerHTML = selectedConcerns.map(c => `<span class="badge-pill">${c}</span>`).join(" ");
        document.getElementById("summary-lifestyle").textContent = `${onboardingState.lifestyle.water}L Water, ${onboardingState.lifestyle.sleep}`;
        document.getElementById("summary-habits").textContent = onboardingState.habits.consistency;
    }
}

// ==========================================================================
// 9. DASHBOARD CONTROLLER
// ==========================================================================
function renderDashboard() {
    const profile = AppState.profile || { habits: { name: "Glow Seeker" }, skinType: "Pending", concerns: [] };
    document.getElementById("dash-greeting-name").textContent = `Good day, ${profile.habits?.name || "Glow Seeker"} 👋`;

    document.getElementById("dash-stat-skin-type").textContent = profile.skinType || "Pending";
    document.getElementById("dash-stat-concerns-count").textContent = `${profile.concerns?.length || 0} target concerns`;
    document.getElementById("dash-stat-streak").textContent = `${AppState.streak.count || 0} Days`;

    document.getElementById("dash-stat-hydration").textContent = `${AppState.hydration.today.toFixed(1)} / ${AppState.hydration.goal} L`;
    const hydrPct = Math.min(100, Math.round((AppState.hydration.today / AppState.hydration.goal) * 100));
    document.getElementById("dash-stat-hydration-bar").style.width = `${hydrPct}%`;
    document.getElementById("dash-ring-pct").textContent = `${hydrPct}%`;

    // Render Ritual Steps
    renderDashboardRitualSteps("morning");

    // Ritual Tab Listeners
    document.getElementById("dash-tab-morning").onclick = function () {
        this.classList.add("active");
        document.getElementById("dash-tab-night").classList.remove("active");
        renderDashboardRitualSteps("morning");
    };

    document.getElementById("dash-tab-night").onclick = function () {
        this.classList.add("active");
        document.getElementById("dash-tab-morning").classList.remove("active");
        renderDashboardRitualSteps("night");
    };

    // Render Insight
    renderInsightCard();

    // Render Key Actives mini list
    const activesContainer = document.getElementById("dash-key-actives-list");
    if (activesContainer) {
        const list = (AppState.aiPlan && AppState.aiPlan.ingredients) ? AppState.aiPlan.ingredients : ["Niacinamide", "Hyaluronic Acid", "Ceramides"];
        activesContainer.innerHTML = list.map(item => `
      <div class="mini-active-item badge-pill">
        <i data-lucide="sparkles"></i>
        <span>${item}</span>
      </div>
    `).join("");
        lucide.createIcons();
    }
}

function renderDashboardRitualSteps(type) {
    const container = document.getElementById("dash-ritual-steps-container");
    if (!container) return;

    const plan = AppState.aiPlan || generateLocalSkincarePlan(AppState.profile || { skinType: "Normal" });
    const steps = type === "morning" ? plan.morningRoutine : plan.nightRoutine;
    const todayStr = new Date().toISOString().split("T")[0];

    container.innerHTML = steps.map(s => {
        const isCompleted = AppState.routineCompleted[type] && AppState.routineCompleted[type][s.step];
        return `
      <div class="step-checklist-item ${isCompleted ? 'completed' : ''}" data-type="${type}" data-step="${s.step}">
        <div class="step-checkbox">${isCompleted ? '✓' : ''}</div>
        <span class="step-num-badge">${s.step}</span>
        <div class="step-info">
          <span class="step-title-text font-semibold">${s.category}: ${s.name}</span>
          <span class="step-sub text-xs text-muted block">${s.ingredient ? 'Key: ' + s.ingredient : s.purpose}</span>
        </div>
      </div>
    `;
    }).join("");

    // Attach completion click listeners
    container.querySelectorAll(".step-checklist-item").forEach(item => {
        item.addEventListener("click", () => {
            const stepNum = item.dataset.step;
            const stepType = item.dataset.type;

            if (!AppState.routineCompleted[stepType]) AppState.routineCompleted[stepType] = {};
            const current = AppState.routineCompleted[stepType][stepNum];
            AppState.routineCompleted[stepType][stepNum] = !current;

            updateStreakAndCompletion();
            saveStateToStorage();
            renderDashboardRitualSteps(type);
        });
    });
}

function updateStreakAndCompletion() {
    const todayStr = new Date().toISOString().split("T")[0];
    if (AppState.streak.lastActiveDate !== todayStr) {
        AppState.streak.count += 1;
        AppState.streak.lastActiveDate = todayStr;
        showToast(`🔥 Daily Streak updated! ${AppState.streak.count} Days!`, "success");
    }
    updateUserHeaderBadges();
}

function renderInsightCard() {
    const insight = INSIGHTS_LIST[AppState.activeInsightIndex % INSIGHTS_LIST.length];
    document.getElementById("insight-title").textContent = insight.title;
    document.getElementById("insight-text").textContent = insight.text;
    document.getElementById("insight-tag").textContent = insight.tag;

    document.getElementById("next-insight-btn").onclick = () => {
        AppState.activeInsightIndex++;
        renderInsightCard();
    };
}

// ==========================================================================
// 10. AI SKIN PLAN RENDERER
// ==========================================================================
function renderAiPlan() {
    const plan = AppState.aiPlan || generateLocalSkincarePlan(AppState.profile || { skinType: "Normal" });

    document.getElementById("ai-snapshot-type").textContent = plan.skinType || "Normal";
    document.getElementById("ai-balance-score").textContent = plan.balanceScore || 88;

    const concernsContainer = document.getElementById("ai-snapshot-concerns");
    if (concernsContainer) {
        concernsContainer.innerHTML = (plan.concerns || []).map(c => `<span class="badge-pill">${c}</span>`).join(" ");
    }

    document.getElementById("ai-plan-summary").textContent = plan.summary;

    // Morning Steps
    document.getElementById("ai-morning-steps-list").innerHTML = plan.morningRoutine.map(s => `
    <div class="detail-step-card">
      <div class="detail-step-header">
        <span class="step-cat-name">${s.step} — ${s.category}: ${s.name}</span>
        <span class="step-ing-tag">${s.ingredient || s.category}</span>
      </div>
      <p class="step-why-text">${s.purpose} ${s.why ? '— ' + s.why : ''}</p>
    </div>
  `).join("");

    // Night Steps
    document.getElementById("ai-night-steps-list").innerHTML = plan.nightRoutine.map(s => `
    <div class="detail-step-card">
      <div class="detail-step-header">
        <span class="step-cat-name">${s.step} — ${s.category}: ${s.name}</span>
        <span class="step-ing-tag">${s.ingredient || s.category}</span>
      </div>
      <p class="step-why-text">${s.purpose} ${s.why ? '— ' + s.why : ''}</p>
    </div>
  `).join("");

    // Suggested & Avoid lists
    document.getElementById("ai-suggested-ingredients").innerHTML = (plan.ingredients || []).map(i => `<li><strong>${i}:</strong> Works in harmony to support skin texture and barrier.</li>`).join("");
    document.getElementById("ai-avoid-ingredients").innerHTML = (plan.avoid || []).map(i => `<li><strong>${i}:</strong> May trigger sensitivity or clogged pores for your skin type.</li>`).join("");

    // Lifestyle tips
    document.getElementById("ai-lifestyle-tips").innerHTML = (plan.lifestyleTips || []).map(t => `
    <div class="lifestyle-card glass-card">
      <h4 class="font-semibold mb-1">${t.title}</h4>
      <p class="text-xs text-muted">${t.desc}</p>
    </div>
  `).join("");

    document.getElementById("ai-dermatologist-note").textContent = plan.dermatologistNote || "This is general skincare information, not a medical diagnosis. For persistent or severe problems, consult a qualified dermatologist.";
}

// ==========================================================================
// 11. ROUTINE DETAILS RENDERER
// ==========================================================================
function renderRoutineDetails() {
    const container = document.getElementById("routine-details-container");
    if (!container) return;

    const plan = AppState.aiPlan || generateLocalSkincarePlan(AppState.profile || { skinType: "Normal" });

    const mornBtn = document.getElementById("routine-morn-btn");
    const nightBtn = document.getElementById("routine-night-btn");

    const renderType = (type) => {
        const steps = type === "morning" ? plan.morningRoutine : plan.nightRoutine;
        container.innerHTML = steps.map(s => `
      <div class="glass-card mb-4">
        <div class="card-header-flex">
          <div class="flex items-center gap-3">
            <span class="badge-pill">${s.step}</span>
            <h3 class="font-bold text-lg">${s.category}: ${s.name}</h3>
          </div>
          <span class="badge-sparkle">${s.ingredient}</span>
        </div>
        <p class="text-sm text-muted mb-2"><strong>Purpose:</strong> ${s.purpose}</p>
        <p class="text-xs text-muted"><strong>Why SKINORA Recommends This:</strong> ${s.why || 'Supports overall skin resilience.'}</p>
      </div>
    `).join("");
    };

    mornBtn.onclick = () => {
        mornBtn.classList.add("active");
        nightBtn.classList.remove("active");
        renderType("morning");
    };

    nightBtn.onclick = () => {
        nightBtn.classList.add("active");
        mornBtn.classList.remove("active");
        renderType("night");
    };

    renderType("morning");
}

// ==========================================================================
// 12. HYDRATION TRACKER & CANVAS PROGRESS
// ==========================================================================
function renderHydrationView() {
    document.getElementById("hydration-current-amount").textContent = `${AppState.hydration.today.toFixed(1)} L`;
    document.getElementById("hydration-target-amount").textContent = `Goal: ${AppState.hydration.goal} L`;
    const pct = Math.min(100, Math.round((AppState.hydration.today / AppState.hydration.goal) * 100));
    document.getElementById("hydration-pct-badge").textContent = `${pct}% Met`;

    drawHydrationCanvasRing(pct);
    renderHydrationHistoryChart();
}

function drawHydrationCanvasRing(pct) {
    const canvas = document.getElementById("hydration-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const radius = 80;

    ctx.clearRect(0, 0, width, height);

    // Background Ring
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.strokeStyle = AppState.theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    ctx.lineWidth = 14;
    ctx.stroke();

    // Progress Arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * (pct / 100));

    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, startAngle, endAngle);
    ctx.strokeStyle = "#7A9A8B"; // Sage accent
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.stroke();
}

let hydrationChartInstance = null;
function renderHydrationHistoryChart() {
    const canvas = document.getElementById("hydration-history-chart");
    if (!canvas) return;

    if (hydrationChartInstance) hydrationChartInstance.destroy();

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dataValues = [1.8, 2.2, 2.5, 2.0, 1.5, 2.4, AppState.hydration.today];

    hydrationChartInstance = new Chart(canvas.getContext("2d"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Water Intake (L)",
                data: dataValues,
                backgroundColor: "rgba(122, 154, 139, 0.7)",
                borderColor: "#7A9A8B",
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 4.0, grid: { color: "rgba(150,150,150,0.1)" } },
                x: { grid: { display: false } }
            }
        }
    });
}

function initHydrationTracker() {
    document.querySelectorAll(".add-water-btn, .log-water-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const amount = parseFloat(btn.dataset.amount);
            AppState.hydration.today += amount;
            saveStateToStorage();
            updateUserHeaderBadges();
            if (AppState.currentView === "hydration") renderHydrationView();
            if (AppState.currentView === "dashboard") renderDashboard();
            showToast(`Logged +${(amount * 1000).toFixed(0)} ml of water! 💧`, "success");
        });
    });

    const resetBtn = document.getElementById("reset-today-water-btn");
    if (resetBtn) {
        resetBtn.onclick = () => {
            AppState.hydration.today = 0;
            saveStateToStorage();
            updateUserHeaderBadges();
            renderHydrationView();
            showToast("Today's water log reset.", "info");
        };
    }

    const saveGoalBtn = document.getElementById("save-water-goal-btn");
    if (saveGoalBtn) {
        saveGoalBtn.onclick = () => {
            const goalVal = parseFloat(document.getElementById("set-water-goal-input").value);
            if (goalVal && goalVal > 0) {
                AppState.hydration.goal = goalVal;
                saveStateToStorage();
                renderHydrationView();
                showToast(`Daily water goal updated to ${goalVal}L!`, "success");
            }
        };
    }
}

// ==========================================================================
// 13. TRACKER & STREAK CONTROLLER
// ==========================================================================
function renderTrackerView() {
    document.getElementById("tracker-streak-num").textContent = `${AppState.streak.count || 0} Days`;

    // Update Milestones
    const count = AppState.streak.count || 0;
    document.querySelectorAll(".milestone-badge").forEach(m => {
        const daysReq = parseInt(m.dataset.days);
        if (count >= daysReq) {
            m.classList.add("unlocked");
        } else {
            m.classList.remove("unlocked");
        }
    });

    renderInteractiveChecklist("tracker-morning-list", "morning");
    renderInteractiveChecklist("tracker-night-list", "night");
}

function renderInteractiveChecklist(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const plan = AppState.aiPlan || generateLocalSkincarePlan(AppState.profile || { skinType: "Normal" });
    const steps = type === "morning" ? plan.morningRoutine : plan.nightRoutine;

    container.innerHTML = steps.map(s => {
        const isChecked = AppState.routineCompleted[type] && AppState.routineCompleted[type][s.step];
        return `
      <label class="step-checklist-item ${isChecked ? 'completed' : ''}">
        <input type="checkbox" ${isChecked ? 'checked' : ''} data-type="${type}" data-step="${s.step}" class="hidden-check">
        <div class="step-checkbox">${isChecked ? '✓' : ''}</div>
        <div>
          <span class="step-title-text font-semibold block">${s.step}. ${s.category}: ${s.name}</span>
          <span class="text-xs text-muted">${s.purpose}</span>
        </div>
      </label>
    `;
    }).join("");

    container.querySelectorAll("input.hidden-check").forEach(cb => {
        cb.onchange = (e) => {
            const stepType = e.target.dataset.type;
            const stepNum = e.target.dataset.step;

            if (!AppState.routineCompleted[stepType]) AppState.routineCompleted[stepType] = {};
            AppState.routineCompleted[stepType][stepNum] = e.target.checked;

            updateStreakAndCompletion();
            saveStateToStorage();
            renderTrackerView();
        };
    });
}

// ==========================================================================
// 14. SKIN JOURNAL CONTROLLER
// ==========================================================================
function initJournal() {
    const openBtn = document.getElementById("open-new-journal-btn");
    const formCard = document.getElementById("journal-form-card");
    const cancelBtn = document.getElementById("cancel-journal-btn");
    const form = document.getElementById("journal-entry-form");

    if (openBtn && formCard) {
        openBtn.onclick = () => formCard.classList.remove("hidden");
    }
    if (cancelBtn && formCard) {
        cancelBtn.onclick = () => formCard.classList.add("hidden");
    }

    // Pre-fill today's date
    const dateInput = document.getElementById("journal-date");
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const newEntry = {
                id: Date.now().toString(),
                date: document.getElementById("journal-date").value,
                condition: document.getElementById("journal-condition").value,
                breakouts: document.getElementById("journal-breakouts").value,
                oiliness: document.getElementById("journal-oiliness").value,
                redness: document.getElementById("journal-redness").value,
                notes: document.getElementById("journal-notes").value
            };

            AppState.journal.unshift(newEntry);
            saveStateToStorage();
            formCard.classList.add("hidden");
            form.reset();
            renderJournalView();
            showToast("Skin journal entry saved!", "success");
        };
    }
}

function renderJournalView() {
    const container = document.getElementById("journal-timeline");
    if (!container) return;

    if (AppState.journal.length === 0) {
        container.innerHTML = `
      <div class="glass-card text-center p-8">
        <i data-lucide="book-open" class="mx-auto mb-2 text-muted"></i>
        <h3 class="font-semibold text-lg">No Journal Entries Yet</h3>
        <p class="text-xs text-muted mb-4">Record your daily skin condition to spot triggers and track improvement.</p>
      </div>
    `;
        lucide.createIcons();
        return;
    }

    container.innerHTML = AppState.journal.map(j => `
    <div class="journal-entry-card glass-card">
      <div class="entry-header">
        <span class="entry-date">${j.date}</span>
        <span class="entry-condition badge-pill">${j.condition}</span>
      </div>
      <div class="entry-metrics">
        <span>Breakouts: ${j.breakouts}/5</span>
        <span>Oiliness: ${j.oiliness}/5</span>
        <span>Redness: ${j.redness}/5</span>
      </div>
      <p class="entry-notes">${j.notes || 'No detailed notes logged.'}</p>
    </div>
  `).join("");
}

// ==========================================================================
// 15. PROGRESS & ANALYTICS CHARTS
// ==========================================================================
let routineChartInstance = null;
let analyticsHydrationInstance = null;

function renderProgressView() {
    const ctx1 = document.getElementById("routine-consistency-chart");
    const ctx2 = document.getElementById("analytics-hydration-chart");

    if (ctx1) {
        if (routineChartInstance) routineChartInstance.destroy();
        routineChartInstance = new Chart(ctx1.getContext("2d"), {
            type: "line",
            data: {
                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                datasets: [{
                    label: "Routine Completion %",
                    data: [45, 60, 80, 95],
                    borderColor: "#E09385",
                    backgroundColor: "rgba(224, 147, 133, 0.15)",
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    if (ctx2) {
        if (analyticsHydrationInstance) analyticsHydrationInstance.destroy();
        analyticsHydrationInstance = new Chart(ctx2.getContext("2d"), {
            type: "bar",
            data: {
                labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                datasets: [{
                    label: "Avg Daily Liters",
                    data: [1.6, 2.0, 2.3, 2.5],
                    backgroundColor: "rgba(122, 154, 139, 0.7)"
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

// ==========================================================================
// 16. INGREDIENTS & PRODUCTS & FAVORITES
// ==========================================================================
let activeIngCat = "All";
let activeProdCat = "All";

function renderIngredientsGrid() {
    const container = document.getElementById("ingredients-grid");
    if (!container) return;

    const searchVal = (document.getElementById("ingredient-search-input")?.value || "").toLowerCase();

    const filtered = INGREDIENTS_DB.filter(ing => {
        const matchesCat = activeIngCat === "All" || ing.categoryKey === activeIngCat;
        const matchesSearch = ing.name.toLowerCase().includes(searchVal) || ing.usedFor.toLowerCase().includes(searchVal);
        return matchesCat && matchesSearch;
    });

    container.innerHTML = filtered.map(ing => {
        const isFav = AppState.favorites.ingredients.includes(ing.id);
        return `
      <div class="ingredient-card glass-card" onclick="openIngredientModal('${ing.id}')">
        <div class="card-top">
          <h3>${ing.name}</h3>
          <button class="fav-toggle-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFav('ingredients', '${ing.id}')">
            ♥
          </button>
        </div>
        <p class="ing-desc">${ing.summary}</p>
        <div class="card-tags">
          <span class="tag-sm">${ing.category}</span>
          <span class="tag-sm">${ing.goodFor}</span>
        </div>
      </div>
    `;
    }).join("");
}

function renderProductsGrid() {
    const container = document.getElementById("products-grid");
    if (!container) return;

    const filtered = PRODUCTS_DB.filter(p => activeProdCat === "All" || p.category === activeProdCat);

    container.innerHTML = filtered.map(p => {
        const isFav = AppState.favorites.products.includes(p.id);
        return `
      <div class="product-card glass-card">
        <div class="card-top">
          <div>
            <span class="text-xs text-muted font-semibold uppercase block">${p.brand}</span>
            <h3>${p.name}</h3>
          </div>
          <button class="fav-toggle-btn ${isFav ? 'active' : ''}" onclick="toggleFav('products', '${p.id}')">
            ♥
          </button>
        </div>
        <p class="text-xs text-muted mb-3">${p.description}</p>
        <div class="bg-hover p-3 rounded-md mb-3">
          <span class="text-xs font-semibold block mb-1">Why SKINORA Recommends:</span>
          <span class="text-xs text-muted">${p.whyRecommend}</span>
        </div>
        <div class="card-tags">
          <span class="tag-sm">${p.category}</span>
          <span class="tag-sm">${p.skinType}</span>
        </div>
      </div>
    `;
    }).join("");
}

function toggleFav(type, id) {
    const index = AppState.favorites[type].indexOf(id);
    if (index > -1) {
        AppState.favorites[type].splice(index, 1);
        showToast("Removed from favorites", "info");
    } else {
        AppState.favorites[type].push(id);
        showToast("Saved to favorites!", "success");
    }
    saveStateToStorage();
    updateUserHeaderBadges();
    if (AppState.currentView === "ingredients") renderIngredientsGrid();
    if (AppState.currentView === "products") renderProductsGrid();
    if (AppState.currentView === "favorites") renderFavoritesView();
}

function renderFavoritesView() {
    const container = document.getElementById("favorites-content-grid");
    if (!container) return;

    const favIngs = INGREDIENTS_DB.filter(ing => AppState.favorites.ingredients.includes(ing.id));

    if (favIngs.length === 0) {
        container.innerHTML = `<p class="text-muted p-4">No favorite ingredients saved yet. Click the heart icon on any ingredient card to save it here!</p>`;
        return;
    }

    container.innerHTML = favIngs.map(ing => `
    <div class="ingredient-card glass-card" onclick="openIngredientModal('${ing.id}')">
      <div class="card-top">
        <h3>${ing.name}</h3>
        <button class="fav-toggle-btn active" onclick="event.stopPropagation(); toggleFav('ingredients', '${ing.id}')">♥</button>
      </div>
      <p class="ing-desc">${ing.summary}</p>
    </div>
  `).join("");
}

function openIngredientModal(id) {
    const ing = INGREDIENTS_DB.find(i => i.id === id);
    if (!ing) return;

    const modal = document.getElementById("ingredient-modal");
    const body = document.getElementById("ingredient-modal-body");

    body.innerHTML = `
    <h2 class="font-bold text-2xl mb-2">${ing.name}</h2>
    <span class="badge-pill mb-4 block">${ing.category}</span>
    <p class="text-sm text-muted mb-4">${ing.summary}</p>
    <div class="glass-card mb-3 p-3">
      <strong>Commonly Used For:</strong> ${ing.usedFor}
    </div>
    <div class="glass-card mb-3 p-3">
      <strong>Suitable For:</strong> ${ing.goodFor}
    </div>
    <div class="glass-card mb-3 p-3">
      <strong>How to Apply:</strong> ${ing.howToUse}
    </div>
    <div class="glass-card mb-3 p-3">
      <strong>Considerations:</strong> ${ing.considerations}
    </div>
    <div class="insight-card p-3 rounded-md">
      <strong>${ing.note}</strong>
    </div>
  `;

    modal.classList.remove("hidden");
}

// ==========================================================================
// 17. SKIN SCHOOL RENDERER
// ==========================================================================
function renderSchoolView() {
    const container = document.getElementById("school-articles-grid");
    if (!container) return;

    container.innerHTML = ARTICLES_DB.map(a => `
    <div class="glass-card p-4 cursor-pointer hover:border-rose-400" onclick="openArticleModal('${a.id}')">
      <span class="badge-pill mb-2">${a.categoryName}</span>
      <h3 class="font-bold text-lg mb-2">${a.title}</h3>
      <p class="text-xs text-muted mb-3">${a.summary}</p>
      <span class="text-xs font-semibold text-rose-500">${a.readTime} ➔</span>
    </div>
  `).join("");
}

function openArticleModal(id) {
    const art = ARTICLES_DB.find(a => a.id === id);
    if (!art) return;

    const modal = document.getElementById("article-modal");
    const body = document.getElementById("article-modal-body");

    body.innerHTML = `
    <span class="badge-pill mb-2">${art.categoryName} • ${art.readTime}</span>
    <h1 class="font-bold text-2xl mb-4">${art.title}</h1>
    <div class="prose text-sm text-muted">${art.content}</div>
  `;

    modal.classList.remove("hidden");
}

// ==========================================================================
// 18. GLOBAL SEARCH & MODAL CONTROLLERS
// ==========================================================================
function initGlobalSearch() {
    const modal = document.getElementById("search-modal");
    const input = document.getElementById("modal-search-input");
    const resultsContainer = document.getElementById("search-modal-results");
    const closeBtn = document.getElementById("close-search-modal");

    const openSearch = () => {
        modal.classList.remove("hidden");
        input.focus();
    };

    document.getElementById("global-search-btn")?.addEventListener("click", openSearch);
    closeBtn?.addEventListener("click", () => modal.classList.add("hidden"));

    // Key shortcut ⌘K or Ctrl+K
    document.addEventListener("keydown", (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            openSearch();
        }
    });

    input?.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) {
            resultsContainer.innerHTML = `<p class="search-empty-hint">Start typing to see instant results...</p>`;
            return;
        }

        const matchedIngs = INGREDIENTS_DB.filter(i => i.name.toLowerCase().includes(q) || i.usedFor.toLowerCase().includes(q));
        const matchedProds = PRODUCTS_DB.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        const matchedArts = ARTICLES_DB.filter(a => a.title.toLowerCase().includes(q));

        let html = "";
        matchedIngs.forEach(i => {
            html += `<div class="search-result-item" onclick="openIngredientModal('${i.id}'); document.getElementById('search-modal').classList.add('hidden');">
        <div><strong>${i.name}</strong> <span class="text-xs text-muted">(Ingredient)</span></div>
        <span class="text-xs text-rose-500">View ➔</span>
      </div>`;
        });

        matchedProds.forEach(p => {
            html += `<div class="search-result-item" onclick="navigateTo('products'); document.getElementById('search-modal').classList.add('hidden');">
        <div><strong>${p.name}</strong> <span class="text-xs text-muted">(${p.category})</span></div>
        <span class="text-xs text-rose-500">View ➔</span>
      </div>`;
        });

        matchedArts.forEach(a => {
            html += `<div class="search-result-item" onclick="openArticleModal('${a.id}'); document.getElementById('search-modal').classList.add('hidden');">
        <div><strong>${a.title}</strong> <span class="text-xs text-muted">(Article)</span></div>
        <span class="text-xs text-rose-500">Read ➔</span>
      </div>`;
        });

        resultsContainer.innerHTML = html || `<p class="p-4 text-xs text-muted">No matching ingredients or articles found.</p>`;
    });
}

// ==========================================================================
// 19. THEME & TOAST SYSTEM
// ==========================================================================
function initThemeToggle() {
    const applyTheme = (t) => {
        AppState.theme = t;
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, t);

        // Update active class on segmented theme buttons
        document.querySelectorAll(".theme-segment-btn").forEach(btn => {
            if (btn.dataset.themeVal === t) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        if (AppState.currentView === "hydration") renderHydrationView();
    };

    applyTheme(AppState.theme);

    // Segmented theme switch click handlers
    document.querySelectorAll(".theme-segment-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTheme = btn.dataset.themeVal;
            if (targetTheme && targetTheme !== AppState.theme) {
                applyTheme(targetTheme);
                showToast(`Switched to ${targetTheme} theme ✨`, "info");
            }
        });
    });

    // Top header icon button toggle
    const headerToggle = document.getElementById("header-theme-toggle");
    if (headerToggle) {
        headerToggle.addEventListener("click", () => {
            const nextTheme = AppState.theme === "light" ? "dark" : "light";
            applyTheme(nextTheme);
            showToast(`Switched to ${nextTheme} theme ✨`, "info");
        });
    }
}

function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateUserHeaderBadges() {
    const streakEl = document.getElementById("header-streak-count");
    if (streakEl) streakEl.textContent = AppState.streak.count || 0;

    const waterEl = document.getElementById("header-water-count");
    if (waterEl) waterEl.textContent = `${AppState.hydration.today.toFixed(1)} L`;

    const sidebarName = document.getElementById("sidebar-user-name");
    if (sidebarName && AppState.profile) {
        sidebarName.textContent = AppState.profile.habits?.name || "Glow Seeker";
        document.getElementById("sidebar-user-type").textContent = AppState.profile.skinType || "Profile Pending";
    }
}

// ==========================================================================
// 20. INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    loadStateFromStorage();
    initThemeToggle();
    initOnboarding();
    initHydrationTracker();
    initJournal();
    initGlobalSearch();

    // Register Service Worker for Android App / PWA installation
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('ServiceWorker registration:', err));
    }

    // Navigation Links Event Listeners
    document.querySelectorAll(".nav-item, .mobile-nav-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const view = btn.dataset.view;
            if (view) navigateTo(view);
        });
    });

    // Mobile menu drawer & overlay toggle
    const sidebarElem = document.getElementById("sidebar");
    const sidebarOverlayElem = document.getElementById("sidebar-overlay");

    const toggleMobileMenu = () => {
        if (!sidebarElem) return;
        const isOpen = sidebarElem.classList.toggle("mobile-open");
        if (sidebarOverlayElem) sidebarOverlayElem.classList.toggle("active", isOpen);
    };

    const closeMobileMenu = () => {
        if (sidebarElem) sidebarElem.classList.remove("mobile-open");
        if (sidebarOverlayElem) sidebarOverlayElem.classList.remove("active");
    };

    document.getElementById("mobile-sidebar-toggle")?.addEventListener("click", toggleMobileMenu);
    sidebarOverlayElem?.addEventListener("click", closeMobileMenu);

    // Landing CTAs
    document.getElementById("start-onboarding-btn")?.addEventListener("click", () => navigateTo("onboarding"));
    document.getElementById("explore-school-btn")?.addEventListener("click", () => navigateTo("school"));
    document.getElementById("edit-profile-btn")?.addEventListener("click", () => navigateTo("onboarding"));
    document.getElementById("view-all-ingredients-btn")?.addEventListener("click", () => navigateTo("ingredients"));

    // Settings handlers
    document.getElementById("save-api-key-btn")?.addEventListener("click", () => {
        const key = document.getElementById("settings-gemini-key").value.trim();
        if (!AppState.settings) AppState.settings = {};
        AppState.settings.geminiKey = key;
        saveStateToStorage();
        showToast("Gemini API key saved!", "success");
        document.getElementById("api-key-status").textContent = key ? "Status: Custom Gemini API Key Active" : "Status: Using SKINORA Curated Recommendation Engine";
    });

    document.getElementById("settings-retake-onboarding")?.addEventListener("click", () => navigateTo("onboarding"));

    // Reset Modal
    const resetModal = document.getElementById("reset-modal");
    document.getElementById("reset-all-data-btn")?.addEventListener("click", () => resetModal.classList.remove("hidden"));
    document.getElementById("cancel-reset-btn")?.addEventListener("click", () => resetModal.classList.add("hidden"));
    document.getElementById("confirm-reset-btn")?.addEventListener("click", () => {
        localStorage.clear();
        location.reload();
    });

    // Close modals listener
    document.querySelectorAll(".close-modal-btn").forEach(btn => {
        btn.onclick = () => {
            btn.closest(".modal-overlay").classList.add("hidden");
        };
    });

    // Category Pills filters for Ingredients
    document.querySelectorAll("#ingredient-category-pills .pill-btn").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll("#ingredient-category-pills .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeIngCat = btn.dataset.cat;
            renderIngredientsGrid();
        };
    });

    document.getElementById("ingredient-search-input")?.addEventListener("input", renderIngredientsGrid);

    // Category Pills filters for Products
    document.querySelectorAll("#product-category-tabs .pill-btn").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll("#product-category-tabs .pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeProdCat = btn.dataset.cat;
            renderProductsGrid();
        };
    });

    // Initial View Determination
    if (AppState.profile && AppState.aiPlan) {
        navigateTo("dashboard");
    } else {
        navigateTo("landing");
    }

    updateUserHeaderBadges();
    lucide.createIcons();
});

// ==========================================================================
// 21. GLOBAL WINDOW EXPORTS & DELEGATION (100% BUTTON GUARANTEE & 200% PRODUCTIVITY)
// ==========================================================================

// Expose key functions globally on window object to guarantee inline onclick attributes work 100%
window.navigateTo = navigateTo;
window.openIngredientModal = openIngredientModal;
window.openArticleModal = openArticleModal;
window.toggleFav = toggleFav;
window.showToast = showToast;
window.renderDashboard = renderDashboard;
window.renderIngredientsGrid = renderIngredientsGrid;
window.renderProductsGrid = renderProductsGrid;

// Global Event Delegation for 100% reliable button & link clicks
document.addEventListener("click", (e) => {
    // 1. Check for data-view attribute (Navigation)
    const navElem = e.target.closest("[data-view]");
    if (navElem) {
        const viewId = navElem.dataset.view;
        if (viewId) {
            e.preventDefault();
            navigateTo(viewId);
            // Close mobile drawer if open
            document.getElementById("sidebar")?.classList.remove("mobile-open");
            return;
        }
    }

    // 2. Check for data-action attribute (Global Actions)
    const actionElem = e.target.closest("[data-action]");
    if (actionElem) {
        const action = actionElem.dataset.action;
        handleGlobalAction(action, actionElem, e);
        return;
    }

    // 3. Check for data-amount attribute (Water logging)
    const waterElem = e.target.closest("[data-amount]");
    if (waterElem) {
        const amount = parseFloat(waterElem.dataset.amount);
        if (!isNaN(amount)) {
            AppState.hydration.today += amount;
            saveStateToStorage();
            updateUserHeaderBadges();
            if (AppState.currentView === "hydration") renderHydrationView();
            if (AppState.currentView === "dashboard") renderDashboard();
            showToast(`Logged +${(amount * 1000).toFixed(0)} ml of water! 💧`, "success");
        }
        return;
    }
});

// Centralized Action Handler for all data-action buttons
function handleGlobalAction(action, elem, e) {
    switch (action) {
        case "toggle-theme":
            const nextTheme = AppState.theme === "light" ? "dark" : "light";
            AppState.theme = nextTheme;
            document.documentElement.setAttribute("data-theme", nextTheme);
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, nextTheme);
            showToast(`Switched to ${nextTheme} theme.`, "info");
            break;

        case "open-search":
            document.getElementById("search-modal")?.classList.remove("hidden");
            document.getElementById("modal-search-input")?.focus();
            break;

        case "close-search":
            document.getElementById("search-modal")?.classList.add("hidden");
            break;

        case "load-sample-oily":
            loadSampleProfile("Oily");
            break;

        case "load-sample-dry":
            loadSampleProfile("Dry");
            break;

        case "copy-routine":
            copyRoutineToClipboard();
            break;

        case "export-plan":
            exportPlanAsText();
            break;

        case "open-journal":
            navigateTo("journal");
            document.getElementById("journal-form-card")?.classList.remove("hidden");
            break;

        case "quick-add-water-250":
            AppState.hydration.today += 0.25;
            saveStateToStorage();
            updateUserHeaderBadges();
            if (AppState.currentView === "hydration") renderHydrationView();
            if (AppState.currentView === "dashboard") renderDashboard();
            showToast("Logged +250ml water! 💧", "success");
            break;

        default:
            console.log("Unhandled action:", action);
    }
}

// 22. PRODUCTIVITY ENHANCEMENTS: SAMPLE PROFILES, COPY ROUTINE, EXPORT PLAN
function loadSampleProfile(type = "Oily") {
    let sample;
    if (type === "Oily") {
        sample = {
            skinType: "Oily",
            concerns: ["Acne / Breakouts", "Enlarged Pores", "Excess Sebum"],
            lifestyle: { sleep: "7-8 hours", water: 2.5, stress: "Moderate", sun: "Moderate", makeup: "Light" },
            habits: { products: ["Cleanser", "Moisturizer", "Sunscreen"], exfoliation: "2-3 times/wk", consistency: "Consistent", name: "Alex (Oily Skin Demo)" }
        };
    } else {
        sample = {
            skinType: "Dry",
            concerns: ["Dryness / Flaking", "Redness", "Dullness"],
            lifestyle: { sleep: "8+ hours", water: 2.5, stress: "Low", sun: "Low", makeup: "None" },
            habits: { products: ["Cleanser", "Rich Cream", "Sunscreen"], exfoliation: "1 time/wk", consistency: "Consistent", name: "Elena (Dry Skin Demo)" }
        };
    }

    AppState.profile = sample;
    AppState.aiPlan = generateLocalSkincarePlan(sample);
    saveStateToStorage();
    updateUserHeaderBadges();
    showToast(`Loaded sample ${type} skin profile!`, "success");
    navigateTo("dashboard");
}

function copyRoutineToClipboard() {
    const plan = AppState.aiPlan || generateLocalSkincarePlan(AppState.profile || { skinType: "Normal" });
    let text = `=== SKINORA Personalized Skincare Ritual ===\nSkin Type: ${plan.skinType}\n\n`;

    text += "MORNING ROUTINE:\n";
    plan.morningRoutine.forEach(s => {
        text += `${s.step}. ${s.category}: ${s.name} (${s.ingredient || s.purpose})\n`;
    });

    text += "\nEVENING ROUTINE:\n";
    plan.nightRoutine.forEach(s => {
        text += `${s.step}. ${s.category}: ${s.name} (${s.ingredient || s.purpose})\n`;
    });

    text += `\nKEY ACTIVES: ${(plan.ingredients || []).join(", ")}\n`;
    text += `AVOID: ${(plan.avoid || []).join(", ")}\n`;

    navigator.clipboard.writeText(text).then(() => {
        showToast("Routine copied to clipboard!", "success");
    }).catch(() => {
        showToast("Failed to copy routine.", "info");
    });
}

function exportPlanAsText() {
    const plan = AppState.aiPlan || generateLocalSkincarePlan(AppState.profile || { skinType: "Normal" });
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Skinora_Routine_${plan.skinType}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Exported skin plan JSON!", "success");
}

window.loadSampleProfile = loadSampleProfile;
window.copyRoutineToClipboard = copyRoutineToClipboard;
window.exportPlanAsText = exportPlanAsText;
