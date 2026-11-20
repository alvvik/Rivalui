"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
const isValidHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);
export default function ReactiveColour() {
  const [color, setColor] = useState("#ff0000");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const savedColor = localStorage.getItem("reactiveColour");
        if (savedColor && isValidHex(savedColor)) setColor(savedColor);
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

  const applyColor = async () => {
    if (!isValidHex(color)) {
      setErrorMsg("Enter a valid HEX color, e.g. #ff0000.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSaved(false);

    try {
      await invoke("set_mouse_colors", {
        topColor: color,
        middleColor: color,
        bottomColor: color,
      });
      localStorage.setItem("reactiveColour", color);
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
        <h1 className="px-1 text-lg font-medium">Reactive Colour</h1>
        <p className="text-base-content/60 px-1 pt-1 text-sm">
          Set the colour of the mouse&apos;s reactive lighting.
        </p>
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
