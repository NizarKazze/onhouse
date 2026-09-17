/**
 * One cell of a metadata grid (DATE / VENUE / DOORS / LINE-UP).
 * The grid draws its 1px rules with `gap: 1px` over a light background, so
 * each cell paints its own solid black.
 */
export function MetaCell({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className={`bg-onh-black ${compact ? "p-[14px]" : "px-[16px] py-[18px]"}`}>
      <div className={`onh-meta-label ${compact ? "mb-[8px]" : "mb-[9px]"}`}>
        {label}
      </div>
      <div className={`onh-meta-value ${compact ? "text-[15px]" : "text-[16px]"}`}>
        {value}
      </div>
    </div>
  );
}
