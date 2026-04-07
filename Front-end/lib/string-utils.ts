export function capitalizeFirstLetter(str: string): string {
  if (!str) {
    return str; // Handles empty strings
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toLowerCaseAndReplaceSpacesWithHyphens(str: string): string {
  return str.toLowerCase()
            .replace(/\s+/g, '-')
            .replace("á", "a")
            .replace("é", "e")
            .replace("í", "i")
            .replace("ó", "o")
            .replace("ú", "u")
            .replace(/[^a-z0-9-]/g, '');
}

export function toLowerCaseAndReplaceHyphensWithSpaces(str: string | undefined): string {
  if (!str) {
    return ""; // Handles undefined or empty strings
  }
  return str.toLowerCase()
            .replace(/-/g, ' ')
            .replace("á", "a")
            .replace("é", "e")
            .replace("í", "i")
            .replace("ó", "o")
            .replace("ú", "u")
            .replace(/[^a-z0-9-]/g, '');
}

export function normalizeSearchText(str: string | undefined): string {
  if (!str) {
    return "";
  }

  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}