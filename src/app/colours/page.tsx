"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type ZoneId = "top" | "middle" | "bottom";

const zones: { id: ZoneId; label: string; description: string }[] = [
  { id: "top", label: "Top", description: "Top zone" },
  { id: "middle", label: "Middle", description: "Middle zone" },
  { id: "bottom", label: "Bottom", description: "Bottom zone" },
];

const defaultZones: Record<ZoneId, boolean> = {
  top: true,
  middle: true,
  bottom: true,
};

const isValidHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

export default function ColoursPage() {
  const [color, setColor] = useState("#ff0000");
  const [selectedZones, setSelectedZones] = useState(defaultZones);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const savedColor = localStorage.getItem("mouse_color");
        const savedZones = localStorage.getItem("mouse_color_zones");
        if (savedColor && isValidHex(savedColor)) setColor(savedColor);
        if (savedZones) setSelectedZones({ ...defaultZones, ...JSON.parse(savedZones) });
      } catch (error) {
        console.error("Failed to load colour settings", error);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const updateColor = (value: string) => {
    const normalized = value.startsWith("#") ? value : `#${value}`;
    setColor(normalized.slice(0, 7));
    setSaved(false);
    setErrorMsg(null);
  };

  const toggleZone = (zone: ZoneId) => {
    setSelectedZones((current) => ({ ...current, [zone]: !current[zone] }));
    setSaved(false);
  };

  const applyColor = async () => {
    if (!isValidHex(color)) {
      setErrorMsg("Enter a valid HEX color, e.g. #ff0000.");
      return;
    }

    if (!Object.values(selectedZones).some(Boolean)) {
      setErrorMsg("Select at least one zone.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSaved(false);

    try {
      await invoke("set_mouse_colors", {
        topColor: selectedZones.top ? color : null,
        middleColor: selectedZones.middle ? color : null,
        bottomColor: selectedZones.bottom ? color : null,
      });
      localStorage.setItem("mouse_color", color);
      localStorage.setItem("mouse_color_zones", JSON.stringify(selectedZones));
      setSaved(true);
    } catch (error) {
      console.error("Failed to set mouse colour:", error);
      setErrorMsg(typeof error === "string" ? error : JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10 select-none">
      <div>
        <h1 className="px-1 text-lg font-medium">Colours</h1>
        <p className="text-base-content/60 px-1 pt-1 text-sm">Set mouse backlight color.</p>
      </div>

      {errorMsg && (
        <div className="alert alert-error text-sm" role="alert">
          <span>{errorMsg}</span>
        </div>
      )}
      {saved && (
        <div className="alert alert-success text-sm" role="status">
          <span>Color has been applied.</span>
        </div>
      )}

      <div className="border-base-300 bg-base-100 space-y-6 rounded-lg border p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <label
            className="ring-base-300 relative size-28 shrink-0 cursor-pointer overflow-hidden rounded-full border-4 border-white shadow-lg ring-1"
            style={{ backgroundColor: isValidHex(color) ? color : "transparent" }}
            title="Choose color"
          >
            <input
              aria-label="Choose color"
              type="color"
              value={isValidHex(color) ? color : "#000000"}
              onChange={(event) => updateColor(event.target.value)}
              className="absolute size-full cursor-pointer opacity-0"
            />
          </label>

          <div className="w-full space-y-2">
            <label
              htmlFor="hex-color"
              className="text-base-content/60 text-xs font-medium tracking-wider uppercase"
            >
              HEX Color
            </label>
            <input
              id="hex-color"
              type="text"
              value={color}
              maxLength={7}
              onChange={(event) => updateColor(event.target.value)}
              onBlur={() => {
                if (!color.startsWith("#")) updateColor(`#${color}`);
              }}
              className={`input input-bordered w-full uppercase ${!isValidHex(color) ? "input-error" : ""}`}
              placeholder="#ff0000"
              spellCheck={false}
            />
            <p className="text-base-content/50 text-xs">
              Click the circle or enter value manually.
            </p>
          </div>
        </div>

        <div className="border-base-200 space-y-3 border-t pt-5">
          <label className="text-base-content/60 text-xs font-medium tracking-wider uppercase">
            Apply to zones
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            {zones.map((zone) => (
              <label
                key={zone.id}
                className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${
                  selectedZones[zone.id]
                    ? "border-primary bg-primary/10"
                    : "border-base-300 hover:bg-base-200"
                }`}
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={selectedZones[zone.id]}
                  onChange={() => toggleZone(zone.id)}
                />
                <span>
                  <span className="block text-sm font-medium">{zone.label}</span>
                  <span className="text-base-content/50 block text-xs">{zone.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={applyColor}
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? <span className="loading loading-spinner loading-sm" /> : "Apply color"}
        </button>
      </div>
    </div>
  );
}
