from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ArticleViewSet, UserViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('articles', ArticleViewSet)
router.register('users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 