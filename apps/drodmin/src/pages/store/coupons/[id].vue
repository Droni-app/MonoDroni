<script setup lang="ts">
import { useRoute } from 'vue-router'
import { DuiAlert } from '@dronico/droni-kit'
import { useFetchItem } from '../../../composables/useFetchItem'
import PageHeader from '../../../components/ui/PageHeader.vue'
import StoreCouponForm from '../../../components/store/StoreCouponForm.vue'
import type { StoreCoupon } from '../../../types/AppiService'

const route = useRoute()
const { item: coupon, error } = useFetchItem<StoreCoupon>(`/admin/store/coupons/${route.params.id}`)
</script>

<template>
  <PageHeader :title="coupon ? `Cupón ${coupon.code}` : 'Editar cupón'" back="/store/coupons" />
  <DuiAlert v-if="error" color="danger">{{ error }}</DuiAlert>
  <StoreCouponForm v-else-if="coupon" :coupon="coupon" />
  <p v-else class="text-slate-500">Cargando...</p>
</template>
