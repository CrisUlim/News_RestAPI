# Generated by Django 4.2 on 2025-03-18 20:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news_api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='slug',
            field=models.SlugField(max_length=500, unique=True),
        ),
    ]
