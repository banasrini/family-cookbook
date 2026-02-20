// Run from the server/ directory: node seed.js
require('dotenv').config();
const { client, initDb } = require('./db');

const recipes = [
  {
    name: 'Millets Pongal',
    description: 'A comforting millet and dal dish. Serves 4.',
    instructions: `Put ghee in the pot, add jeera, ginger, cashew nuts, millet and dhal. Saute it!
Add crushed pepper, turmeric, salt and water (around 3 cups).
Cover and cook. (Instant pot: 10 min high pressure)`,
    notes: '',
    ingredients: [
      { name: 'ghee', quantity: '2 tbsp' },
      { name: 'ginger', quantity: 'a few pieces' },
      { name: 'jeera', quantity: '1 tsp' },
      { name: 'pepper', quantity: '1 tsp crushed' },
      { name: 'cashew nuts', quantity: 'a few' },
      { name: 'millet', quantity: '1 cup (washed)' },
      { name: 'green gram dhal', quantity: 'little less than 1 cup' },
      { name: 'turmeric', quantity: 'a pinch' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'water', quantity: 'around 3 cups' },
    ],
  },
  {
    name: 'Gojju for Pongal',
    description: 'A tangy tamarind and brinjal side for pongal.',
    instructions: `Soak tamarind.
Cook brinjal in the cooker (just 2 whistles — cooks quickly).
Squeeze tamarind water, add jaggery, salt, and 1 slit green chilli. Boil it.
Add mashed brinjal and cook for some time.`,
    notes: '',
    ingredients: [
      { name: 'tamarind', quantity: 'small ball' },
      { name: 'brinjal', quantity: '2-3 medium' },
      { name: 'jaggery', quantity: 'to taste' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'green chilli', quantity: '1 slit' },
    ],
  },
  {
    name: "Amma's Rasam",
    description: 'A classic South Indian tamarind rasam.',
    instructions: `Soak tamarind (small lemon size).
Boil together tamarind water, salt, jaggery, tomato, turmeric nicely.
If you have green chilli, put one slit chilli in this.
Add boiled and mashed dhal, bring to boil.
Add rasam pudi (for one person, two servings: 1.5 tsp). Boil 2 more minutes.
Put tadka: mustard, jeera, hing (in that order).

Note: Add one cup water to the tamarind water initially.`,
    notes: 'For one person / two servings, use 1.5 tsp rasam pudi.',
    ingredients: [
      { name: 'tamarind', quantity: 'small lemon size' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'jaggery', quantity: 'to taste' },
      { name: 'tomato', quantity: '1' },
      { name: 'turmeric', quantity: 'a pinch' },
      { name: 'green chilli', quantity: '1 slit (optional)' },
      { name: 'dhal', quantity: 'boiled and mashed' },
      { name: 'rasam pudi', quantity: '1.5 tsp per serving' },
      { name: 'mustard', quantity: 'for tadka' },
      { name: 'jeera', quantity: 'for tadka' },
      { name: 'hing', quantity: 'for tadka' },
    ],
  },
  {
    name: "Beans Palya — Amma's Recipe",
    description: 'Simple stir-fried green beans with a coconut garnish.',
    instructions: `Put oil in a pan. Add mustard and urad dhal.
Add two slit green chillies (or red chillies) and turmeric. Saute for a few seconds only.
Add cut beans and salt. Drizzle some water. Cover and cook till soft.
Garnish with grated coconut.

Be careful with water: too little gets burnt; too much — keep on high flame uncovered till water evaporates.`,
    notes: 'Grated coconut garnish optional but recommended.',
    ingredients: [
      { name: 'oil', quantity: '1-2 tsp' },
      { name: 'mustard', quantity: '1 tsp' },
      { name: 'urad dhal', quantity: '1 tsp' },
      { name: 'green chilli', quantity: '2 slit' },
      { name: 'turmeric', quantity: 'a pinch' },
      { name: 'green beans', quantity: 'cut, as needed' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'grated coconut', quantity: 'for garnish (optional)' },
    ],
  },
  {
    name: 'Moong Dal Palya — Amma',
    description: 'Sprouted whole moong stir-fry with garlic and dill.',
    instructions: `Soak whole moong overnight in water.
Cook the soaked moong (1:2 ratio of moong to water). 1 whistle then reduce to very low for 2 min (or turn off).

In a pestle, mash jeera first, then add:
- 3-4 green chillies
- 5 garlic pods
- 0.5 tsp jeera seeds
- A little salt
Make a paste.

In a kadai:
1. Add oil
2. Mustard and jeera
3. Chopped onion (1) — fry till soft
4. Add the paste and cook till garlic smell goes away
5. Add chopped dill (and other greens like methi or harve soppu) and stir for ~1 min
6. Add the cooked moong and mix well
7. Optional: squeeze lemon`,
    notes: 'Can make the same with alsande (black-eyed peas) as well. Soaked, sprouted moong also works great.',
    ingredients: [
      { name: 'whole moong', quantity: '1.5 cups (pre-soaked overnight)' },
      { name: 'green chillies', quantity: '3-4' },
      { name: 'garlic', quantity: '5 pods' },
      { name: 'jeera', quantity: '0.5 tsp' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'oil', quantity: 'for cooking' },
      { name: 'mustard', quantity: '1 tsp' },
      { name: 'onion', quantity: '1 chopped' },
      { name: 'dill', quantity: '1 bunch, chopped' },
      { name: 'methi leaves', quantity: 'optional' },
      { name: 'lemon', quantity: 'optional, for squeeze' },
    ],
  },
  {
    name: 'Khadi — Amma',
    description: 'A light, tangy yoghurt-based kadhi with chickpea flour.',
    instructions: `Mix together: chickpea flour, chopped ginger (1 inch), 2 green chillies chopped, turmeric powder, and curd/buttermilk into a thin paste.

In a kadai:
1. Heat oil, add mustard, jeera, chopped garlic, curry leaves and hing. Brown the garlic.
2. Pour the above mixture and add lots of water.
3. Keep stirring and bring to a boil.
4. Lower the flame and keep it watery.
5. Add salt.
6. Wait for the right consistency.
7. Add kasuri methi if not using curry leaves (they are interchangeable).`,
    notes: 'Kasuri methi and curry leaves are interchangeable.',
    ingredients: [
      { name: 'chickpea flour', quantity: '2 tbsp' },
      { name: 'ginger', quantity: '1 inch chopped' },
      { name: 'green chilli', quantity: '2 chopped' },
      { name: 'turmeric powder', quantity: 'a pinch' },
      { name: 'curd or buttermilk', quantity: 'enough to make a paste' },
      { name: 'oil', quantity: '2 tsp' },
      { name: 'mustard', quantity: '1 tsp' },
      { name: 'jeera', quantity: '1 tsp' },
      { name: 'garlic', quantity: 'a few cloves chopped' },
      { name: 'curry leaves', quantity: 'a few' },
      { name: 'hing', quantity: 'a pinch' },
      { name: 'water', quantity: 'plenty' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'kasuri methi', quantity: 'if not using curry leaves' },
    ],
  },
  {
    name: 'Muddhe — Beetroot and Red Harve Soppu',
    description: 'A tangy stir-fry of grated beetroot in a tamarind base.',
    instructions: `Put oil in a pan.
Add mustard, fenugreek seeds, curry leaves, and lots of garlic.
Add hing.
Add 3 green chillies.
Add grated beetroot and saute for 2 min.
Add tamarind water.
Add salt.
Adjust water as needed.
Cover and cook — it should come together.`,
    notes: '',
    ingredients: [
      { name: 'oil', quantity: 'for cooking' },
      { name: 'mustard', quantity: '1 tsp' },
      { name: 'fenugreek seeds', quantity: '1 tsp' },
      { name: 'curry leaves', quantity: 'a few' },
      { name: 'garlic', quantity: 'plenty' },
      { name: 'hing', quantity: 'a pinch' },
      { name: 'green chilli', quantity: '3' },
      { name: 'beetroot', quantity: '2-3, grated' },
      { name: 'tamarind water', quantity: 'to taste' },
      { name: 'salt', quantity: 'to taste' },
    ],
  },
  {
    name: 'Sabuddhanna (Sabudana)',
    description: 'Fluffy sabudana (tapioca pearls) cooked with potato and peanuts.',
    instructions: `Wash sabudana 3 times till water runs clean.
Soak with just enough water — about 2 cm above sabudana — OVERNIGHT (minimum 6 hours).

Morning:
Dry roast a handful of peanuts.
Crush into small pieces in a mixie.
Add peanuts and salt to soaked sabudana and mix well.

Tadka (ogarne):
- Mustard and jeera
- Small potato (chopped)
- Green chilli
- Curry leaves
Once potato is soft, add the sabudana mixture. Cover and cook, stirring often.
Sabudana is done when translucent. Add water as needed.`,
    notes: 'Key: soak overnight for at least 6 hours. Sabudana is ready when translucent.',
    ingredients: [
      { name: 'sabudana', quantity: '1 cup' },
      { name: 'peanuts', quantity: 'a handful' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'mustard', quantity: '1 tsp' },
      { name: 'jeera', quantity: '1 tsp' },
      { name: 'potato', quantity: '1 small, diced' },
      { name: 'green chilli', quantity: '1-2' },
      { name: 'curry leaves', quantity: 'a few' },
    ],
  },
  {
    name: 'Avalakki Breakfast (Poha)',
    description: 'Quick South Indian breakfast made with flattened rice.',
    instructions: `Wash avalakki (3 handfuls).
Add turmeric, salt, jaggery, and a little huli powder. Keep aside.

Fry peanuts in coconut oil and keep aside.
In the same oil: add mustard, urad dhal, curry leaves, and green chillies (and onion/tomatoes if using).
Add the avalakki. Sprinkle water. Stir and cover for 2-3 min.
Sprinkle lemon. Eat immediately.`,
    notes: 'Eat immediately — it dries out if kept long. Extra oil helps keep it moist.',
    ingredients: [
      { name: 'avalakki (poha)', quantity: '3 handfuls' },
      { name: 'turmeric', quantity: 'a pinch' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'jaggery', quantity: 'a little' },
      { name: 'huli powder', quantity: 'a little' },
      { name: 'coconut oil', quantity: 'for frying' },
      { name: 'peanuts', quantity: 'a handful' },
      { name: 'mustard', quantity: '1 tsp' },
      { name: 'urad dhal', quantity: '1 tsp' },
      { name: 'curry leaves', quantity: 'a few' },
      { name: 'green chillies', quantity: '2-3' },
      { name: 'lemon', quantity: 'for squeeze' },
    ],
  },
  {
    name: 'Snack Avalakki',
    description: 'Crunchy no-cook snack avalakki with onion, coconut, and a spiced tadka.',
    instructions: `Cut half an onion into small pieces.
Take a little fresh coconut.
Add salt, sugar, and a small teaspoon of chilli powder.

Tadka (voggarne):
- A little extra coconut oil
- Mustard
- Lots of urad dal
- Curry leaves
Add the tadka to the onion-coconut mixture.
Add avalakki and rub it in. Do NOT add any water.`,
    notes: 'No water added — the coconut and onion provide enough moisture.',
    ingredients: [
      { name: 'onion', quantity: 'half, small pieces' },
      { name: 'fresh coconut', quantity: 'a little' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'sugar', quantity: 'a little' },
      { name: 'chilli powder', quantity: '1 small tsp' },
      { name: 'coconut oil', quantity: 'a little extra' },
      { name: 'mustard', quantity: '1 tsp' },
      { name: 'urad dal', quantity: 'plenty' },
      { name: 'curry leaves', quantity: 'a few' },
      { name: 'avalakki (poha)', quantity: 'as needed' },
    ],
  },
  {
    name: 'Vendekka Pulusu (Okra Tamarind Curry)',
    description: 'Bhindi cooked in a tamarind-coconut curry.',
    instructions: `Cut 300g bhindi into 1-inch pieces. Saute till it loses its rawness. Set aside.

In the same pan:
Add mustard, onion, and curry leaves to oil. Saute.
Add turmeric, coriander powder, and chilli powder.
Add water and let it simmer till rawness of powders goes.

Add the bhindi.
Add tamarind water and salt.

Once it simmers: grind 1/4 coconut and add to the pulusu. Cook coconut for 5 min max.`,
    notes: 'Do not overcook coconut — 5 min max after adding.',
    ingredients: [
      { name: 'bhindi (okra)', quantity: '300g' },
      { name: 'mustard', quantity: '1 tsp' },
      { name: 'onion', quantity: '1' },
      { name: 'curry leaves', quantity: 'a few' },
      { name: 'oil', quantity: 'for cooking' },
      { name: 'turmeric', quantity: '1 tsp' },
      { name: 'coriander powder', quantity: '1 tsp' },
      { name: 'chilli powder', quantity: '1 tsp' },
      { name: 'water', quantity: 'as needed' },
      { name: 'tamarind water', quantity: 'to taste' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'coconut', quantity: '1/4 coconut, ground' },
    ],
  },
  {
    name: 'Vegetables Pickle',
    description: 'A spiced mixed vegetable pickle with a homemade masala.',
    instructions: `Wash veggies and wipe dry. Cut into strips. Use juice of 4 limes (or add vinegar later).

Make the masala:
1. Dry roast: fennel seeds (2 tsp), mustard (2 tsp), jeera (1 tsp), menthe seeds (0.5 tsp), 6 pepper pods.
2. Grind into a powder.
3. Add 2 tsp chilli powder and 1 tsp turmeric powder.

Final mixing:
Heat mustard or sesame oil (a lot). Add oil to the powders. Add salt and mix.
Pour over cut vegetables.`,
    notes: 'Use plenty of oil — it acts as the preserving medium.',
    ingredients: [
      { name: 'mixed vegetables', quantity: 'as needed, cut into strips' },
      { name: 'lime', quantity: '4 (juiced)' },
      { name: 'fennel seeds', quantity: '2 tsp' },
      { name: 'mustard', quantity: '2 tsp' },
      { name: 'jeera', quantity: '1 tsp' },
      { name: 'menthe seeds', quantity: '0.5 tsp' },
      { name: 'pepper', quantity: '6 pods' },
      { name: 'chilli powder', quantity: '2 tsp' },
      { name: 'turmeric powder', quantity: '1 tsp' },
      { name: 'mustard oil or sesame oil', quantity: 'plenty (heated)' },
      { name: 'salt', quantity: 'to taste' },
    ],
  },
  {
    name: 'Tex Mex Bowl',
    description: 'A vibrant bowl with spiced quinoa, bean mash, roasted veggies, and eggs.',
    instructions: `Make spiced quinoa.
Make a bean mash.
Roast mushrooms and red peppers.
Assemble the bowl: quinoa base, bean mash, roasted veggies, lettuce, avocado guac, salsa, and eggs on top.`,
    notes: '',
    ingredients: [
      { name: 'quinoa', quantity: 'spiced' },
      { name: 'beans', quantity: 'mashed' },
      { name: 'mushrooms', quantity: 'roasted' },
      { name: 'red pepper', quantity: 'roasted' },
      { name: 'lettuce', quantity: 'some' },
      { name: 'avocado', quantity: 'for guac' },
      { name: 'salsa', quantity: 'as needed' },
      { name: 'eggs', quantity: '1-2' },
    ],
  },
  {
    name: "Eggplant Gojju — Atthamma's Recipe",
    description: 'Smoky roasted eggplant in a tangy tamarind and onion gravy.',
    instructions: `1. Roast the eggplant on flame till skin is charred.
2. Wait to cool, remove the peel, and keep the flesh aside.
3. In a pan, add oil and mustard seeds.
4. Chop a small onion and add to the pan with curry leaves. Fry till soft. Add green chili for spice.
5. Add salt and coriander powder (1 tsp). Cook.
6. Add tamarind water and cook till raw taste is gone.
7. Add eggplant flesh and cook.

It should be on the tangier side.`,
    notes: 'Should lean tangy. Char the eggplant well for a smoky flavour.',
    ingredients: [
      { name: 'eggplant', quantity: '1 large' },
      { name: 'oil', quantity: 'for cooking' },
      { name: 'mustard seeds', quantity: '1 tsp' },
      { name: 'onion', quantity: '1 small' },
      { name: 'curry leaves', quantity: 'a few' },
      { name: 'green chili', quantity: '1-2' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'coriander powder', quantity: '1 tsp' },
      { name: 'tamarind water', quantity: 'to taste' },
    ],
  },
  {
    name: 'Cuddalore Koorakku (like Lasooni Palak)',
    description: 'A coarsely ground spinach and garlic chutney with a crunchy urad dal tadka.',
    instructions: `1. Saute spinach and garlic in a pan with a sprinkle of water. (1 box spinach, 5-6 garlic pods.)
2. Switch off once garlic is cooked.
3. In a small pan, take 2 tbsp oil and add 2 tbsp urad dal. When half-brown, add 4 red chillies and 1 level tsp vadiyam.
4. Add salt.
5. Blitz step 3 first.
6. Add spinach-garlic and pulse 2-3 times to get a chutney-like consistency.
7. Mix everything together.`,
    notes: '',
    ingredients: [
      { name: 'spinach', quantity: '1 box' },
      { name: 'garlic', quantity: '5-6 pods' },
      { name: 'oil', quantity: '2 tbsp' },
      { name: 'urad dal', quantity: '2 tbsp' },
      { name: 'red chillies', quantity: '4' },
      { name: 'vadiyam', quantity: '1 level tsp' },
      { name: 'salt', quantity: 'to taste' },
    ],
  },
  {
    name: "Atthamma's Chicken Curry (Gravy Version)",
    description: 'A rich chicken curry with a blended masala gravy.',
    instructions: `Make the masala:
Saute: small amount of cinnamon, 4 cloves, jeera, and fennel.
Add onions, tomato, ginger-garlic and saute till soft.
Add turmeric, cumin, coriander (double quantity of cumin), chilli, and peppercorns.
Add cashew for body.
Blend everything into a smooth gravy. Keep aside.

Cook the chicken:
Saute onions and curry leaves. Add chicken pieces and brown them.
Add the masala gravy. Add water as needed. Close and cook.`,
    notes: 'Coriander powder should be double the cumin. Cashews add body to the gravy.',
    ingredients: [
      { name: 'chicken', quantity: '1 packet' },
      { name: 'cinnamon', quantity: 'small amount' },
      { name: 'cloves', quantity: '4' },
      { name: 'jeera', quantity: '1 tsp' },
      { name: 'fennel', quantity: '1 tsp' },
      { name: 'onion', quantity: '2 (one for masala, one for cooking)' },
      { name: 'tomato', quantity: '2' },
      { name: 'ginger garlic paste', quantity: '1 tbsp' },
      { name: 'turmeric', quantity: '1 tsp' },
      { name: 'cumin powder', quantity: '1 tsp' },
      { name: 'coriander powder', quantity: '2 tsp' },
      { name: 'chilli powder', quantity: 'to taste' },
      { name: 'peppercorns', quantity: 'a few' },
      { name: 'cashew', quantity: 'a handful' },
      { name: 'curry leaves', quantity: 'a few' },
      { name: 'water', quantity: 'as needed' },
    ],
  },
  {
    name: "Atthamma's Chicken/Vegetable Kurma (Coconut Version)",
    description: 'A coconut-based kurma good with appam, idly, or dosa.',
    instructions: `Saute green chillies and keep aside.

Make the masala paste:
Blend together: coconut, cashew or pottu kadla (1 tbsp), gasa gasa (1 tsp), fennel (1 tsp), green chillies, turmeric powder, coriander powder.
(Variation: if you don't want clove/cinnamon whole pieces in the dish, add them to the paste as well.)

Cook:
Saute onions and tomatoes with clove and cinnamon.
Add chicken or vegetables.
Add the masala paste and cook.
Add salt.
Garnish with coriander leaves.`,
    notes: 'Good for appam, idly, and dosa. Variation: blend clove/cinnamon into the masala if you prefer no whole spices.',
    ingredients: [
      { name: 'chicken or vegetables', quantity: '1 packet / as needed' },
      { name: 'green chillies', quantity: '3-4' },
      { name: 'coconut', quantity: 'half' },
      { name: 'cashew or pottu kadla', quantity: '1 tbsp' },
      { name: 'gasa gasa (poppy seeds)', quantity: '1 tsp' },
      { name: 'fennel', quantity: '1 tsp' },
      { name: 'turmeric powder', quantity: '1 tsp' },
      { name: 'coriander powder', quantity: '2 tsp' },
      { name: 'clove', quantity: '2-3' },
      { name: 'cinnamon', quantity: 'small piece' },
      { name: 'onion', quantity: '1' },
      { name: 'tomato', quantity: '1' },
      { name: 'salt', quantity: 'to taste' },
      { name: 'coriander leaves', quantity: 'for garnish' },
    ],
  },
];

async function seed() {
  await initDb();

  const tx = await client.transaction('write');
  try {
    for (const recipe of recipes) {
      const r = await tx.execute({
        sql: 'INSERT INTO recipes (name, description, instructions, notes) VALUES (?, ?, ?, ?)',
        args: [recipe.name, recipe.description, recipe.instructions, recipe.notes],
      });
      const recipeId = Number(r.lastInsertRowid);

      for (const ing of recipe.ingredients) {
        await tx.execute({
          sql: 'INSERT OR IGNORE INTO ingredients (name) VALUES (LOWER(?))',
          args: [ing.name],
        });
        const { rows: [row] } = await tx.execute({
          sql: 'SELECT id FROM ingredients WHERE name = LOWER(?)',
          args: [ing.name],
        });
        await tx.execute({
          sql: 'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES (?, ?, ?)',
          args: [recipeId, row.id, ing.quantity],
        });
      }
    }

    await tx.commit();
    console.log(`Seeded ${recipes.length} recipes successfully.`);
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
