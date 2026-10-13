import { ref, type Ref } from 'vue'
import AppiService, { apiError } from '../services/AppiService'

// Loads a single record for detail/edit pages.
export function useFetchItem<T>(url: string) {
  const item = ref(null) as Ref<T | null>
  const error = ref('')

  async function reload() {
    try {
      const { data } = await AppiService.get<T>(url)
      item.value = data
    } catch (e) {
      error.value = apiError(e, 'No se pudo cargar el registro.')
    }
  }

  reload()
  return { item, error, reload }
}
