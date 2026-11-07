import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10 select-none">
      <div>
        <h1 className="px-1 text-lg font-medium">About</h1>
        <p className="text-base-content/60 px-1 pt-1 text-sm">
          Read information about the application and author.
        </p>
      </div>
      <div className="border-base-300 bg-base-100 space-y-2 rounded-xl border p-5">
        <div className="text-base-content/50 text-xs font-medium tracking-wider uppercase">
          Author
        </div>
        <div>
          <Link
            href="https://github.com/alvvik"
            className="bg-primary text-primary-content hover:bg-primary/90 focus-visible:outline-primary flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm"
            target="_blank"
            rel="noreferrer"
          >
            Alvv
            <span aria-hidden="true">
              <SquareArrowOutUpRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
