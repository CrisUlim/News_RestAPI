<template>
  <div class="category-articles">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ categoryName }} Articles</h1>
      <div>
        <button @click="$router.go(-1)" class="btn btn-secondary mr-2">Back</button>
        <router-link to="/" class="btn btn-primary">All Categories</router-link>
      </div>
    </div>
    
    <!-- Sorting Options -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="searchFilter">Search in this category</label>
              <input 
                type="text" 
                v-model="filters.search" 
                @input="debounceSearch" 
                class="form-control" 
                id="searchFilter" 
                placeholder="Search by title or content"
              >
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="sortOrder">Sort By</label>
              <select v-model="filters.ordering" @change="applyFilters" class="form-control" id="sortOrder">
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="-title">Title (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-else-if="articles.length === 0" class="alert alert-info">
      No articles found in this category. Try adjusting your search or <router-link to="/">view all articles</router-link>.
    </div>
    <div v-else class="row">
      <div v-for="article in articles" :key="article.id" class="col-md-4 mb-4">
        <div class="card h-100">
          <div v-if="article.image" class="card-img-top">
            <img :src="getImageUrl(article.image)" class="img-fluid" alt="Article image">
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ article.title }}</h5>
            <p class="card-text text-muted">
              By {{ article.author_name }} | {{ formatDate(article.created_at) }}
            </p>
            <p class="card-text">{{ article.content.substring(0, 100) }}...</p>
            <router-link :to="'/articles/' + article.slug" class="btn btn-sm btn-primary">
              Read More
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryArticles',
  data() {
    return {
      loading: true,
      categorySlug: '',
      categoryName: '',
      filters: {
        category: '',
        search: '',
        ordering: '-created_at' // Default to newest first
      },
      searchTimeout: null
    }
  },
  computed: {
    articles() {
      return this.$store.getters.getArticles
    },
    categories() {
      return this.$store.getters.getCategories
    }
  },
  methods: {
    getImageUrl(imageUrl) {
      if (!imageUrl) return '';
      if (imageUrl.startsWith('http')) return imageUrl;
      return `http://localhost:8000${imageUrl}`;
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    loadCategoryInfo() {
      this.categorySlug = this.$route.params.slug;
      const category = this.categories.find(c => c.slug === this.categorySlug);
      
      if (category) {
        this.categoryName = category.name;
        this.filters.category = category.id;
        this.applyFilters();
      } else {
        this.loading = false;
        console.error('Category not found');
      }
    },
    applyFilters() {
      this.loading = true;
      this.$store.dispatch('fetchArticles', this.filters)
        .then(() => {
          this.loading = false;
        })
        .catch(error => {
          console.error('Error applying filters:', error);
          this.loading = false;
        });
    },
    debounceSearch() {
      // Debounce search to avoid too many API calls while typing
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 500);
    }
  },
  created() {
    // Load categories first, then get articles for this category
    this.$store.dispatch('fetchCategories')
      .then(() => {
        this.loadCategoryInfo();
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        this.loading = false;
      });
  },
  // Reload articles when the route changes (different category)
  watch: {
    '$route.params.slug'() {
      this.loadCategoryInfo();
    }
  }
}
</script>

<style scoped>
.card-img-top {
  height: 200px;
  overflow: hidden;
}
.card-img-top img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 