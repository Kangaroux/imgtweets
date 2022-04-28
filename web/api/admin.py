from django.contrib import admin
from .models import Photo, TwitterUser


@admin.register(Photo)
class TwitterMediaAdmin(admin.ModelAdmin):
    pass


@admin.register(TwitterUser)
class TwitterUserAdmin(admin.ModelAdmin):
    pass
