export type AccountTab = "profile" | "addresses" | "orders"

export type AccountTranslator = (
  key: string,
  vars?: Record<string, string | number>,
) => string

export type AccountProfileFormState = {
  full_name: string
  phone: string
  avatar_url: string
}

export type AccountProfileField = keyof AccountProfileFormState

export type AccountAddressFormState = {
  recipient_name: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  postal_code: string
}

export type AccountAddressField = keyof AccountAddressFormState

export const EMPTY_ACCOUNT_PROFILE_FORM: AccountProfileFormState = {
  full_name: "",
  phone: "",
  avatar_url: "",
}

export const EMPTY_ACCOUNT_ADDRESS_FORM: AccountAddressFormState = {
  recipient_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  postal_code: "",
}
