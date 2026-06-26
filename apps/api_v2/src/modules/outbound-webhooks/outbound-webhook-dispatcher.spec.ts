import { afterEach, describe, expect, it, vi } from "vitest";
import { OutboundWebhookDispatcher } from "./outbound-webhook-dispatcher.js";

describe("OutboundWebhookDispatcher", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("aborts slow webhook requests", async () => {
    vi.useFakeTimers();

    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string | URL | Request, init?: RequestInit) => {
        const signal = init?.signal;
        return new Promise((_resolve, reject) => {
          signal?.addEventListener("abort", () => {
            reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
          });
        });
      }),
    );

    const dispatch = new OutboundWebhookDispatcher().send({
      url: "https://example.com/webhook",
      headers: {},
      rawBody: "{}",
    });
    const expectedTimeout = expect(dispatch).rejects.toThrow(
      "Webhook request timed out",
    );

    await vi.advanceTimersByTimeAsync(10_000);

    await expectedTimeout;
  });

  it("does not read unbounded webhook response bodies", async () => {
    let pulls = 0;
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls += 1;
        if (pulls > 10) {
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode("x".repeat(1000)));
      },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(body, {
            status: 500,
          }),
        ),
      ),
    );

    const result = await new OutboundWebhookDispatcher().send({
      url: "https://example.com/webhook",
      headers: {},
      rawBody: "{}",
    });

    expect(result).toEqual({
      status: 500,
      bodySnippet: "x".repeat(2000),
    });
    expect(pulls).toBeLessThan(10);
  });
});
