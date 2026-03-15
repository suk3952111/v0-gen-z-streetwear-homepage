import { ProductView } from "@/features/products/components/detail"
import { getProductsBySlugs } from "@/features/products/services"
import { createSupabaseServer } from "@/lib/supabase/server"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const products = await getProductsBySlugs(supabase, [id])
  const initialProduct = products[0] ?? null

  return <ProductView productId={id} initialProduct={initialProduct} />
}
