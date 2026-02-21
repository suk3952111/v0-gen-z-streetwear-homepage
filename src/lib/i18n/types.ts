export type Locale = "EN" | "KR"

export type MessageLeaf = string

export type MessageNode = {
  [key: string]: MessageLeaf | MessageNode
}

