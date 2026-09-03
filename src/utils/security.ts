/**
 * Security & Input Validation Utilities
 * Enforces HTTPS, input sanitization, and URL security without exposing sensitive secrets.
 */
export class SecurityUtils {
  static sanitizeString(input: string): string {
    if (!input) return '';
    return input.replace(/[<>\"'`]/g, '').trim();
  }

  static isValidUrl(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return url.startsWith('http://') || url.startsWith('https://');
    }
  }

  static isHttps(url: string): boolean {
    return url.startsWith('https://');
  }

  static sanitizeSearchQuery(query: string): string {
    return query
      .replace(/[^\p{L}\p{N}\s\-_:.]/gu, '')
      .trim()
      .substring(0, 100);
  }
}
