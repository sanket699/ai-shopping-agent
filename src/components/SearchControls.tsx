"use client";

import SearchInput from "@/components/SearchInput";

type SearchControlsProps = {
  query: string;
  isLoading: boolean;
  isRecommending: boolean;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onClear: () => void;
};

export default function SearchControls({
  query,
  isLoading,
  isRecommending,
  onQueryChange,
  onSearch,
  onClear,
}: SearchControlsProps) {
  return (
    <div className="search-panel">
      <SearchInput
        onChange={onQueryChange}
        onSubmit={onSearch}
        value={query}
      />
      <button
        className="clear-button"
        disabled={isLoading || isRecommending}
        onClick={onClear}
        type="button"
      >
        Clear
      </button>
    </div>
  );
}
