import { BasePayload, ScriptConfig, TrackingPayload, WebVitalsData } from './types.js';
import { findMatchingPattern } from './utils.js';

export class Tracker {
  private config: ScriptConfig;
  private customUserId: string | null = null;

  constructor(config: ScriptConfig) {
    this.config = config;
    this.loadUserId();
  }

  private loadUserId(): void {
    try {
      const storedUserId = localStorage.getItem('rybbit-user-id');
      if (storedUserId) {
        this.customUserId = storedUserId;
      }
    } catch (e) {
      // localStorage not available
    }
  }

  createBasePayload(): BasePayload | null {
    const url = new URL(window.location.href);
    let pathname = url.pathname;

    // Handle hash-based SPA routing
    if (url.hash && url.hash.startsWith('#/')) {
      pathname = url.hash.substring(1);
    }

    // Check skip patterns
    if (findMatchingPattern(pathname, this.config.skipPatterns)) {
      return null;
    }

    // Apply mask patterns
    const maskMatch = findMatchingPattern(pathname, this.config.maskPatterns);
    if (maskMatch) {
      pathname = maskMatch;
    }

    const payload: BasePayload = {
      site_id: this.config.siteId,
      hostname: url.hostname,
      pathname: pathname,
      querystring: this.config.trackQuerystring ? url.search : '',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      language: navigator.language,
      page_title: document.title,
      referrer: document.referrer,
    };

    if (this.customUserId) {
      payload.user_id = this.customUserId;
    }

    // Include API key if configured
    if (this.config.apiKey) {
      payload.api_key = this.config.apiKey;
    }

    return payload;
  }

  async sendTrackingData(payload: TrackingPayload): Promise<void> {
    try {
      await fetch(`${this.config.analyticsHost}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors',
        keepalive: true,
      });
    } catch (error) {
      console.error('Failed to send tracking data:', error);
    }
  }

  track(
    eventType: TrackingPayload['type'],
    eventName: string = '',
    properties: Record<string, any> = {}
  ): void {
    if (eventType === 'custom_event' && (!eventName || typeof eventName !== 'string')) {
      console.error('Event name is required and must be a string for custom events');
      return;
    }

    const basePayload = this.createBasePayload();
    if (!basePayload) {
      return; // Skip tracking
    }

    const payload: TrackingPayload = {
      ...basePayload,
      type: eventType,
      event_name: eventName,
      properties: eventType === 'custom_event' || eventType === 'outbound'
        ? JSON.stringify(properties)
        : undefined,
    };

    this.sendTrackingData(payload);
  }

  trackPageview(): void {
    this.track('pageview');
  }

  trackEvent(name: string, properties: Record<string, any> = {}): void {
    this.track('custom_event', name, properties);
  }

  trackOutbound(url: string, text: string = '', target: string = '_self'): void {
    this.track('outbound', '', { url, text, target });
  }

  trackWebVitals(vitals: WebVitalsData): void {
    const basePayload = this.createBasePayload();
    if (!basePayload) {
      return;
    }

    const payload: TrackingPayload = {
      ...basePayload,
      type: 'performance',
      event_name: 'web-vitals',
      ...vitals,
    };

    this.sendTrackingData(payload);
  }

  identify(userId: string): void {
    if (typeof userId !== 'string' || userId.trim() === '') {
      console.error('User ID must be a non-empty string');
      return;
    }
    
    this.customUserId = userId.trim();
    try {
      localStorage.setItem('rybbit-user-id', this.customUserId);
    } catch (e) {
      console.warn('Could not persist user ID to localStorage');
    }
  }

  clearUserId(): void {
    this.customUserId = null;
    try {
      localStorage.removeItem('rybbit-user-id');
    } catch (e) {
      // localStorage not available
    }
  }

  getUserId(): string | null {
    return this.customUserId;
  }
}