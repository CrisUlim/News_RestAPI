import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    articles: [],
    categories: []
  },
  getters: {
    isAuthenticated(state) {
      return state.token !== null
    },
    getArticles(state) {
      return state.articles
    },
    getCategories(state) {
      return state.categories
    },
    getUser(state) {
      return state.user
    }
  },
  mutations: {
    setToken(state, token) {
      state.token = token
    },
    setUser(state, user) {
      state.user = user
    },
    setArticles(state, articles) {
      state.articles = articles
    },
    setCategories(state, categories) {
      state.categories = categories
    },
    clearAuth(state) {
      state.token = null
      state.user = null
    }
  },
  actions: {
    login({ commit }, credentials) {
      return new Promise((resolve, reject) => {
        axios.post('/auth/jwt/create/', credentials)
          .then(response => {
            const token = response.data.access
            localStorage.setItem('token', token)
            commit('setToken', token)
            
            return axios.get('/auth/users/me/', {
              headers: { 'Authorization': `JWT ${token}` }
            })
          })
          .then(response => {
            const user = response.data
            localStorage.setItem('user', JSON.stringify(user))
            commit('setUser', user)
            resolve(user)
          })
          .catch(error => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            commit('clearAuth')
            reject(error)
          })
      })
    },
    register({ dispatch }, userData) {
      return new Promise((resolve, reject) => {
        axios.post('/auth/users/', userData)
          .then(() => {
            const credentials = {
              username: userData.username,
              password: userData.password
            }
            return dispatch('login', credentials)
          })
          .then(user => {
            resolve(user)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    logout({ commit }) {
      return new Promise(resolve => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        commit('clearAuth')
        // Add this to clear auth header for future requests
        delete axios.defaults.headers.common['Authorization']
        resolve()
      })
    },
    fetchArticles({ commit }, params = {}) {
      return new Promise((resolve, reject) => {
        // Build query string from params
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('search', params.search);
        if (params.ordering) queryParams.append('ordering', params.ordering);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        
        axios.get(`/api/articles/${queryString}`)
          .then(response => {
            commit('setArticles', response.data)
            resolve(response.data)
          })
          .catch(error => {
            console.error('Error fetching articles:', error)
            reject(error)
          })
      })
    },
    fetchCategories({ commit }) {
      return axios.get('/api/categories/')
        .then(response => {
          commit('setCategories', response.data)
        })
    },
    createArticle({ state, dispatch }, articleData) {
      return axios.post('/api/articles/', articleData, {
        headers: { 'Authorization': `JWT ${state.token}` }
      })
      .then(() => {
        dispatch('fetchArticles')
      })
    },
    updateArticle({ state, dispatch }, { slug, articleData }) {
      return axios.put(`/api/articles/${slug}/`, articleData, {
        headers: { 'Authorization': `JWT ${state.token}` }
      })
      .then(() => {
        dispatch('fetchArticles')
      })
    },
    deleteArticle({ state, dispatch }, slug) {
      return axios.delete(`/api/articles/${slug}/`, {
        headers: { 'Authorization': `JWT ${state.token}` }
      })
      .then(() => {
        dispatch('fetchArticles')
      })
    }
  }
}) 