"use client";

import { useCallback, useEffect, useState } from "react";

import type { SearchIntent } from "@/services/productService";
import type { Product } from "@/types/product";

type AiRecommendation = {
  reason: string;
  matchScore: number;
};

type ProductDetailModalProps = {
  product: Product;
  intent: SearchIntent;
  aiRecommendation?: AiRecommendation;
  onClose: () => void;
};

const indianCurrency = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  style: "currency",
});

export default function ProductDetailModal({
  product,
  intent,
  aiRecommendation,
  onClose,
}: ProductDetailModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = useCallback(() => {
    if (isClosing) {
      return;
    }

    setIsClosing(true);
    window.setTimeout(onClose, 180);
  }, [isClosing, onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [requestClose]);

  return (
    <div
      aria-label={`${product.brand} ${product.model} details`}
      aria-modal="true"
      className={`product-modal-backdrop ${isClosing ? "is-closing" : ""}`}
      onClick={requestClose}
      role="dialog"
    >
      <section className="product-modal" onClick={(event) => event.stopPropagation()}>
        <button
          aria-label="Close product details"
          className="modal-close"
          onClick={requestClose}
          type="button"
        >
          ×
        </button>

        <div className="modal-image-panel">
          {aiRecommendation && <span className="ai-pick-badge">AI PICK</span>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={product.model} className="modal-image" src={product.imageUrl} />
        </div>

        <div className="modal-content">
          <p className="product-brand">{product.brand}</p>
          <h2>{product.model}</h2>
          <div className="modal-price-row">
            <p className="product-price">{indianCurrency.format(product.priceINR)}</p>
            <p className="product-rating"><span>★</span> {product.rating} rating</p>
          </div>

          {aiRecommendation && (
            <div className="ai-insight modal-ai-insight">
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

          <div className="detail-section">
            <p className="detail-section-title">Complete specifications</p>
            <div className="detail-spec-grid">
              <p><span>Processor</span>{product.processor}</p>
              <p><span>RAM</span>{product.ram}GB</p>
              <p><span>Storage</span>{product.storage}GB</p>
              <p><span>Display</span>{product.displaySize}&quot;</p>
              <p><span>Battery</span>{product.batteryCapacity} mAh</p>
              <p><span>Charging</span>{product.chargingWattage}W</p>
              <p><span>Main camera</span>{product.mainCamera}</p>
              <p><span>Ultrawide</span>{product.ultrawideCamera}</p>
              <p><span>Telephoto</span>{product.telephotoCamera}</p>
              <p><span>Selfie camera</span>{product.selfieCamera}</p>
              <p><span>Weight</span>{product.weight}g</p>
              <p><span>Search focus</span>{intent}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}