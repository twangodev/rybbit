import { z } from "zod";
import { SecurityValidator } from "./security.js";

export class DataValidator {
  private static readonly MAX_STRING_LENGTH = 1000;
  private static readonly MAX_URL_LENGTH = 2000;
  private static readonly VALID_LANGUAGES = new Set([
    "en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh", "ar", "hi", "nl", "pl", "tr"
  ]);

  static readonly umamiEventSchema = z.object({
    website_id: z.string().uuid(),
    session_id: z.string().min(1).max(100),
    visit_id: z.string().uuid(),
    event_id: z.string().uuid(),
    hostname: z.string().min(1).max(255).refine(SecurityValidator.validateDomain),
    browser: z.string().max(50),
    os: z.string().max(50),
    device: z.string().max(50),
    screen: z.string().regex(/^\d+x\d+$/).optional(),
    language: z.string().max(10).refine(lang =>
      this.VALID_LANGUAGES.has(lang.toLowerCase().split("-")[0])
    ).optional(),
    country: z.string().length(2).optional(),
    region: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    url_path: z.string().max(this.MAX_URL_LENGTH).refine(path =>
      path.startsWith("/") && !path.includes("..")
    ),
    url_query: z.string().max(this.MAX_URL_LENGTH).optional(),
    referrer_domain: z.string().max(255).refine(domain =>
      !domain || SecurityValidator.validateDomain(domain)
    ).optional(),
    page_title: z.string().max(this.MAX_STRING_LENGTH).transform(SecurityValidator.sanitizeString),
    event_type: z.number().int().min(1).max(2),
    event_name: z.string().max(100).transform(SecurityValidator.sanitizeString).optional(),
    distinct_id: z.string().min(1).max(100),
    created_at: z.string().refine(date => {
      const timestamp = new Date(date);
      return !isNaN(timestamp.getTime()) &&
        timestamp <= new Date() &&
        timestamp >= new Date("2020-01-01");
    }),
  });

  static validateUmamiEvent(event: any): z.infer<typeof DataValidator.umamiEventSchema> {
    return this.umamiEventSchema.parse(event);
  }

  static validateBatch(events: any[]): {
    valid: any[];
    invalid: Array<{ index: number; error: string }>;
  } {
    const valid: any[] = [];
    const invalid: Array<{ index: number; error: string }> = [];

    events.forEach((event, index) => {
      try {
        const validatedEvent = this.validateUmamiEvent(event);
        valid.push(validatedEvent);
      } catch (error) {
        invalid.push({
          index,
          error: error instanceof z.ZodError
            ? error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
            : "error.message"
        });
      }
    });

    return { valid, invalid };
  }
}
