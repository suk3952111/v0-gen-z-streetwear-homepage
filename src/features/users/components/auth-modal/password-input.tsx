"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps {
  name: "password" | "passwordConfirm"
  label: string
  placeholder: string
  disabled: boolean
  showPasswordLabel: string
  hidePasswordLabel: string
}

export function PasswordInput({
  name,
  label,
  placeholder,
  disabled,
  showPasswordLabel,
  hidePasswordLabel,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div>
      <label className="block text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          className="w-full bg-transparent text-white text-base py-2.5 border-b-4 border-[#CCFF00] focus:outline-none focus:border-white placeholder:text-[#444444] transition-colors pr-10"
          required
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-[#CCFF00] hover:text-white transition-colors"
          aria-label={isVisible ? hidePasswordLabel : showPasswordLabel}
        >
          {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
