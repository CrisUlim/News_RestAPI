import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

Vue.config.productionTip = false

// Set base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:8000'

// Add axios interceptors for authentication
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || store.state.token
    if (token) {
      // Ensure we're using the correct token format (JWT instead of Bearer)
      config.headers['Authorization'] = `JWT ${token}`
      console.log('Adding authorization header:', `JWT ${token}`)
    }
    return config
  },
  error => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Redirect to login if 401 Unauthorized
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Response error:', error)
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized, logging out')
      store.dispatch('logout')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app') 