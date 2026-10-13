import { computed, ref } from 'vue'
import AppiService from '../services/AppiService'
import type { PaginatedResponse } from '../types/AppiService'

// Shared state for every paginated admin list: rows, loading flag, and a
// `pagination` object (`tablePagination` to bind to DuiTable). `params` is re-read on every
// fetch, so filters can be plain refs read inside it.
export function usePaginatedList<T>(url: string | (() => string), params: () => Record<string, unknown> = () => ({})) {
  const rows = ref<T[]>([])
  const loading = ref(false)
  const page = ref(1)
  const perPage = ref(10)
  const total = ref(0)

  async function fetch(newPage = 1) {
    loading.value = true
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params()).filter(([, v]) => v !== '' && v != null)
      )
      const { data } = await AppiService.get<PaginatedResponse<T>>(typeof url === 'function' ? url() : url, {
        params: { page: newPage, ...cleanParams },
      })
      rows.value = data.data
      page.value = data.meta.currentPage
      perPage.value = data.meta.perPage
      total.value = data.meta.total
    } finally {
      loading.value = false
    }
  }

  const pagination = computed(() => ({ page: page.value, perPage: perPage.value, total: total.value }))
  // DuiTable shows "Página 1 de 0" for empty results, so hide its footer then
  const tablePagination = computed(() => (total.value ? pagination.value : undefined))

  return { rows, loading, pagination, tablePagination, fetch }
}
