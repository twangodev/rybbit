export class SecurityValidator {
  private static readonly DANGEROUS_PATTERNS = [
    /script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /<\s*iframe/i,
    /<\s*object/i,
    /<\s*embed/i,
    /<\s*link/i,
    /<\s*meta/i,
    /<\s*style/i,
  ];

  static sanitizeString(value: string): string {
    if (!value || typeof value !== "string") {
      return "";
    }

    // Remove null bytes
    value = value.replace(/\0/g, "");

    // Remove control characters except tab, newline, and carriage return
    value = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(value)) {
        console.warn(`Potentially dangerous content detected: ${value.substring(0, 100)}`);
        return "";
      }
    }

    return value.trim();
  }

  static validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  static validateDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain) && domain.length <= 253;
  }

  static validateFileSignature(buffer: Buffer, filename: string): boolean {
    // Check if file is actually a CSV based on content
    const csvSignatures = [
      Buffer.from([0xEF, 0xBB, 0xBF]), // UTF-8 BOM
      Buffer.from("sep="),              // Excel CSV separator
    ];

    // Check for CSV-like content (basic heuristic)
    const firstLine = buffer.subarray(0, 1024).toString("utf-8").split("\n")[0];
    const hasCommas = firstLine.includes(",");
    const hasHeaders = /^[a-zA-Z_][a-zA-Z0-9_,\s"]*$/.test(firstLine);

    return hasCommas && hasHeaders;
  }
}
