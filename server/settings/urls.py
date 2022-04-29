from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from api.views import ImageAPI, TwitterUserAPI

api_router = routers.DefaultRouter(trailing_slash=False)
api_router.register(r"images", ImageAPI)
api_router.register(r"users", TwitterUserAPI)

urlpatterns = [
    path("api/", include(api_router.urls)),
    path("admin/", admin.site.urls),
]
