import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tracker } from './tracking.js';
import { ScriptConfig } from './types.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('Tracker', () => {
  let tracker: Tracker;
  let config: ScriptConfig;
  let mockLocation: any;

  beforeEach(() => {
    // Reset fetch mock
    vi.mocked(global.fetch).mockReset();
    vi.mocked(global.fetch).mockResolvedValue({} as Response);

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock window properties
    mockLocation = {
      href: 'https://example.com/page?query=test',
      hostname: 'example.com',
      pathname: '/page',
      search: '?query=test',
      hash: '',
    };
    
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      configurable: true,
      writable: true,
    });
    
    // Mock URL constructor to use our mockLocation
    global.URL = vi.fn().mockImplementation(() => ({
      hostname: mockLocation.hostname,
      pathname: mockLocation.pathname,
      search: mockLocation.search,
      hash: mockLocation.hash,
    })) as any;

    Object.defineProperty(window, 'innerWidth', {
      value: 1920,
      writable: true,
    });

    Object.defineProperty(window, 'innerHeight', {
      value: 1080,
      writable: true,
    });

    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      writable: true,
    });

    Object.defineProperty(document, 'title', {
      value: 'Test Page',
      writable: true,
    });

    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com',
      writable: true,
    });

    config = {
      analyticsHost: 'https://analytics.example.com',
      siteId: '123',
      debounceDuration: 0,
      autoTrackPageview: true,
      autoTrackSpa: true,
      trackQuerystring: true,
      trackOutbound: true,
      enableWebVitals: false,
      skipPatterns: [],
      maskPatterns: [],
    };

    tracker = new Tracker(config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createBasePayload', () => {
    it('should create base payload with all required fields', () => {
      const payload = tracker.createBasePayload();

      expect(payload).toEqual({
        site_id: '123',
        hostname: 'example.com',
        pathname: '/page',
        querystring: '?query=test',
        screenWidth: 1920,
        screenHeight: 1080,
        language: 'en-US',
        page_title: 'Test Page',
        referrer: 'https://google.com',
      });
    });

    it('should handle hash-based routing', () => {
      mockLocation.hash = '#/dashboard/users';
      const payload = tracker.createBasePayload();
      expect(payload?.pathname).toBe('/dashboard/users');
    });

    it('should skip tracking for matching skip patterns', () => {
      config.skipPatterns = ['/admin/**', '/api/**'];
      tracker = new Tracker(config);
      
      mockLocation.pathname = '/admin/settings';
      const payload = tracker.createBasePayload();
      expect(payload).toBeNull();
    });

    it('should apply mask patterns', () => {
      config.maskPatterns = ['/user/*/profile'];
      tracker = new Tracker(config);
      
      mockLocation.pathname = '/user/123/profile';
      const payload = tracker.createBasePayload();
      expect(payload?.pathname).toBe('/user/*/profile');
    });

    it('should exclude querystring when disabled', () => {
      config.trackQuerystring = false;
      tracker = new Tracker(config);
      
      const payload = tracker.createBasePayload();
      expect(payload?.querystring).toBe('');
    });

    it('should include user ID when set', () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue('user-123');
      tracker = new Tracker(config);
      
      const payload = tracker.createBasePayload();
      expect(payload?.user_id).toBe('user-123');
    });
  });

  describe('tracking methods', () => {
    it('should track pageview', async () => {
      tracker.trackPageview();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://analytics.example.com/track',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"type":"pageview"'),
          mode: 'cors',
          keepalive: true,
        })
      );
    });

    it('should track custom event', async () => {
      tracker.trackEvent('button_click', { button: 'submit' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://analytics.example.com/track',
        expect.objectContaining({
          body: expect.stringContaining('"type":"custom_event"'),
        })
      );

      const body = JSON.parse(vi.mocked(global.fetch).mock.calls[0][1]!.body as string);
      expect(body.event_name).toBe('button_click');
      expect(body.properties).toBe(JSON.stringify({ button: 'submit' }));
    });

    it('should validate custom event name', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      tracker.trackEvent('', {});
      expect(global.fetch).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Event name is required and must be a string for custom events'
      );

      consoleSpy.mockRestore();
    });

    it('should track outbound link', async () => {
      tracker.trackOutbound('https://external.com', 'External Link', '_blank');

      const body = JSON.parse(vi.mocked(global.fetch).mock.calls[0][1]!.body as string);
      expect(body.type).toBe('outbound');
      expect(body.properties).toBe(JSON.stringify({
        url: 'https://external.com',
        text: 'External Link',
        target: '_blank',
      }));
    });

    it('should track web vitals', async () => {
      const vitals = {
        lcp: 2500,
        cls: 0.1,
        inp: 200,
        fcp: 1800,
        ttfb: 800,
      };

      tracker.trackWebVitals(vitals);

      const body = JSON.parse(vi.mocked(global.fetch).mock.calls[0][1]!.body as string);
      expect(body.type).toBe('performance');
      expect(body.event_name).toBe('web-vitals');
      expect(body.lcp).toBe(2500);
      expect(body.cls).toBe(0.1);
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      tracker.trackPageview();
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to send tracking data:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('user identification', () => {
    it('should identify user', () => {
      tracker.identify('user-456');
      
      expect(window.localStorage.setItem).toHaveBeenCalledWith('rybbit-user-id', 'user-456');
      expect(tracker.getUserId()).toBe('user-456');
    });

    it('should validate user ID', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      tracker.identify('');
      expect(window.localStorage.setItem).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('User ID must be a non-empty string');

      consoleSpy.mockRestore();
    });

    it('should clear user ID', () => {
      tracker.identify('user-789');
      tracker.clearUserId();
      
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('rybbit-user-id');
      expect(tracker.getUserId()).toBeNull();
    });

    it('should handle localStorage errors', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(window.localStorage.setItem).mockImplementation(() => {
        throw new Error('Storage full');
      });

      tracker.identify('user-123');
      expect(consoleSpy).toHaveBeenCalledWith('Could not persist user ID to localStorage');

      consoleSpy.mockRestore();
    });
  });
});