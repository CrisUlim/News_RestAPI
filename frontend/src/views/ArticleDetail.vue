<template>
  <div class="article-detail">
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else-if="!article" class="alert alert-warning">
      Article not found.
    </div>
    <div v-else>
      <h1>{{ article.title }}</h1>
      <div class="mb-3 text-muted">
        Category: {{ article.category_name }} | 
        Author: {{ article.author_name }} | 
        Published: {{ new Date(article.created_at).toLocaleDateString() }}
      </div>

      <div v-if="article.image" class="mb-4">
        <img :src="getImageUrl(article.image)" class="img-fluid" alt="Article image">
      </div>

      <div class="content mb-4">
        {{ article.content }}
      </div>

      <div v-if="isOwner" class="mb-4">
        <router-link :to="'/edit-article/' + article.slug" class="btn btn-primary mr-2">
          Edit
        </router-link>
        <button @click="deleteArticle" class="btn btn-danger">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ArticleDetail',
  data() {
    return {
      article: null,
      loading: true
    }
  },
  computed: {
    isOwner() {
      if (!this.article || !this.$store.getters.isAuthenticated) {
        return false
      }
      const user = this.$store.getters.getUser
      return user && user.id === this.article.author
    }
  },
  created() {
    this.fetchArticle()
  },
  methods: {
    getImageUrl(imageUrl) {
      if (!imageUrl) return '';
      if (imageUrl.startsWith('http')) return imageUrl;
      return `http://localhost:8000${imageUrl}`;
    },
    fetchArticle() {
      const slug = this.$route.params.slug
      axios.get(`/api/articles/${slug}/`)
        .then(response => {
          this.article = response.data
          this.loading = false
        })
        .catch(error => {
          console.error('Error fetching article:', error)
          this.loading = false
        })
    },
    deleteArticle() {
      if (confirm('Are you sure you want to delete this article?')) {
        this.$store.dispatch('deleteArticle', this.article.slug)
          .then(() => {
            this.$router.push('/')
          })
          .catch(error => {
            console.error('Error deleting article:', error)
          })
      }
    }
  }
}
</script> 