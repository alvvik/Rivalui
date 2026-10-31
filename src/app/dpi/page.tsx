"use client";

import { useState, useEffect } from "react";

interface DpiStage {
  id: number;
  dpi: number;
}

const DEFAULT_STAGES: DpiStage[] = [
  { id: 1, dpi: 800 },
  { id: 2, dpi: 1600 },
  { id: 3, dpi: 3200 },
  { id: 4, dpi: 6400 },
];

export default function DpiPage() {
  const [mounted, setMounted] = useState(false);
  const [stages, setStages] = useState<DpiStage[]>(DEFAULT_STAGES);
  const [activeStageId, setActiveStageId] = useState<number>(2);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true);
      try {
        const savedStages = localStorage.getItem("dpi_stages");
        const savedActive = localStorage.getItem("current_stage");
        if (savedStages) {
          setStages(JSON.parse(savedStages));
        }
        if (savedActive) {
          setActiveStageId(Number(savedActive));
        }
      } catch (e) {
        console.error("Failed to load from localStorage", e);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const activeStage = stages.find((s) => s.id === activeStageId) || stages[1];

  const handleDpiChange = (newDpi: number) => {
    const updated = stages.map((s) => (s.id === activeStageId ? { ...s, dpi: newDpi } : s));
    setStages(updated);
    try {
      localStorage.setItem("dpi_stages", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
    // call
  };

  const handleStageSelect = (id: number) => {
    setActiveStageId(id);
    try {
      localStorage.setItem("current_stage", id.toString());
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-10 select-none">
        <h1 className="px-1 text-lg font-medium">Change dpi</h1>
        <div className="border-base-300 bg-base-100 h-64 rounded-lg border p-6 opacity-50"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10 select-none">
      <h1 className="px-1 text-lg font-medium">Change dpi</h1>

      <div className="border-base-300 bg-base-100 space-y-6 rounded-lg border p-6">
        <div className="space-y-3">
          <label className="text-base-content/60 text-xs font-medium tracking-wider uppercase">
            DPI Stages
          </label>
          <div className="grid grid-cols-4 gap-2">
            {stages.map((stage) => {
              const isActive = stage.id === activeStageId;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageSelect(stage.id)}
                  className={`rounded-md border p-3 text-center transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-content font-medium"
                      : "border-base-300 bg-base-100 hover:bg-base-200"
                  }`}
                >
                  <div className="text-xs opacity-80">Stage {stage.id}</div>
                  <div className="mt-0.5 text-sm font-semibold">{stage.dpi}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-base-200 space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Stage {activeStageId} Sensitivity</label>
            <div className="flex items-center gap-1 text-sm">
              <input
                type="number"
                min="100"
                max="16000"
                step="50"
                value={activeStage.dpi}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) handleDpiChange(Math.min(16000, Math.max(100, val)));
                }}
                className="input input-bordered input-sm w-20 text-center"
              />
              <span className="text-base-content/60 text-xs">DPI</span>
            </div>
          </div>

          <input
            type="range"
            min="100"
            max="16000"
            step="50"
            value={activeStage.dpi}
            onChange={(e) => handleDpiChange(parseInt(e.target.value))}
            className="range range-primary range-xs w-full"
          />
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-base-content/60 text-xs font-medium tracking-wider uppercase">
            Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[400, 800, 1200, 1600, 2400, 3200, 6400, 12800].map((preset) => (
              <button
                key={preset}
                onClick={() => handleDpiChange(preset)}
                className={`btn btn-xs ${
                  activeStage.dpi === preset ? "btn-neutral" : "btn-ghost border-base-300 border"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
