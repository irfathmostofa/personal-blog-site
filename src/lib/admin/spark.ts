export type SparkPoint = {
  key: string;
  label: string;
  value: number;
};

export const DAY_MS = 86_400_000;

export function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function utcDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function emptySpark(days: number): SparkPoint[] {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end.getTime() - (days - 1 - index) * DAY_MS);
    return { key: utcDayKey(date), label: utcDayLabel(date), value: 0 };
  });
}

export function fillSpark(days: number, timestamps: string[]): SparkPoint[] {
  const series = emptySpark(days);
  const index = new Map(series.map((point, i) => [point.key, i]));
  for (const stamp of timestamps) {
    const key = stamp.slice(0, 10);
    const i = index.get(key);
    if (i !== undefined) series[i].value += 1;
  }
  return series;
}
