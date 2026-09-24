"use client";

type ResultsHeaderProps = {
  count: number;
  intentLabel: string;
  budget?: number;
};

export default function ResultsHeader({
  count,
  intentLabel,
  budget,
}: ResultsHeaderProps) {
  return (
    <div className="results-heading">
      <div>
        <p className="results-kicker">Curated for you</p>
        <h2>{count} {count === 1 ? "phone" : "phones"} found</h2>
      </div>
      <div className="result-filters">
        <span>{intentLabel}</span>
        {budget !== undefined && (
          <span>Under ₹{budget.toLocaleString("en-IN")}</span>
        )}
      </div>
    </div>
  );
}
