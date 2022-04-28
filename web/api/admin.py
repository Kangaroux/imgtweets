from django.contrib import admin
from .models import TwitterMedia, TwitterUser


@admin.register(TwitterMedia)
class TwitterMediaAdmin(admin.ModelAdmin):
    pass


@admin.register(TwitterUser)
class TwitterUserAdmin(admin.ModelAdmin):
    pass
