"use client";

import { useState, useEffect } from "react";

interface DeviceData {
  mouseName: string;
  batteryLevel: number;
  currentDpi: number;
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

  useEffect(() => {
    async function fetchDeviceInfo() {
      try {
        setLoading(true);
        const res = await fetch("/api/device");
        if (res.ok) {
          const data = await res.json();
          setDeviceData(data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    fetchDeviceInfo();
  }, []);

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
