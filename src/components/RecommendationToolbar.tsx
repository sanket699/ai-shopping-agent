"use client";

import { useEffect, useRef, useState } from "react";

type RecommendationToolbarProps = {
  model: string;
  defaultModel: string;
  isRecommending: boolean;
  onModelChange: (model: string) => void;
  onRecommend: () => void;
};

export default function RecommendationToolbar({
  model,
  defaultModel,
  isRecommending,
  onModelChange,
  onRecommend,
}: RecommendationToolbarProps) {
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsModelMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function selectModel(nextModel: string) {
    onModelChange(nextModel);
    setIsModelMenuOpen(false);
  }

  return (
    <div className="recommendation-toolbar">
      <button
        className={`ai-button ${isRecommending ? "is-processing" : ""}`}
        disabled={isRecommending}
        onClick={onRecommend}
        type="button"
      >
        <span className="ai-button-icon">✦</span>
        {isRecommending ? "Analyzing results..." : "Ask AI for Top 3"}
      </button>
      <div className="model-menu" ref={modelMenuRef}>
        <button
          aria-expanded={isModelMenuOpen}
          aria-haspopup="listbox"
          aria-label="Choose AI model"
          className="model-menu-trigger"
          disabled={isRecommending}
          onClick={() => setIsModelMenuOpen((isOpen) => !isOpen)}
          type="button"
        >
          <span aria-hidden="true" className="model-menu-trigger-icon">⚙</span>
          <span aria-hidden="true" className="model-menu-chevron">
            {isModelMenuOpen ? "↑" : "↓"}
          </span>
        </button>
        {isModelMenuOpen && (
          <div aria-label="Available AI models" className="model-menu-list" role="listbox">
            <button
              aria-selected={model === defaultModel}
              className="model-menu-option"
              onClick={() => selectModel(defaultModel)}
              role="option"
              type="button"
            >
              NVIDIA Nemotron 3 Ultra
            </button>
            <button
              aria-disabled="true"
              className="model-menu-option model-menu-option-disabled"
              disabled
              role="option"
              type="button"
            >
              More AI Models — Coming Soon
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
