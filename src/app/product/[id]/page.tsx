import { ProductView } from "@/features/products/components/detail"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  return <ProductView productId={id} />
}
