import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Categories from '../views/Categories.vue'
import CategoryArticles from '../views/CategoryArticles.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import ArticleForm from '../views/ArticleForm.vue'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories
  },
  {
    path: '/category/:slug',
    name: 'CategoryArticles',
    component: CategoryArticles
  },
  {
    path: '/articles/:slug',
    name: 'ArticleDetail',
    component: ArticleDetail
  },
  {
    path: '/create-article',
    name: 'CreateArticle',
    component: ArticleForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-article/:slug',
    name: 'EditArticle',
    component: ArticleForm,
    meta: { requiresAuth: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guestOnly)) {
    if (store.getters.isAuthenticated) {
      next({ name: 'Home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 