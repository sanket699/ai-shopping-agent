"use client";

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
  return (
    <div className="recommendation-toolbar">
      <button
        className={`ai-button ${isRecommending ? "is-processing" : ""}`}
        disabled={isRecommending}
        onClick={onRecommend}
        type="button"
      >
        <span className="ai-button-icon">✦</span>
        {isRecommending ? "Analyzing results..." : "AI Recommendations"}
      </button>
      <label className="sr-only" htmlFor="ai-model">
        Select AI model
      </label>
      <select
        className="model-select"
        disabled={isRecommending}
        id="ai-model"
        onChange={(event) => onModelChange(event.target.value)}
        value={model}
      >
        <option value={defaultModel}>NVIDIA Nemotron 3 Ultra (Free)</option>
        <option disabled value="coming-soon">
          More AI Models — Coming Soon
        </option>
      </select>
    </div>
  );
}
