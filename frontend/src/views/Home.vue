<template>
  <div class="home">
    <div v-if="isAuthenticated && showWelcome" class="alert alert-success alert-dismissible fade show" role="alert">
      Welcome to the News Site! You are now logged in and can create articles, comment, and more.
      <button type="button" class="close" @click="hideWelcome" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Latest News</h1>
      <div v-if="isAuthenticated">
        <router-link to="/create-article" class="btn btn-primary">Create New Article</router-link>
      </div>
    </div>
    
    <!-- Category Quick Links -->
    <div class="category-badges mb-4">
      <h5>Browse by Category:</h5>
      <div class="d-flex flex-wrap">
        <router-link 
          v-for="category in categories" 
          :key="category.id" 
          :to="`/category/${category.slug}`"
          class="badge badge-pill badge-primary mr-2 mb-2 py-2 px-3"
        >
          {{ category.name }}
        </router-link>
      </div>
    </div>
    
    <!-- Filtering and Sorting Options -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <div class="form-group">
              <label for="categoryFilter">Filter by Category</label>
              <select v-model="filters.category" @change="applyFilters" class="form-control" id="categoryFilter">
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group">
              <label for="searchFilter">Search Articles</label>
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
          <div class="col-md-4">
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
      No articles found. Try adjusting your filters.
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
              <router-link :to="`/category/${getCategorySlug(article.category)}`" class="badge badge-secondary">
                {{ article.category_name }}
              </router-link> 
              | By {{ article.author_name }} | {{ formatDate(article.created_at) }}
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
  name: 'Home',
  data() {
    return {
      loading: true,
      showWelcome: false,
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
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
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
    getCategorySlug(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.slug : '';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    hideWelcome() {
      this.showWelcome = false;
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
    // Check if user just logged in using route query
    if (this.$route.query.welcome === 'true') {
      this.showWelcome = true;
      // Remove the query parameter
      this.$router.replace({ query: null });
    }
    
    // Load categories before articles
    this.$store.dispatch('fetchCategories')
      .then(() => {
        // Apply initial filters
        return this.applyFilters();
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
        this.loading = false;
      });
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
.category-badges .badge {
  font-size: 0.9rem;
  transition: all 0.3s ease;
}
.category-badges .badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
</style> 