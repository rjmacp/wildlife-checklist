interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="sb" role="search">
      <span className="si">🔍</span>
      <input
        type="text"
        placeholder="Search by name, color, type..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="sx" onClick={() => onChange('')} aria-label="Clear search">
          ✕
        </button>
      )}
    </div>
  );
}
