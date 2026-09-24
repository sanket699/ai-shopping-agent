"use client";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function SearchInput({
  value,
  onChange,
  onSubmit,
}: SearchInputProps) {
  return (
    <form
      className="search-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="sr-only" htmlFor="shopping-query">
        What are you shopping for?
      </label>
      <input
        className="search-input"
        id="shopping-query"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Try: best camera phone under ₹30k"
        type="text"
        value={value}
      />
      <button
        className="search-button"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}