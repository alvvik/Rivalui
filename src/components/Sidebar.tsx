"use client";
import { Gauge, House } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    id: 0,
    icon: <House className="size-5 shrink-0" />,
    label: "Home",
    href: "/",
  },
  {
    id: 1,
    icon: <Gauge className="size-5 shrink-0" />,
    label: "DPI",
    href: "/dpi",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="bg-base-200 text-base-content border-base-300 flex h-full w-48 shrink-0 flex-col gap-4 border-r p-4 shadow-lg">
      <div className="border-base-300 flex items-center gap-2 border-b px-2 py-3 text-2xl font-black">
        <h1 className="text-primary">RivalUI</h1>
      </div>
      <ul className="menu w-full grow gap-1.5 p-0">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-content shadow-md" : "hover:bg-base-300"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
