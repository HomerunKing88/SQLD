// D-day 계산
export function daysUntil(examDate: string, now: Date = new Date()): number | null {
  if (!examDate) return null;
  const target = new Date(examDate + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function ddayLabel(days: number | null): string {
  if (days === null) return "시험일 미설정";
  if (days === 0) return "D-DAY";
  if (days > 0) return `D-${days}`;
  return `D+${Math.abs(days)}`;
}
