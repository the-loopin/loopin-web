const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nameFromEmail(value: string): string | null {
  const localPart = value.split("@", 1)[0];
  const words = localPart
    .split(/[._+-]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return null;
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function toDisplayName(
  value: string | null | undefined,
  fallback = "Loopin user",
): string {
  const displayName = value?.trim();

  if (!displayName) {
    return fallback;
  }

  if (EMAIL_PATTERN.test(displayName)) {
    return nameFromEmail(displayName) ?? fallback;
  }

  return displayName;
}
