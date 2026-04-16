"use client";

import * as React from "react";
import { useCollectStore } from "@/lib/collect/form-config-store";

const CHANNEL_NAME = "tresta:collect-sync";

export function useCollectSync() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    const echoing = { current: false };

    const unsub = useCollectStore.subscribe((state) => {
      if (echoing.current) return;
      channel.postMessage({ bySlug: state.bySlug });
    });

    channel.onmessage = (event) => {
      const data = event.data as { bySlug?: unknown } | undefined;
      if (!data || typeof data !== "object" || !("bySlug" in data)) return;
      echoing.current = true;
      useCollectStore.setState({
        bySlug: data.bySlug as ReturnType<typeof useCollectStore.getState>["bySlug"],
      });
      queueMicrotask(() => {
        echoing.current = false;
      });
    };

    return () => {
      unsub();
      channel.close();
    };
  }, []);
}
