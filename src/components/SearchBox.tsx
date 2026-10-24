interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="search">
      <label htmlFor="job-search" className="sr-only">
        Search your jobs
      </label>
      <input
        id="job-search"
        type="search"
        placeholder="Search by company, role, location or notes"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchBox;