<template>
  <div class="article-form">
    <h1>{{ isEditing ? 'Edit Article' : 'Create New Article' }}</h1>
    <div v-if="error" class="alert alert-danger" v-html="error"></div>
    <form @submit.prevent="submitForm" enctype="multipart/form-data">
      <div class="form-group">
        <label for="title">Title</label>
        <input
          type="text"
          id="title"
          v-model="article.title"
          @input="updateSlug"
          class="form-control"
          required
        >
      </div>
      <div class="form-group">
        <label for="slug">Slug</label>
        <input
          type="text"
          id="slug"
          v-model="article.slug"
          class="form-control"
          required
          :disabled="autoGenerateSlug"
        >
        <div class="form-check mt-1">
          <input type="checkbox" class="form-check-input" id="autoSlug" v-model="autoGenerateSlug">
          <label class="form-check-label" for="autoSlug">Auto-generate from title</label>
        </div>
      </div>
      <div class="form-group">
        <label for="category">Category</label>
        <select
          id="category"
          v-model="article.category"
          class="form-control"
          required
        >
          <option value="">Select a category</option>
          <option 
            v-for="category in categories" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="content">Content</label>
        <textarea
          id="content"
          v-model="article.content"
          class="form-control"
          rows="10"
          required
        ></textarea>
      </div>
      <div class="form-group">
        <label for="image">Image</label>
        <input
          type="file"
          id="image"
          @change="handleImageUpload"
          class="form-control-file"
          accept="image/*"
        >
        <div v-if="article.image && typeof article.image === 'string'" class="mt-2">
          <img :src="getImageUrl(article.image)" class="img-thumbnail" style="max-height: 200px" alt="Article image">
        </div>
      </div>
      <div class="form-group">
        <label for="published">Publication Status</label>
        <select
          id="published"
          v-model="article.published"
          class="form-control"
        >
          <option :value="true">Published</option>
          <option :value="false">Draft</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save Article' }}
      </button>
      <router-link to="/" class="btn btn-secondary ml-2">Cancel</router-link>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ArticleForm',
  data() {
    return {
      article: {
        title: '',
        slug: '',
        content: '',
        category: '',
        image: null,
        published: true
      },
      loading: false,
      error: null,
      autoGenerateSlug: true
    }
  },
  computed: {
    isEditing() {
      return this.$route.name === 'EditArticle'
    },
    categories() {
      return this.$store.getters.getCategories
    }
  },
  created() {
    this.$store.dispatch('fetchCategories')
    
    if (this.isEditing) {
      this.fetchArticle()
    }
  },
  methods: {
    getImageUrl(imageUrl) {
      if (!imageUrl) return '';
      if (imageUrl.startsWith('http')) return imageUrl;
      return `http://localhost:8000${imageUrl}`;
    },
    handleImageUpload(event) {
      this.article.image = event.target.files[0] || null;
    },
    generateSlug(title) {
      if (!title) return '';
      
      // Convert to lowercase, replace spaces with hyphens, remove special characters
      let slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with a single one
        .trim();
      
      // No length limitation now - the database can handle longer slugs
      return slug;
    },
    updateSlug() {
      if (this.autoGenerateSlug) {
        this.article.slug = this.generateSlug(this.article.title);
      }
    },
    fetchArticle() {
      const slug = this.$route.params.slug
      this.loading = true
      
      axios.get(`/api/articles/${slug}/`, {
        headers: {
          'Authorization': `JWT ${this.$store.state.token}`
        }
      })
        .then(response => {
          this.article = {
            title: response.data.title,
            slug: response.data.slug,
            content: response.data.content,
            category: response.data.category,
            image: response.data.image,
            published: response.data.published
          }
        })
        .catch(error => {
          console.error('Error fetching article:', error)
          this.error = 'Failed to load article'
        })
        .finally(() => {
          this.loading = false
        })
    },
    submitForm() {
      this.loading = true
      this.error = null
      
      // Validate category is a valid integer
      if (!this.article.category) {
        this.error = "Please select a category"
        this.loading = false
        return
      }
      
      // Create FormData for handling file uploads
      const formData = new FormData()
      formData.append('title', this.article.title)
      formData.append('slug', this.article.slug)
      formData.append('content', this.article.content)
      formData.append('category', this.article.category)
      formData.append('published', this.article.published)
      
      // Log what's being sent
      console.log('Sending form data:', {
        title: this.article.title,
        slug: this.article.slug,
        content: this.article.content.substring(0, 20) + '...',
        category: this.article.category,
        published: this.article.published,
        hasImage: !!this.article.image
      })
      
      if (this.article.image && this.article.image instanceof File) {
        formData.append('image', this.article.image)
      }
      
      if (this.isEditing) {
        axios.put(`/api/articles/${this.$route.params.slug}/`, formData, {
          headers: {
            'Authorization': `JWT ${this.$store.state.token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
          .then(() => {
            this.$router.push(`/articles/${this.article.slug}`)
          })
          .catch(error => {
            this.handleError(error)
          })
          .finally(() => {
            this.loading = false
          })
      } else {
        axios.post('/api/articles/', formData, {
          headers: {
            'Authorization': `JWT ${this.$store.state.token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
          .then(response => {
            console.log('Article created successfully:', response.data)
            this.$router.push('/')
          })
          .catch(error => {
            console.error('Error creating article:', error.response ? error.response.data : error.message)
            this.handleError(error)
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    handleError(error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Format specific field errors
          const errorMessages = [];
          for (const field in errorData) {
            if (Array.isArray(errorData[field])) {
              errorMessages.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${errorData[field].join(' ')}`);
            } else if (typeof errorData[field] === 'string') {
              errorMessages.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${errorData[field]}`);
            }
          }
          this.error = errorMessages.join('<br>');
        } else {
          this.error = 'Failed to save article. Please try again.';
        }
      } else if (error.message) {
        this.error = `Error: ${error.message}`;
      } else {
        this.error = 'Failed to save article. Please try again.';
      }
      console.error('Article submission error:', error);
    }
  }
}
</script> 