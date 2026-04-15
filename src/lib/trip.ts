export function formatGroupSize(min: number | null, max: number | null): string {
  if (min && max && min !== max) return `${min}–${max} passengers`;
  const n = max || min;
  if (!n) return "";
  return `${n} passengers`;
}
