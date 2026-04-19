"use client";

import * as React from "react";
import { DeviceMobile as SmartphoneIcon, DeviceTablet as TabletIcon, Monitor as MonitorIcon, ArrowsOut as MaximizeIcon } from "@phosphor-icons/react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DeviceSize } from "@/components/collect/device-frame";

const ITEMS: { id: DeviceSize; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: "mobile", icon: SmartphoneIcon, label: "Mobile" },
  { id: "tablet", icon: TabletIcon, label: "Tablet" },
  { id: "desktop", icon: MonitorIcon, label: "Desktop" },
  { id: "fill", icon: MaximizeIcon, label: "Fill" },
];

export function DeviceSizeToggle({
  value,
  onChange,
}: {
  value: DeviceSize;
  onChange: (v: DeviceSize) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={value}
      onValueChange={(v) => {
        if (!v) return;
        onChange(v as DeviceSize);
      }}
      data-testid="device-toggle"
    >
      {ITEMS.map((it) => {
        const Icon = it.icon;
        return (
          <ToggleGroupItem
            key={it.id}
            value={it.id}
            aria-label={it.label}
            className="h-7 gap-1 px-2 text-[10px]"
          >
            <Icon className="size-3.5" />
            <span className="hidden lg:inline">{it.label}</span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
