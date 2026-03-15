export type Locale = "EN" | "KR"

export type MessageLeaf = string | readonly string[]

export type MessageNode = {
  [key: string]: MessageLeaf | MessageNode
}
