"use client";

import type { CSSProperties } from "react";

import type { SearchIntent } from "@/services/productService";
import type { Product } from "@/types/product";

type AiRecommendation = {
  reason: string;
  matchScore: number;
};

type ProductCardProps = {
  product: Product;
  intent: SearchIntent;
  aiRecommendation?: AiRecommendation;
  index: number;
  onSelect: (product: Product) => void;
};

const indianCurrency = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  style: "currency",
});

function ProductSpecs({ product, intent }: { product: Product; intent: SearchIntent }) {
  if (intent === "camera") {
    return (
      <div className="spec-list">
        <p><span>📷 Main</span>{product.mainCamera}</p>
        <p><span>📷 Ultrawide</span>{product.ultrawideCamera}</p>
        <p><span>🔭 Telephoto</span>{product.telephotoCamera}</p>
        <p><span>🤳 Selfie</span>{product.selfieCamera}</p>
      </div>
    );
  }

  if (intent === "battery") {
    return (
      <div className="spec-list spec-list-compact">
        <p><span>🔋 Battery</span>{product.batteryCapacity} mAh</p>
        <p><span>⚡ Charging</span>{product.chargingWattage}W</p>
      </div>
    );
  }

  if (intent === "gaming") {
    return (
      <div className="spec-list spec-list-compact">
        <p><span>⚙️ Processor</span>{product.processor}</p>
        <p><span>🧠 RAM</span>{product.ram}GB</p>
        <p><span>💾 Storage</span>{product.storage}GB</p>
      </div>
    );
  }

  return (
    <div className="general-specs">
      <span>{product.processor}</span>
      <span>{product.ram}GB RAM</span>
      <span>{product.displaySize}&quot; display</span>
    </div>
  );
}

export default function ProductCard({
  product,
  intent,
  aiRecommendation,
  index,
  onSelect,
}: ProductCardProps) {
  return (
    <article
      className={`product-card ${aiRecommendation ? "product-card-ai" : ""}`}
      onClick={() => onSelect(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(product);
        }
      }}
      style={{ "--card-delay": `${Math.min(index, 8) * 55}ms` } as CSSProperties}
      tabIndex={0}
    >
      <div className="product-image-wrap">
        {aiRecommendation && <span className="ai-pick-badge">AI PICK</span>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={product.model}
          className="product-image"
          height={320}
          src={product.imageUrl}
          width={520}
        />
      </div>

      <div className="product-card-content">
        <div className="product-heading">
          <p className="product-brand">{product.brand}</p>
          <h2>{product.model}</h2>
        </div>

        <div className="product-price-row">
          <p className="product-price">{indianCurrency.format(product.priceINR)}</p>
          <p className="product-rating"><span>★</span> {product.rating}</p>
        </div>

        <ProductSpecs intent={intent} product={product} />

        {aiRecommendation && (
          <div className="ai-insight">
            <div className="ai-match-row">
              <span>AI Match</span>
              <strong>{aiRecommendation.matchScore}%</strong>
            </div>
            {aiRecommendation.reason && (
              <p className="ai-reason">
                <span>Why AI recommends this</span>
                {aiRecommendation.reason}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
