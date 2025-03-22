from django.shortcuts import render
from rest_framework import viewsets, permissions, parsers, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Article
from .serializers import CategorySerializer, ArticleSerializer, UserSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny

# Create your views here.

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    
    # Add filtering and ordering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'author', 'published']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']  # Default ordering is newest first
    
    def perform_create(self, serializer):
        # Print debug information
        print(f"User in request: {self.request.user}")
        print(f"Is user authenticated: {self.request.user.is_authenticated}")
        serializer.save(author=self.request.user)
