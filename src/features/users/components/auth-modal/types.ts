export type AuthMode = "LOGIN" | "SIGNUP"

export interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  language?: "EN" | "KR"
}
