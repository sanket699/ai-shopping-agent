import { NextResponse } from "next/server";

import {
  getRecommendations,
  OPENROUTER_MODEL,
  type RecommendationCandidate,
} from "@/lib/ai/openrouter";

type RequestProduct = {
  id: number;
  title: string;
  brand?: string;
  priceINR?: number;
  price?: number;
  rating: number;
  description?: string;
  tags?: string[];
};

type RecommendRequest = {
  query: string;
  products: RequestProduct[];
  model?: string;
};

function isRequestProduct(value: unknown): value is RequestProduct {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const product = value as Partial<RequestProduct>;
  const price = product.priceINR ?? product.price;

  return (
    typeof product.id === "number" &&
    typeof product.title === "string" &&
    typeof product.rating === "number" &&
    typeof price === "number"
  );
}

function toRecommendationCandidate(product: RequestProduct): RecommendationCandidate {
  return {
    id: product.id,
    title: product.title,
    brand: product.brand,
    priceINR: product.priceINR ?? product.price!,
    rating: product.rating,
    description: product.description,
    tags: product.tags,
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const requestBody = body as Partial<RecommendRequest>;

  if (
    typeof requestBody.query !== "string" ||
    !Array.isArray(requestBody.products) ||
    !requestBody.products.every(isRequestProduct)
  ) {
    return NextResponse.json(
      { error: "Request must include a query and valid products." },
      { status: 400 },
    );
  }

  if (requestBody.products.length < 3) {
    return NextResponse.json(
      { error: "At least 3 products are required for recommendations." },
      { status: 400 },
    );
  }

  if (requestBody.model && requestBody.model !== OPENROUTER_MODEL) {
    return NextResponse.json(
      { error: "The selected AI model is not available." },
      { status: 400 },
    );
  }

  try {
    const recommendations = await getRecommendations(
      requestBody.query,
      requestBody.products.map(toRecommendationCandidate),
      requestBody.model ?? OPENROUTER_MODEL,
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to get recommendations.";
    const status = message === "OPENROUTER_API_KEY is not configured." ? 500 : 502;

    return NextResponse.json({ error: message }, { status });
  }
}