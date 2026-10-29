"use client";

import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface DeviceData {
  mouseName: string;
  batteryLevel: number;
  currentDpi: string | number;
  pollingRate: string;
}

export default function Home() {
  const [deviceData, setDeviceData] = useState<DeviceData>({
    mouseName: "SteelSeries Rival 650 Wireless",
    batteryLevel: 88,
    currentDpi: 1600,
    pollingRate: "1000 Hz",
  });
  const [loading, setLoading] = useState<boolean>(true);

  const parseAndSetData = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      setDeviceData((prev) => {
        if (
          prev.mouseName === data.mouseName &&
          prev.batteryLevel === data.batteryLevel &&
          prev.currentDpi === data.currentDpi &&
          prev.pollingRate === data.pollingRate
        ) {
          return prev;
        }
        return {
          mouseName: data.mouseName || "SteelSeries Rival 650 Wireless",
          batteryLevel: data.batteryLevel ?? 88,
          currentDpi: data.currentDpi || 1600,
          pollingRate: data.pollingRate || "1000 Hz",
        };
      });
    } catch (err) {
      console.error("Failed to parse device info JSON:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    invoke<string>("get_mouse_info")
      .then((jsonStr) => parseAndSetData(jsonStr))
      .catch((err) => {
        console.error("Failed to fetch on mount:", err);
        setLoading(false);
      });

    const unlistenPromise = listen<string>("mouse-state-changed", (event) => {
      parseAndSetData(event.payload);
    });

    const interval = setInterval(() => {
      invoke<string>("get_mouse_info")
        .then((jsonStr) => parseAndSetData(jsonStr))
        .catch((err) => console.error("Background fetch failed:", err));
    }, 2000);

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
      clearInterval(interval);
    };
  }, [parseAndSetData]);

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6 select-none">
      <h1 className="text-lg font-medium px-1">Device Information</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-base-300 bg-base-100 space-y-2">
          <div className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
            Model
          </div>
          <div className="text-base font-semibold">
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              deviceData.mouseName
            )}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-base-300 bg-base-100 space-y-2">
          <div className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
            Battery Status
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold font-mono">
              {loading ? "..." : `${deviceData.batteryLevel}%`}
            </span>
            <span className="text-xs text-emerald-500 font-medium">
              Connected
            </span>
          </div>
          <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${loading ? 0 : deviceData.batteryLevel}%` }}
            ></div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-base-300 bg-base-100 space-y-2">
          <div className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
            Sensitivity
          </div>
          <div className="text-base font-semibold font-mono">
            {loading ? "..." : `${deviceData.currentDpi} DPI`}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-base-300 bg-base-100 space-y-2">
          <div className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
            Polling Rate
          </div>
          <div className="text-base font-semibold font-mono">
            {loading ? "..." : deviceData.pollingRate}
          </div>
        </div>
      </div>
    </div>
  );
}
