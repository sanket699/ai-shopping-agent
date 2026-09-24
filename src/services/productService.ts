import localProducts from "../../mobile_data_fixed.json";

import type { Product } from "@/types/product";

export type QueryState =
  | "valid-smartphone"
  | "unsupported-category"
  | "invalid"
  | "no-results";

export type ProductSearchResult = {
  state: QueryState;
  products: Product[];
  intent: SearchIntent;
};

export type SearchIntent = "camera" | "battery" | "gaming" | "general";

const MAX_PREFERENCE_RESULTS = 10;

export async function fetchProducts(): Promise<Product[]> {
  return localProducts;
}

// Previous DummyJSON source, retained so it can be restored later:
// const PRODUCTS_API_URL =
//   "https://dummyjson.com/products/category/smartphones";
// const response = await fetch(PRODUCTS_API_URL);
// if (!response.ok) {
//   throw new Error("Unable to fetch products.");
// }
// const data = (await response.json()) as ProductResponse;
// return data.products.map((product) => ({
//   ...product,
//   priceINR: product.price * USD_TO_INR,
// }));

export function extractBudget(query: string): number | undefined {
  const budgetMatch = query.match(
    /\b(?:under|below|within|around|less than)\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k)?\b/i,
  ) ?? query.match(/(?:^|\s)(?:₹|rs\.?|inr)?\s*([\d]+(?:\.\d+)?)\s*k\b/i);

  if (!budgetMatch) {
    return undefined;
  }

  const amount = Number(budgetMatch[1].replace(/,/g, ""));
  const hasKSuffix = Boolean(budgetMatch[2] ?? budgetMatch[0].match(/k\b/i));
  const budget = hasKSuffix ? amount * 1000 : amount;
  return Number.isFinite(budget) ? budget : undefined;
}

export function classifyQuery(query: string): Exclude<QueryState, "no-results"> {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return "invalid";
  }

  const unsupportedCategory =
    /\b(tablets?|laptops?|smart\s*watch(?:es)?|tv|televisions?|desktops?|monitors?)\b/i;
  if (unsupportedCategory.test(normalizedQuery)) {
    return "unsupported-category";
  }

  const smartphoneIntent =
    /\b(phone|phones|smartphone|smartphones|mobile|mobiles)\b/i;
  const supportedPreference =
    /\b(battery|camera|gaming|performance|storage|ram|fast|photography)\b/i;
  const hasBudget = extractBudget(normalizedQuery) !== undefined;

  if (
    smartphoneIntent.test(normalizedQuery) ||
    (hasBudget && supportedPreference.test(normalizedQuery))
  ) {
    return "valid-smartphone";
  }

  return "invalid";
}

export function getSearchIntent(query: string): SearchIntent {
  const normalizedQuery = query.toLowerCase();

  if (/\b(camera|photography)\b/.test(normalizedQuery)) {
    return "camera";
  }

  if (/\bbattery\b/.test(normalizedQuery)) {
    return "battery";
  }

  if (/\b(gaming|performance|fast)\b/.test(normalizedQuery)) {
    return "gaming";
  }

  return "general";
}

function extractMegapixels(value: string): number {
  return Number(value.match(/(\d+(?:\.\d+)?)\s*MP/i)?.[1] ?? 0);
}

function scoreProduct(product: Product, intent: SearchIntent): number {
  const mainCamera = extractMegapixels(product.mainCamera);
  const ultrawideCamera = extractMegapixels(product.ultrawideCamera);
  const telephotoCamera = extractMegapixels(product.telephotoCamera);
  const selfieCamera = extractMegapixels(product.selfieCamera);

  if (intent === "camera") {
    return (
      mainCamera * 0.35 +
      ultrawideCamera * 0.2 +
      telephotoCamera * 0.25 +
      selfieCamera * 0.1 +
      product.rating * 10
    );
  }

  if (intent === "battery") {
    return product.batteryCapacity * 0.01 + product.chargingWattage * 0.1 + product.rating * 10;
  }

  if (intent === "gaming") {
    const processorScore = /snapdragon|dimensity/i.test(product.processor) ? 30 : 10;
    return processorScore + product.ram * 2 + product.storage * 0.03 + product.rating * 10;
  }

  return (
    product.rating * 10 +
    product.ram * 1.5 +
    product.storage * 0.02 +
    product.batteryCapacity * 0.005 +
    Math.min(mainCamera + ultrawideCamera + telephotoCamera, 200) * 0.05
  );
}

export function filterProducts(products: Product[], query: string): ProductSearchResult {
  const queryState = classifyQuery(query);

  if (queryState !== "valid-smartphone") {
    return { intent: "general", products: [], state: queryState };
  }

  const budget = extractBudget(query);
  const intent = getSearchIntent(query);
  const candidates = products.filter(
    (product) => budget === undefined || product.priceINR <= budget,
  );
  const rankedProducts = [...candidates].sort(
    (first, second) => scoreProduct(second, intent) - scoreProduct(first, intent),
  );
  const matchingProducts =
    intent === "general"
      ? rankedProducts
      : rankedProducts.slice(0, MAX_PREFERENCE_RESULTS);

  return {
    products: matchingProducts,
    intent,
    state: matchingProducts.length > 0 ? "valid-smartphone" : "no-results",
  };
}