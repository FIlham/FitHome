type DateInput = Date | string | number | null | undefined;

function toDate(input: DateInput): Date | null {
  if (input == null) return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format created_at / updated_at ke WIB, locale id-ID.
 * Default: "6 Sep 2026" atau "6 Sep 2026, 14.30 WIB"
 * @example formatDate(exercise.created_at) -> "6 Sep 2026"
 * @example formatDateTime(exercise.updated_at) -> "6 Sep 2026, 14.30 WIB"
 */
export function formatDate(input: DateInput, opts?: Intl.DateTimeFormatOptions): string {
  const d = toDate(input);
  if (!d) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
    ...opts,
  }).format(d);
}

export function formatDateTime(input: DateInput, opts?: Intl.DateTimeFormatOptions): string {
  const d = toDate(input);
  if (!d) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    timeZoneName: "short",
    ...opts,
  }).format(d).replace(".", ":").replace("WIB", "WIB");
}

// "06/09/2026" - untuk input form / tabel
export function formatDateShort(input: DateInput): string {
  const d = toDate(input);
  if (!d) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

// "2 jam lalu", "3 hari lalu" - untuk updated_at relatif
export function formatRelative(input: DateInput): string {
  const d = toDate(input);
  if (!d) return "-";
  const now = Date.now();
  const diffMs = now - d.getTime();
  const absMs = Math.abs(diffMs);
  const isPast = diffMs >= 0;

  const sec = Math.round(absMs / 1000);
  if (sec < 60) return isPast ? "baru saja" : "sebentar lagi";
  const min = Math.round(sec / 60);
  if (min < 60) return isPast ? `${min} menit lalu` : `dalam ${min} menit`;
  const hour = Math.round(min / 60);
  if (hour < 24) return isPast ? `${hour} jam lalu` : `dalam ${hour} jam`;
  const day = Math.round(hour / 24);
  if (day < 7) return isPast ? `${day} hari lalu` : `dalam ${day} hari`;
  const week = Math.round(day / 7);
  if (week < 5) return isPast ? `${week} minggu lalu` : `dalam ${week} minggu`;
  return formatDate(d);
}

// Helper khusus agar tidak salah field: pakai untuk created_at / updated_at di Drizzle
export const formatCreatedAt = formatDateTime;
export const formatUpdatedAt = (input: DateInput) => {
  const rel = formatRelative(input);
  // gabung relatif + absolut: "2 jam lalu (6 Sep 2026, 14.30 WIB)"
  const abs = formatDateTime(input);
  if (rel === "-") return "-";
  return `${rel} (${abs})`;
};
