"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import ProductSkeleton from "@/components/ProductSkeleton";
import RecommendationToolbar from "@/components/RecommendationToolbar";
import ResultsHeader from "@/components/ResultsHeader";
import SearchControls from "@/components/SearchControls";
import {
  extractBudget,
  fetchProducts,
  filterProducts,
} from "@/services/productService";
import type { SearchIntent } from "@/services/productService";
import type { Product } from "@/types/product";

type RecommendationResponse = {
  recommendations?: Array<{
    productId: number;
    reason: string;
    matchScore: number;
  }>;
};

const defaultModel = "nvidia/nemotron-3-ultra-550b-a55b:free";
export default function Home() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [resultsVersion, setResultsVersion] = useState(0);
  const [recommendations, setRecommendations] = useState(
    new Map<number, { reason: string; matchScore: number }>(),
  );
  const [searchIntent, setSearchIntent] = useState<SearchIntent>("general");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const budget = extractBudget(query);
  const intentLabel = {
    battery: "Battery focused",
    camera: "Camera focused",
    gaming: "Gaming focused",
    general: "All smartphones",
  }[searchIntent];

  async function handleClear() {
    setQuery("");
    setError("");
    setRecommendations(new Map());
    setSearchIntent("general");
    setHasSearched(false);
    setSelectedProduct(null);

    setIsLoading(true);
    try {
      const allProducts = await fetchProducts();
      setProducts(allProducts);
      setResultsVersion((version) => version + 1);
    } catch {
      setProducts([]);
      setError("Unable to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    fetchProducts().then((allProducts) => {
      if (isActive) {
        setProducts(allProducts);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSearch() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");
    setProducts([]);
    setRecommendations(new Map());
    setHasSearched(true);

    try {
      const allProducts = await fetchProducts();
      const result = filterProducts(allProducts, query);
      setProducts(result.products);
      setSearchIntent(result.intent);
      setResultsVersion((version) => version + 1);

      if (result.state === "unsupported-category") {
        setError("Currently, we only support smartphones.");
      } else if (result.state === "invalid") {
        setError(
          "Please search for smartphones, or specify a preference such as battery, camera, gaming, or a budget.",
        );
      } else if (result.state === "no-results") {
        setError("No smartphones match your search.");
      }
    } catch {
      setProducts([]);
      setError("Unable to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRecommendations() {
    if (isLoading || isRecommending || products.length < 3) {
      return;
    }

    setIsRecommending(true);
    setError("");

    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          model: selectedModel,
          products: products.map((product) => ({
            id: product.id,
            title: product.model,
            brand: product.brand,
            priceINR: product.priceINR,
            rating: product.rating,
            description: `${product.processor}, ${product.ram}GB RAM, ${product.storage}GB storage`,
            tags: [product.processor, product.mainCamera],
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Recommendation request failed.");
      }

      const data = (await response.json()) as RecommendationResponse;
      const recommendations = data.recommendations;

      if (!recommendations || recommendations.length !== 3) {
        throw new Error("The recommendation response was invalid.");
      }

      setRecommendations(
        new Map(
          recommendations.map((recommendation) => [
            recommendation.productId,
            {
              reason: recommendation.reason,
              matchScore: recommendation.matchScore,
            },
          ]),
        ),
      );

      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );
      const selectedProducts = recommendations.map((recommendation) =>
        productsById.get(recommendation.productId),
      );

      if (selectedProducts.some((product) => product === undefined)) {
        throw new Error("The recommendation response was invalid.");
      }

      const uniqueProducts = new Set(
        selectedProducts.map((product) => product?.id),
      );

      if (uniqueProducts.size !== 3) {
        throw new Error("The recommendation response was invalid.");
      }

      setProducts(selectedProducts as Product[]);
      setResultsVersion((version) => version + 1);
    } catch {
      setError("Unable to generate recommendations. Please try again.");
    } finally {
      setIsRecommending(false);
    }
  }
  return (
    <main className="shopping-shell">
      <div className="shopping-page">
        <header className="hero-header">
          <p className="eyebrow"><span className="eyebrow-dot" /> Personal shopping intelligence</p>
          <h1>AI Shopping Agent</h1>
          <p className="hero-copy">Find the right phone for the way you live, work, play, and create.</p>
        </header>

        <SearchControls
          isLoading={isLoading}
          isRecommending={isRecommending}
          onClear={handleClear}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          query={query}
        />

        {isLoading && (
          <section aria-label="Loading products" className="skeleton-grid">
            {Array.from({ length: 6 }, (_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </section>
        )}

        {isRecommending && (
          <p className="ai-status"><span className="ai-status-orbit" /> AI is analyzing your results...</p>
        )}

        {error && (
          <div className="error-message" role="alert">
            <span className="error-icon">!</span>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && hasSearched && products.length >= 3 && (
          <RecommendationToolbar
            defaultModel={defaultModel}
            isRecommending={isRecommending}
            model={selectedModel}
            onModelChange={setSelectedModel}
            onRecommend={handleRecommendations}
          />
        )}

        {!isLoading && products.length > 0 && (
          <section className="results-section" aria-live="polite">
            <ResultsHeader
              budget={budget}
              count={products.length}
              intentLabel={intentLabel}
            />
            <div className="product-grid">
              {products.map((product, index) => (
                <ProductCard
                  aiRecommendation={recommendations.get(product.id)}
                  index={index}
                  intent={searchIntent}
                  key={`${product.id}-${resultsVersion}`}
                  onSelect={setSelectedProduct}
                  product={product}
                />
              ))}
            </div>
          </section>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">⌕</span>
            <p>Search for a phone, preference, or budget to begin.</p>
          </div>
        )}
      </div>
      {selectedProduct && (
        <ProductDetailModal
          aiRecommendation={recommendations.get(selectedProduct.id)}
          intent={searchIntent}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}
    </main>
  );
}
