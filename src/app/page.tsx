"use client";

import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface DeviceData {
  mouseName: string;
  batteryLevel: number;
  isCharging: boolean;
  currentDpi: string | number;
  pollingRate: string;
}

export default function Home() {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const parseAndSetData = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      setDeviceData((prev) => {
        if (
          prev &&
          prev.mouseName === data.mouseName &&
          prev.batteryLevel === data.batteryLevel &&
          prev.isCharging === data.isCharging &&
          prev.currentDpi === data.currentDpi &&
          prev.pollingRate === data.pollingRate
        ) {
          return prev;
        }
        return {
          mouseName: data.mouseName || "SteelSeries Rival 650 Wireless",
          batteryLevel: data.batteryLevel ?? 88,
          isCharging: data.isCharging ?? false,
          currentDpi: data.currentDpi || 1600,
          pollingRate: data.pollingRate || "1000 Hz",
        };
      });
      setError(null);
    } catch (err) {
      console.error("Failed to parse device info JSON:", err);
      setError(typeof err === "string" ? err : "Failed to parse device data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    invoke<string>("get_mouse_info")
      .then((jsonStr) => parseAndSetData(jsonStr))
      .catch((err) => {
        console.error("Failed to fetch on mount:", err);
        setError(typeof err === "string" ? err : "Failed to fetch device info");
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
    <div className="mx-auto max-w-4xl space-y-6 py-10 select-none">
      <h1 className="px-1 text-lg font-medium">Device Information</h1>

      {error && (
        <div className="alert alert-error text-sm" role="alert">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border-base-300 bg-base-100 space-y-2 rounded-xl border p-5">
          <div className="text-base-content/50 text-xs font-medium tracking-wider uppercase">
            Model
          </div>
          <div className="text-base font-semibold">
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : deviceData ? (
              deviceData.mouseName
            ) : (
              "No device detected"
            )}
          </div>
        </div>

        <div className="border-base-300 bg-base-100 space-y-2 rounded-xl border p-5">
          <div className="text-base-content/50 text-xs font-medium tracking-wider uppercase">
            Battery Status
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold">
              {loading ? "..." : deviceData ? `${deviceData.batteryLevel}%` : "N/A"}
            </span>
            <span
              className={`text-xs font-medium ${
                deviceData?.isCharging ? "text-amber-500" : "text-emerald-500"
              }`}
            >
              {deviceData?.isCharging ? "Charging" : "Connected"}
            </span>
          </div>
          <div className="bg-base-300 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                deviceData?.isCharging ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${loading ? 0 : (deviceData?.batteryLevel ?? 0)}%` }}
            ></div>
          </div>
        </div>

        <div className="border-base-300 bg-base-100 space-y-2 rounded-xl border p-5">
          <div className="text-base-content/50 text-xs font-medium tracking-wider uppercase">
            Sensitivity
          </div>
          <div className="text-base font-semibold">
            {loading ? "..." : deviceData ? `${deviceData.currentDpi} DPI` : "N/A"}
          </div>
        </div>

        <div className="border-base-300 bg-base-100 space-y-2 rounded-xl border p-5">
          <div className="text-base-content/50 text-xs font-medium tracking-wider uppercase">
            Polling Rate
          </div>
          <div className="text-base font-semibold">
            {loading ? "..." : (deviceData?.pollingRate ?? "N/A")}
          </div>
        </div>
      </div>
    </div>
  );
}
