export default function RenterInfo({ renter }) {
  if (!renter) return null;

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="w-5 h-5 rounded-full bg-surface-secondary overflow-hidden shrink-0">
        {renter.avatar_url ? (
          <img src={renter.avatar_url} alt={renter.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[8px] text-text-secondary">
            {renter.full_name?.[0]}
          </div>
        )}
      </div>
      <span className="text-xs text-text-secondary">{renter.full_name}</span>
    </div>
  );
}
