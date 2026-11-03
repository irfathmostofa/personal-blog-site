import type { SparkPoint } from "@/lib/admin/spark";
import { cn } from "@/lib/utils";

export function Sparkline({
  points,
  label,
  empty,
  className,
}: {
  points: SparkPoint[];
  label: string;
  empty: string;
  className?: string;
}) {
  const max = Math.max(0, ...points.map((point) => point.value));
  const total = points.reduce((sum, point) => sum + point.value, 0);

  if (total === 0) {
    return (
      <p className="flex min-h-40 items-center text-sm leading-relaxed text-muted-foreground">
        {empty}
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="flex h-40 items-end gap-1"
        role="img"
        aria-label={label}
      >
        {points.map((point) => {
          const height = max === 0 ? 0 : Math.max(6, (point.value / max) * 100);
          return (
            <div
              key={point.key}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              <span className="sr-only">
                {point.label}: {point.value}
              </span>
              <div
                className="w-full rounded-sm bg-brand/80"
                style={{ height: `${height}%` }}
                title={`${point.label}: ${point.value}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[0.65rem] tracking-wide text-muted-foreground uppercase">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
