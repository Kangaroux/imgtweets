from django.contrib import admin

from api.models import Image, TwitterUser


@admin.register(Image)
class TwitterMediaAdmin(admin.ModelAdmin):
    pass


@admin.register(TwitterUser)
class TwitterUserAdmin(admin.ModelAdmin):
    pass
