import { productQueryKeys } from '../../constants/query-keys'

// TODO: connect to React Query useQuery with id.
export function useProductById(id: string) {
  return { queryKey: productQueryKeys.byId(id) }
}