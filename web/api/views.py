from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.models import Photo, TwitterUser
from api.serializers import PhotoSerializer, TwitterUserSerializer


class PhotoAPI(ReadOnlyModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer


class TwitterUserAPI(ReadOnlyModelViewSet):
    queryset = TwitterUser.objects.all()
    serializer_class = TwitterUserSerializer

    def retrieve(self, request, *args, **kwargs):
        pk = kwargs.get(self.lookup_field)
        pk_list = list(set([x.strip() for x in pk.split(",")]))

        # Return multiple results if the request includes multiple IDs, e.g. /users/1,2,3
        if len(pk_list) > 1:
            qs = self.get_queryset().filter(pk__in=pk_list)
            page = self.paginate_queryset(qs)

            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(qs, many=True)
            return Response(serializer.data)

        return super().retrieve(request, *args, **kwargs)
