from xml.etree.ElementInclude import include
from django.contrib import admin
from django.urls import path, include

from api.views import PhotoAPI, TwitterUserAPI
from rest_framework import routers

api_router = routers.DefaultRouter(trailing_slash=False)
api_router.register(r"photos", PhotoAPI)
api_router.register(r"users", TwitterUserAPI)

urlpatterns = [
    path("", include(api_router.urls)),
    path("admin/", admin.site.urls),
]
