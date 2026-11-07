import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10 select-none">
      <div>
        <h1 className="text-xl font-bold"> About RivalUI</h1>
        <p className="text-base-content/60 px-1 pt-1 text-sm">
          Lightweight, modern Linux GUI for configuring SteelSeries devices
        </p>
      </div>
      <div className="space-y-4">
        <div className="border-base-300 bg-base-100 space-y-2 rounded-xl border p-5">
          <div className="text-base-content/50 text-xs font-medium tracking-wider uppercase">
            Credits
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">RivalUI developer</div>
              <div className="text-base-content/60 text-xs">Application UI & Tauri integration</div>
            </div>
            <Link
              href="https://github.com/alvvik"
              target="_blank"
              rel="noreferrer"
              className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
            >
              alvv
              <SquareArrowOutUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Rivalcfg developer</div>
              <div className="text-base-content/60 text-xs">Reverse engineering & CLI engine</div>
            </div>
            <Link
              href="https://github.com/flozz"
              target="_blank"
              rel="noreferrer"
              className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
            >
              flozz
              <SquareArrowOutUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="border-base-300 bg-base-100 space-y-3 rounded-xl border p-5">
          <div className="text-base-content/50 text-xs font-medium tracking-wider uppercase">
            Project Links
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              href="https://github.com/alvvik/Rivalui"
              className="bg-primary text-primary-content hover:bg-primary/90 focus-visible:outline-primary flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              Source Code
              <SquareArrowOutUpRight className="ml-auto h-3.5 w-3.5 opacity-70" />
            </Link>

            <Link
              href="https://github.com/alvvik/Rivalui/issues"
              className="bg-base-200 text-base-content hover:bg-base-300 focus-visible:outline-primary border-base-300 flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              Report an Issue
              <SquareArrowOutUpRight className="ml-auto h-3.5 w-3.5 opacity-70" />
            </Link>
          </div>
        </div>
        <div className="border-base-300 bg-base-100 space-y-2 rounded-xl border p-5">
          <div className="text-base-content/50 text-xs font-medium tracking-wider uppercase">
            License
          </div>
          <div>
            <Link
              href="https://raw.githubusercontent.com/alvvik/Rivalui/refs/heads/main/LICENSE"
              className="bg-primary text-primary-content hover:bg-primary/90 focus-visible:outline-primary flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm"
              target="_blank"
              rel="noreferrer"
            >
              MIT License
              <span aria-hidden="true">
                <SquareArrowOutUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
