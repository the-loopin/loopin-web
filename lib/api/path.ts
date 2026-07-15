const SAFE_API_IDENTIFIER =
  /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

export function normalizeApiIdentifier(
  value: string,
  fieldName = "identifier",
): string {
  const normalizedValue = value.trim();

  if (!SAFE_API_IDENTIFIER.test(normalizedValue)) {
    throw new Error(`${fieldName} is invalid.`);
  }

  return normalizedValue;
}

export function encodeApiIdentifier(
  value: string,
  fieldName = "identifier",
): string {
  return encodeURIComponent(
    normalizeApiIdentifier(value, fieldName),
  );
}
