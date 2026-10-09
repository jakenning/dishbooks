// COGS categories per concept, shared by the scenes that break COGS out
// (Custom Reports, Why DishBooks). Each entry is [name, 'f' food | 'b' bev,
// share of that side]; the shares on each side add up to 1.

export const CATS = {
  default: [['Proteins', 'f', 0.4], ['Produce', 'f', 0.2], ['Dairy & Bakery', 'f', 0.16], ['Dry Goods', 'f', 0.24], ['Beer & Wine', 'b', 0.55], ['Liquor', 'b', 0.45]],
  'fine-dining': [['Meat & Seafood', 'f', 0.5], ['Produce', 'f', 0.22], ['Dairy', 'f', 0.12], ['Pantry', 'f', 0.16], ['Wine', 'b', 0.7], ['Spirits', 'b', 0.3]],
  qsr: [['Beef & Chicken', 'f', 0.4], ['Fries & Sides', 'f', 0.14], ['Buns & Bakery', 'f', 0.12], ['Produce & Dairy', 'f', 0.14], ['Packaging', 'f', 0.2], ['Beverage', 'b', 1]],
  'fast-casual': [['Proteins', 'f', 0.36], ['Produce', 'f', 0.26], ['Grains & Bread', 'f', 0.14], ['Dairy & Sauces', 'f', 0.1], ['Packaging', 'f', 0.14], ['Beverage', 'b', 1]],
  'coffee-shops': [['Coffee & Tea', 'b', 0.48], ['Dairy & Alt Milk', 'b', 0.3], ['Cups & Lids', 'b', 0.14], ['Syrups & Other', 'b', 0.08], ['Bakery', 'f', 0.6], ['Food & Snacks', 'f', 0.4]],
  pizzerias: [['Cheese', 'f', 0.32], ['Flour & Dough', 'f', 0.14], ['Meats', 'f', 0.2], ['Produce', 'f', 0.14], ['Packaging', 'f', 0.2], ['Beer & Soda', 'b', 1]],
  'bars-nightclubs': [['Liquor', 'b', 0.5], ['Beer', 'b', 0.22], ['Wine', 'b', 0.14], ['Mixers & Garnish', 'b', 0.14], ['Bar Food', 'f', 1]],
};
export const SWATCH = ['#1440ad', '#326cff', '#2eb2ff', '#5542ff', '#7ca1ff', '#a3b3ff'];
