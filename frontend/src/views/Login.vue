<template>
  <div class="login">
    <h1 class="mb-4">Login</h1>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="success" class="alert alert-success">{{ success }}</div>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="username">Username</label>
        <input
          type="text"
          id="username"
          v-model="username"
          class="form-control"
          required
          :disabled="loading"
        >
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="password"
          class="form-control"
          required
          :disabled="loading"
        >
      </div>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      <div class="mt-3">
        Don't have an account? <router-link to="/register">Register</router-link>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: null,
      success: null
    }
  },
  created() {
    // If redirected from register, show success message
    if (this.$route.query.registered) {
      this.success = 'Registration successful! Please log in.'
    }
    
    // If user is already logged in, redirect to home
    if (this.$store.getters.isAuthenticated) {
      this.$router.push('/')
    }
  },
  methods: {
    login() {
      // Reset messages
      this.error = null
      this.success = null
      this.loading = true
      
      this.$store.dispatch('login', {
        username: this.username,
        password: this.password
      })
        .then(() => {
          this.loading = false
          if (this.$route.query.redirect) {
            this.$router.push(this.$route.query.redirect)
          } else {
            this.$router.push({ path: '/', query: { welcome: 'true' } })
          }
        })
        .catch(error => {
          // Handle different error types
          if (error.response) {
            // Server responded with a status code outside of 2xx range
            if (error.response.data.detail) {
              this.error = error.response.data.detail
            } else if (error.response.data) {
              // Format error messages from API response
              const errorMessages = []
              
              for (const field in error.response.data) {
                if (Array.isArray(error.response.data[field])) {
                  errorMessages.push(error.response.data[field].join(' '))
                } else {
                  errorMessages.push(`${field}: ${error.response.data[field]}`)
                }
              }
              
              this.error = errorMessages.join('. ') || 'Invalid login credentials'
            } else {
              this.error = 'Authentication failed. Please try again.'
            }
          } else if (error.request) {
            // Request was made but no response received
            this.error = 'No response from server. Please check your connection.'
          } else {
            // Something else caused the error
            this.error = 'An error occurred. Please try again.'
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.login {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}
</style> 