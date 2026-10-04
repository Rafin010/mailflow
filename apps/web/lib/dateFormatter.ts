export function formatDate(isoDate: string, timezone: string): string {
  try {
    const d = new Date(isoDate);
    // basic formatting
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: timezone,
    }).format(d);
  } catch (e) {
    return isoDate;
  }
}
