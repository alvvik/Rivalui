"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

const pollingRates = [125, 250, 500, 1000];

export default function Home() {
  const [activeRate, setActiveRate] = useState<number>(1000);
  const [loading, setLoading] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRateChange = async (rate: number) => {
    setErrorMsg(null);
    setLoading(rate);
    try {
      await invoke("set_polling_rate", { pollingRate: rate.toString() });
      setActiveRate(rate);
    } catch (err) {
      console.error("Failed to set polling rate:", err);
      const errStr = typeof err === "string" ? err : JSON.stringify(err);
      setErrorMsg(errStr);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10 select-none">
      <h1 className="px-1 text-lg font-medium">Polling Rate</h1>

      {errorMsg && (
        <div className="alert alert-error text-sm">
          <span>Error setting polling rate: {errorMsg}</span>
        </div>
      )}

      <div className="border-base-300 bg-base-100 space-y-6 rounded-lg border p-6">
        <div className="space-y-3">
          <label className="text-base-content/60 text-xs font-medium tracking-wider uppercase">
            Select Polling Rate
          </label>
          <div className="grid grid-cols-4 gap-2">
            {pollingRates.map((rate) => {
              const isActive = rate === activeRate;
              const isLoading = rate === loading;
              return (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  disabled={isLoading}
                  className={`rounded-md border p-3 text-center transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-content font-medium"
                      : "border-base-300 bg-base-100 hover:bg-base-200"
                  }`}
                >
                  <div className="text-xs opacity-80">
                    {isLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      `${rate} Hz`
                    )}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold">
                    {rate === 125 ? "8ms" : rate === 250 ? "4ms" : rate === 500 ? "2ms" : "1ms"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-base-200 space-y-2 border-t pt-4">
          <label className="text-base-content/60 text-xs font-medium tracking-wider uppercase">
            Current Setting
          </label>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{activeRate}</span>
            <span className="text-base-content/60 text-sm">Hz</span>
          </div>
        </div>
      </div>
    </div>
  );
}
