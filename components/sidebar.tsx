"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Car,
  BarChart3,
  Tag,
  Users,
  MessageSquare,
  FileText,
  Settings,
  Star,
  FolderCheck,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    { href: "/dashboard", icon: BarChart3, title: "Dashboard", exact: true },
    { href: "/dashboard/cars", icon: Car, title: "Cars" },
    { href: "/dashboard/brands", icon: Tag, title: "Brands" },
    { href: "/dashboard/features", icon: Star, title: "Features" },
    { href: "/dashboard/members", icon: Users, title: "Members" },
    { href: "/dashboard/sell-listings", icon: FileText, title: "Sell Listings" },
    { href: "/service", icon: FolderCheck, title: "Services" },
    { href: "/dashboard/tickets", icon: MessageSquare, title: "Support Tickets" },
    { href: "/dashboard/settings", icon: Settings, title: "Settings" },
  ]

  return (
    <div
      className={cn("relative pb-12 w-64", className)}
      style={{
        backgroundImage: `url('https://wallpaper.dog/large/20704072.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90 z-0" />

      {/* Sidebar Content */}
      <div className="relative z-10 space-y-4 py-4 text-white">
        <div className="px-4 py-2">
          {/* Replace the h2 with a logo image */}
          <div className="mb-4 pt-2 pb-2">
            <img 
              src="https://res.cloudinary.com/dunssu2gi/image/upload/v1744565990/blog-images/tbwfs89mvh5u8vt1mz4a.png" // Replace this with the actual path to your logo image
              alt="Car Admin Logo"
              className="h-20 w-auto mx-auto" // Adjust the height/width of the logo as needed
            />
          </div>
          
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[0.75rem]  font-medium transition-all hover:bg-white/10",
                  {
                    "bg-white/10 text-white": route.exact
                      ? pathname === route.href
                      : pathname.startsWith(route.href),
                  },
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
