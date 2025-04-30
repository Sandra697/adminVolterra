"use client"

import { useState, useEffect } from "react"
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
  PaintRoller,
  Menu,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }
    
    // Check on initial load
    checkIfMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile)
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const routes = [
    { href: "/dashboard", icon: BarChart3, title: "Dashboard", exact: true },
    { href: "/dashboard/cars", icon: Car, title: "Cars" },
    { href: "/dashboard/brands", icon: Tag, title: "Brands" },
    { href: "/dashboard/features", icon: Star, title: "Features" },
    { href: "/dashboard/members", icon: Users, title: "Members" },
    { href: "/dashboard/sell-listings", icon: FileText, title: "Sell Listings" },
    { href: "/service", icon: FolderCheck, title: "Services" },
    { href: "/service/bookings", icon: PaintRoller, title: "Service Bookings" },
    { href: "/dashboard/tickets", icon: MessageSquare, title: "Support Tickets" },
    { href: "/AdminManagement", icon: Settings, title: "Settings" },
  ]

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile */}
      {isMobile && (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-3 left-3 z-50 bg-gray-600 rounded p-2 text-white md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      
      {/* Completely Fixed Sidebar that doesn't move */}
      <aside
        className={cn(
          // On all devices, it's completely fixed
          "fixed top-0 left-0 h-full w-64 z-40",
          // Translation for mobile only
          isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0",
          "transition-transform duration-300", 
          className
        )}
        style={{
          backgroundImage: `url('https://wallpaper.dog/large/20704072.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90 z-0" />

        {/* Sidebar Content */}
        <div className="relative z-10 h-full overflow-y-auto py-4 text-white">
          <div className="px-4 py-2">
            {/* Logo */}
            <div className="mb-4 pt-2 pb-2">
              <img 
                src="https://res.cloudinary.com/dunssu2gi/image/upload/v1744565990/blog-images/tbwfs89mvh5u8vt1mz4a.png"
                alt="Car Admin Logo"
                className="h-20 w-auto mx-auto"
              />
            </div>
            
            {/* Navigation */}
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-[0.75rem] font-medium transition-all hover:bg-white/10",
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
      </aside>

      {/* Overlay to close sidebar when clicking outside - Only on mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Empty spacer div to push content over on larger screens */}
      <div className="hidden md:block w-64 flex-shrink-0" aria-hidden="true" />
    </>
  )
}