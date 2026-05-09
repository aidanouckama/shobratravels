export function formatGroupSize(min: number | null, max: number | null): string {
  if (min && max && min !== max) return `${min}–${max} passengers`;
  const n = max || min;
  if (!n) return "";
  return `${n} passengers`;
}

export function truncateDestinations(destinations: string, max = 3): string {
  const parts = destinations
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
  if (parts.length <= max) return parts.join(", ");
  const extra = parts.length - max;
  return `${parts.slice(0, max).join(", ")} + ${extra} more`;
}
