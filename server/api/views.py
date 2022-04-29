from rest_framework.filters import BaseFilterBackend, OrderingFilter
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.models import Photo, TwitterUser
from api.serializers import PhotoSerializer, TwitterUserSerializer


class PhotoUsernameFilter(BaseFilterBackend):
    """
    Filter that allows searching for photos from a specific username.
    Expects a "username" query param. The query is case insensitive and
    does a partial match.
    """

    def filter_queryset(self, request, queryset, view):
        username = request.query_params.get("username", "").strip()

        if username:
            queryset = queryset.filter(user__username__icontains=username)

        return queryset


class RetrieveMultipleMixin(RetrieveModelMixin):
    """
    Mixin that allows retrieving multiple instances at once by specifying
    multiple lookups in the URL. If a single lookup is provided it returns
    just that object. If there are multiple, comma separated lookups, it
    always returns a paginated response.
    """

    def retrieve(self, request, *args, **kwargs):
        lookup = kwargs.get(self.lookup_field)
        lookup_list = list(set([x.strip() for x in lookup.split(",")]))

        # Return multiple results if the request includes multiple lookups
        # e.g. /users/1,2,3
        if len(lookup_list) > 1:
            filter_kwargs = {f"{self.lookup_field}__in": lookup_list}
            qs = self.get_queryset().filter(**filter_kwargs)
            page = self.paginate_queryset(qs)

            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(qs, many=True)
            return Response(serializer.data)

        return super().retrieve(request, *args, **kwargs)


class PhotoAPI(ReadOnlyModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    filter_backends = [PhotoUsernameFilter, OrderingFilter]
    ordering_fields = "__all__"
    ordering = ["-tweet_id"]


class TwitterUserAPI(RetrieveMultipleMixin, ReadOnlyModelViewSet):
    queryset = TwitterUser.objects.all()
    serializer_class = TwitterUserSerializer

    def get_queryset(self):
        return TwitterUser.objects.all().order_by("id")
