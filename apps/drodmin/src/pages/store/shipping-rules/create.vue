<script setup lang="ts">
import PageHeader from '../../../components/ui/PageHeader.vue'
import StoreShippingRuleForm from '../../../components/store/StoreShippingRuleForm.vue'
</script>

<template>
  <PageHeader title="Nueva regla de envío" back="/store/shipping-rules" />
  <StoreShippingRuleForm />
</template>
