const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

export type RecommendationCandidate = {
  id: number;
  title: string;
  brand?: string;
  priceINR: number;
  rating: number;
  description?: string;
  tags?: string[];
};

export type Recommendation = {
  productId: number;
  reason: string;
  matchScore: number;
};

type OpenRouterResponse = {
  error?: {
    code?: number | string;
    message?: string;
  };
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function parseRecommendationResponse(content: string): unknown {
  const jsonContent = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1]
    ?? content.trim();

  try {
    return JSON.parse(jsonContent);
  } catch {
    throw new Error("OpenRouter returned an invalid JSON response.");
  }
}

export async function getRecommendations(
  query: string,
  products: RecommendationCandidate[],
  model = OPENROUTER_MODEL,
): Promise<Recommendation[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      reasoning: { enabled: false },
      stream: false,
      messages: [
        {
          role: "system",
          content:
            "Select exactly 3 products from the candidates. Use only supplied products. Return JSON only: {\"recommendations\":[{\"productId\":number,\"reason\":string,\"matchScore\":number}]}. Scores must be 0-100.",
        },
        {
          role: "user",
          content: JSON.stringify({ query, products }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as OpenRouterResponse;

  if (data.error) {
    if (data.error.code === 503 || data.error.code === "provider_overloaded") {
      throw new Error("OpenRouter provider is temporarily unavailable.");
    }

    throw new Error("OpenRouter could not generate recommendations.");
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter returned no recommendation response.");
  }

  return validateRecommendations(parseRecommendationResponse(content), products);
}

function validateRecommendations(
  value: unknown,
  products: RecommendationCandidate[],
): Recommendation[] {
  if (
    typeof value !== "object" ||
    value === null ||
    !Array.isArray((value as { recommendations?: unknown }).recommendations)
  ) {
    throw new Error("AI response is invalid: recommendations must be an array.");
  }

  const recommendations = (value as { recommendations: unknown[] }).recommendations;
  const productIds = new Set(products.map((product) => product.id));

  if (recommendations.length !== 3) {
    throw new Error("AI response is invalid: exactly 3 recommendations are required.");
  }

  const validated = recommendations.map((recommendation) => {
    if (typeof recommendation !== "object" || recommendation === null) {
      throw new Error("AI response is invalid: recommendation format is incorrect.");
    }

    const item = recommendation as Partial<Recommendation>;

    if (
      typeof item.productId !== "number" ||
      !productIds.has(item.productId)
    ) {
      throw new Error("AI response is invalid: recommendation contains an unknown product.");
    }

    if (
      typeof item.reason !== "string" ||
      item.reason.trim().length === 0 ||
      typeof item.matchScore !== "number" ||
      item.matchScore < 0 ||
      item.matchScore > 100
    ) {
      throw new Error("AI response is invalid: reason or matchScore is incorrect.");
    }

    return {
      productId: item.productId,
      reason: item.reason,
      matchScore: item.matchScore,
    };
  });

  if (new Set(validated.map((recommendation) => recommendation.productId)).size !== 3) {
    throw new Error("AI response is invalid: recommendations must be unique products.");
  }

  return validated;
}