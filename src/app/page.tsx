import { loadHomeProductsAction } from "@/features/products/actions/load-home-products"
import { HomeView } from "@/features/products/components/home"

export default async function HomePage() {
  const initial = await loadHomeProductsAction()
  return <HomeView initialProducts={initial.data} />
}
