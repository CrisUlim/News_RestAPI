from rest_framework import serializers
from .models import Category, Article
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'created_at']

class ArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    author_name = serializers.ReadOnlyField(source='author.username')
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    slug = serializers.SlugField(max_length=500, required=True)

    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'content', 'image', 'category', 'category_name', 
                  'author', 'author_name', 'published', 'created_at', 'updated_at'] 