/**
 * Extracts the first name from a full name string
 * @param fullName - The full name (e.g., "Guilhermo González")
 * @returns The first name, or undefined if cannot extract
 */
export function getFirstName(fullName: string | undefined): string | undefined {
  if (!fullName || typeof fullName !== 'string') {
    return undefined;
  }
  
  const trimmed = fullName.trim();
  if (!trimmed) {
    return undefined;
  }
  
  const parts = trimmed.split(/\s+/);
  return parts[0];
}
