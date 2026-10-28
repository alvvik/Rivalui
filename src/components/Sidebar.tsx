"use client";
import { House } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    id: 0,
    icon: <House className="size-5 shrink-0" />,
    label: "Home",
    href: "/",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-full flex-col bg-base-200 text-base-content w-48 p-4 gap-4 shadow-lg shrink-0 border-r border-base-300">
      <div className="px-2 py-3 text-2xl font-black flex items-center gap-2 border-b border-base-300">
        <h1 className="text-primary ">RivalUI</h1>
      </div>
      <ul className="menu w-full grow gap-1.5 p-0">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-content shadow-md"
                    : "hover:bg-base-300"
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
