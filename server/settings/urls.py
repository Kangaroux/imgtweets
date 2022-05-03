from api.views import ImageAPI, TwitterUserAPI
from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

r: routers.BaseRouter

if settings.DEBUG:
    r = routers.DefaultRouter(trailing_slash=False)
else:
    r = routers.SimpleRouter(trailing_slash=False)

r.register(r"images", ImageAPI)
r.register(r"users", TwitterUserAPI)

urlpatterns = [
    path("api/", include(r.urls)),
    path("admin/", admin.site.urls),
]
