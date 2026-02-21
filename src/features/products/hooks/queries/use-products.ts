import { productQueryKeys } from '../../constants/query-keys'

// TODO: connect to React Query useQuery.
export function useProducts() {
  return { queryKey: productQueryKeys.all }
}