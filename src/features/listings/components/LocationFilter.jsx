import { MapPin } from "lucide-react";

export default function LocationFilter({ value, onChange }) {
  return (
    <div className="relative">
      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      <input
        type="text"
        autoComplete="address-level2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filter by location..."
        aria-label="Filter by location"
        className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-fast ease"
      />
    </div>
  );
}
