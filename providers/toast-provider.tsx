"use client"
import type React from "react"
import { createContext, useState, useContext, useCallback, useEffect } from "react"
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

// Toast status types
type ToastStatus = "success" | "error" | "warning" | "info"

// Toast interface
interface Toast {
  id: string
  message: string
  status: ToastStatus
  timestamp?: Date
  duration?: number
}

// Toast context type
interface ToastContextType {
  addToast: (message: string, status?: ToastStatus, duration?: number) => void
  removeToast: (id: string) => void
}

// Status icon mapping
const STATUS_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

// Status color mapping
const STATUS_COLORS = {
  success: "bg-green-100 text-green-800 border-green-200",
  error: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
}

// Create toast context
const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Check initial load
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Cleanup listener
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const addToast = useCallback((message: string, status: ToastStatus = "info", duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      message,
      status,
      timestamp: new Date(),
      duration,
    }

    setToasts((prevToasts) => [...prevToasts, newToast])

    // Auto remove toast
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} isMobile={isMobile} />
    </ToastContext.Provider>
  )
}

// Toast Container Component
const ToastContainer: React.FC<{
  toasts: Toast[]
  onRemove: (id: string) => void
  isMobile: boolean
}> = ({ toasts, onRemove, isMobile }) => {
  return (
    <div
      className={`
        fixed z-50 
        ${isMobile ? "top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md" : "bottom-4 right-4 w-full max-w-sm"} 
        space-y-2
      `}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} isMobile={isMobile} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Individual Toast Notification Component
const ToastNotification: React.FC<{
  toast: Toast
  onClose: () => void
  isMobile: boolean
}> = ({ toast, onClose, isMobile }) => {
  const { message, status, timestamp } = toast
  const Icon = STATUS_ICONS[status]
  const colorClasses = STATUS_COLORS[status]

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: isMobile ? "-50%" : "50%",
        y: isMobile ? "-50%" : "50%",
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20,
        },
      }}
      exit={{
        opacity: 0,
        scale: 0.5,
        transition: {
          duration: 0.2,
        },
      }}
      className={`
        flex items-center text-[0.75rem] justify-between 
        p-4 rounded-lg shadow-lg 
        ${colorClasses} 
        w-full
        relative
        overflow-hidden
      `}
      role="alert"
    >
      {/* Animated Background Effect */}
      <motion.div
        initial={{ width: "0%" }}
        animate={{
          width: "100%",
          transition: {
            duration: toast.duration ? toast.duration / 1000 : 5,
            ease: "linear",
          },
        }}
        className="absolute bottom-0 left-0 h-1 bg-black/20"
      />

      <div className="flex items-center space-x-3">
        <Icon className="w-4 h-4" />
        <div>
          <p className="font-semibold text-[0.75rem]">{message}</p>
          {timestamp && <p className="text-xs opacity-75 mt-1">{timestamp.toLocaleTimeString()}</p>}
        </div>
      </div>
      <button onClick={onClose} className="ml-4 hover:bg-opacity-20 rounded-full p-1">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
