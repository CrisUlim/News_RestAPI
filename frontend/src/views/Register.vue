<template>
  <div class="register">
    <h1 class="mb-4">Register</h1>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <form @submit.prevent="register">
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
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="email"
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
        <small class="form-text text-muted">Password must be at least 8 characters long.</small>
      </div>
      <div class="form-group">
        <label for="re_password">Confirm Password</label>
        <input
          type="password"
          id="re_password"
          v-model="re_password"
          class="form-control"
          required
          :disabled="loading"
        >
      </div>
      <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
        <span v-if="loading" class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
      <div class="mt-3">
        Already have an account? <router-link to="/login">Login</router-link>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      re_password: '',
      loading: false,
      error: null
    }
  },
  computed: {
    isFormValid() {
      return this.username && 
             this.email && 
             this.password && 
             this.re_password && 
             this.password === this.re_password && 
             this.password.length >= 8;
    }
  },
  created() {
    // If user is already logged in, redirect to home
    if (this.$store.getters.isAuthenticated) {
      this.$router.push('/')
    }
  },
  methods: {
    register() {
      if (!this.isFormValid) {
        if (this.password !== this.re_password) {
          this.error = 'Passwords do not match'
        } else if (this.password.length < 8) {
          this.error = 'Password must be at least 8 characters long'
        }
        return
      }
      
      this.loading = true
      this.error = null
      
      this.$store.dispatch('register', {
        username: this.username,
        email: this.email,
        password: this.password,
        re_password: this.re_password
      })
        .then(() => {
          this.loading = false
          // Redirect to home with welcome message
          this.$router.push({ path: '/', query: { welcome: 'true' } })
        })
        .catch(error => {
          if (error.response && error.response.data) {
            const errorMessages = []
            
            for (const field in error.response.data) {
              if (Array.isArray(error.response.data[field])) {
                errorMessages.push(error.response.data[field].join(' '))
              } else {
                errorMessages.push(`${field}: ${error.response.data[field]}`)
              }
            }
            
            this.error = errorMessages.join('. ')
          } else if (error.request) {
            this.error = 'No response from server. Please check your connection.'
          } else {
            this.error = 'Failed to register. Please try again.'
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
.register {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}
</style> 