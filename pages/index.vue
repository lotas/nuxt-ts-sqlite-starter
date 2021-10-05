<template>
  <div>
    Server status: <code class="border text-xs">{{ apiHealth }}</code>
  </div>
</template>

<script lang="ts">
export default {
  async asyncData(ctx) {
    const apiHealth = await ctx.$axios.$get('/api/health')

    return {
      apiHealth
    }
  }
}
</script>
