<template>
  <div class="categories">
    <h1>Categories</h1>
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else-if="categories.length === 0" class="alert alert-info">
      No categories found.
    </div>
    <div v-else class="list-group">
      <div v-for="category in categories" :key="category.id" class="list-group-item d-flex justify-content-between align-items-center">
        <h5>{{ category.name }}</h5>
        <small class="text-muted">Created: {{ new Date(category.created_at).toLocaleDateString() }}</small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Categories',
  data() {
    return {
      loading: true
    }
  },
  computed: {
    categories() {
      return this.$store.getters.getCategories
    }
  },
  created() {
    this.$store.dispatch('fetchCategories')
      .then(() => {
        this.loading = false
      })
      .catch(error => {
        console.error('Error fetching categories:', error)
        this.loading = false
      })
  }
}
</script> 