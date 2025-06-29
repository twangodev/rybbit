import {
  ScriptConfig,
  SessionReplayEvent,
  SessionReplayBatch,
} from "./types.js";

// Import rrweb using require to avoid TypeScript module resolution issues
// @ts-ignore
const rrweb = require("rrweb");

// Define the event type locally since the type import doesn't work
interface RRWebEvent {
  type: number;
  data: any;
  timestamp?: number;
}

export class SessionReplayRecorder {
  private config: ScriptConfig;
  private isRecording: boolean = false;
  private stopRecordingFn?: () => void;
  private userId: string;
  private eventBuffer: SessionReplayEvent[] = [];
  private batchTimer?: number;
  private sendBatch: (batch: SessionReplayBatch) => Promise<void>;

  constructor(
    config: ScriptConfig,
    userId: string,
    sendBatch: (batch: SessionReplayBatch) => Promise<void>
  ) {
    this.config = config;
    this.userId = userId;
    this.sendBatch = sendBatch;
  }

  async initialize(): Promise<void> {
    if (!this.config.enableSessionReplay) {
      return;
    }

    this.startRecording();
  }

  public startRecording(): void {
    if (this.isRecording || !this.config.enableSessionReplay) {
      console.log("[Session Replay] Cannot start recording:", {
        isRecording: this.isRecording,
        enableSessionReplay: this.config.enableSessionReplay,
      });
      return;
    }

    console.log(
      "[Session Replay] Starting recording at",
      new Date().toISOString()
    );
    console.log("[Session Replay] Document ready state:", document.readyState);

    try {
      this.stopRecordingFn = rrweb.record({
        emit: (event: RRWebEvent) => {
          const eventTypeNames = {
            0: "DOMContentLoaded",
            1: "Load",
            2: "FullSnapshot",
            3: "IncrementalSnapshot",
            4: "Meta",
            5: "Custom",
            6: "Plugin",
          };
          const typeName =
            eventTypeNames[event.type as keyof typeof eventTypeNames] ||
            `Unknown(${event.type})`;
          console.log(
            `[Session Replay] Event collected: Type ${event.type} (${typeName}) at ${new Date(event.timestamp || Date.now()).toISOString()}`
          );
          this.addEvent({
            type: event.type,
            data: event.data,
            timestamp: event.timestamp || Date.now(),
          });
        },
        recordCanvas: true, // Record canvas elements
        collectFonts: true, // Collect font info for better replay
        checkoutEveryNms: 30000, // Checkout every 30 seconds
        checkoutEveryNth: 200, // Checkout every 200 events
        maskAllInputs: true, // Mask all input values for privacy
        maskInputOptions: {
          password: true,
          email: true,
        },
        slimDOMOptions: {
          script: false,
          comment: true,
          headFavicon: true,
          headWhitespace: true,
          headMetaDescKeywords: true,
          headMetaSocial: true,
          headMetaRobots: true,
          headMetaHttpEquiv: true,
          headMetaAuthorship: true,
          headMetaVerification: true,
        },
        sampling: {
          // Optional: reduce recording frequency to save bandwidth
          mousemove: false, // Don't record every mouse move
          mouseInteraction: true,
          scroll: 150, // Sample scroll events every 150ms
          input: "last", // Only record the final input value
        },
      });

      this.isRecording = true;
      this.setupBatchTimer();

      console.log("Session replay recording started");
    } catch (error) {
      console.error("Failed to start session replay recording:", error);
    }
  }

  public stopRecording(): void {
    if (!this.isRecording) {
      return;
    }

    if (this.stopRecordingFn) {
      this.stopRecordingFn();
    }

    this.isRecording = false;
    this.clearBatchTimer();

    // Send any remaining events
    if (this.eventBuffer.length > 0) {
      this.flushEvents();
    }

    console.log("Session replay recording stopped");
  }

  public isActive(): boolean {
    return this.isRecording;
  }

  private addEvent(event: SessionReplayEvent): void {
    this.eventBuffer.push(event);
    console.log(
      `[Session Replay] Event added to buffer (${this.eventBuffer.length}/${this.config.sessionReplayBatchSize})`
    );

    // Auto-flush if buffer is full
    if (this.eventBuffer.length >= this.config.sessionReplayBatchSize) {
      console.log(
        `[Session Replay] Buffer full, flushing ${this.eventBuffer.length} events`
      );
      this.flushEvents();
    }
  }

  private setupBatchTimer(): void {
    this.clearBatchTimer();
    this.batchTimer = window.setInterval(() => {
      if (this.eventBuffer.length > 0) {
        console.log(
          `[Session Replay] Timer triggered, flushing ${this.eventBuffer.length} events`
        );
        this.flushEvents();
      }
    }, this.config.sessionReplayBatchInterval);
  }

  private clearBatchTimer(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = undefined;
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    console.log(
      `[Session Replay] Sending batch with ${events.length} events to server`
    );
    console.log(
      `[Session Replay] Event types in batch:`,
      events.map((e) => `Type ${e.type}`).join(", ")
    );
    console.log(
      `[Session Replay] Batch size:`,
      JSON.stringify(events).length,
      "characters"
    );

    const batch: SessionReplayBatch = {
      userId: this.userId,
      events,
      metadata: {
        pageUrl: window.location.href,
        viewportWidth: screen.width,
        viewportHeight: screen.height,
        language: navigator.language,
      },
    };

    try {
      await this.sendBatch(batch);
      console.log(
        `[Session Replay] Successfully sent batch with ${events.length} events`
      );
    } catch (error) {
      console.error("Failed to send session replay batch:", error);
      console.error("Failed batch details:", {
        eventCount: events.length,
        eventTypes: events.map((e) => e.type),
        batchSize: JSON.stringify(batch).length,
        userId: this.userId,
        url: window.location.href,
      });

      // Re-queue the events for retry since this batch failed
      console.log(
        `[Session Replay] Re-queuing ${events.length} failed events for retry`
      );
      this.eventBuffer.unshift(...events);
    }
  }

  // Update user ID when it changes
  public updateUserId(userId: string): void {
    this.userId = userId;
  }

  // Handle page navigation for SPAs
  public onPageChange(): void {
    if (this.isRecording) {
      // Flush current events before page change
      this.flushEvents();
    }
  }

  // Cleanup on page unload
  public cleanup(): void {
    this.stopRecording();
  }
}
