from api.models import Image, TwitterUser
from django.contrib import admin


@admin.register(Image)
class TwitterMediaAdmin(admin.ModelAdmin):
    pass


@admin.register(TwitterUser)
class TwitterUserAdmin(admin.ModelAdmin):
    pass
