import logging
import math
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, NotFound, Throttled, ValidationError
from rest_framework.filters import BaseFilterBackend, OrderingFilter
from rest_framework.generics import get_object_or_404
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.models import Image, TwitterUser
from api.serializers import ImageSerializer, TwitterUserSerializer
from lib.scrape import Scraper
from lib.twitter import TwitterErrorNotFound, TwitterRateLimit

logger = logging.getLogger(__name__)


class ImageUsernameFilter(BaseFilterBackend):
    """
    This filter allows the client to filter which images to return based on
    the user's username.

    The client can specify at most query param:

        - `username`: Case insensitive exact match
        - `username_like`: Case insensitive contains/includes
    """

    def filter_queryset(self, request, queryset, view):
        username = request.query_params.get("username", "").strip()
        username_like = request.query_params.get("username_like", "").strip()

        if username and username_like:
            raise ValidationError(
                "username and username_like query params are mutually exclusive"
            )

        if username:
            queryset = queryset.filter(user__username__iexact=username)
        elif username_like:
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


class ImageAPI(ReadOnlyModelViewSet):
    # The amount of time before another fetch request can be made for the same user
    FETCH_COOLDOWN = timedelta(minutes=30)
    RESCRAPE_COUNT = 100
    FIRST_SCRAPE_COUNT = 500

    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    filter_backends = [ImageUsernameFilter, OrderingFilter]
    ordering_fields = "__all__"
    ordering = ["-tweeted_at"]

    @action(detail=False)
    def fetch(self, request, pk=None):
        username = request.query_params.get("username", "").strip()

        if not username:
            raise ValidationError(
                {"username": "username query param is missing or empty"}
            )

        user: TwitterUser = None

        try:
            user = TwitterUser.objects.get(username__iexact=username)
        except TwitterUser.DoesNotExist:
            pass

        if user and user.last_scraped_at:
            diff: timedelta = timezone.now() - user.last_scraped_at
            remaining = self.FETCH_COOLDOWN - diff
            sec = math.ceil(remaining.total_seconds())

            if sec > 0:
                msg = (
                    f"The last fetch was too recent. Please wait {sec} seconds "
                    "before trying again."
                )

                return Response(
                    {"message": msg}, status=429, headers={"Retry-After": sec}
                )

        count = self.RESCRAPE_COUNT

        # Increase the count if the user has never been scraped before
        if user and not user.last_scraped_at:
            count = self.FIRST_SCRAPE_COUNT

        scraper = Scraper(settings.TWITTER_API_TOKEN)

        try:
            tweet_count, image_count, added_count = scraper.scrape_timeline(
                username, count
            )
        except TwitterErrorNotFound:
            raise NotFound("Unable to find a user with that username.")
        except TwitterRateLimit:
            raise Throttled(
                detail="Too many requests, please try again in a few minutes."
            )
        except:
            logger.exception("Unexpected error trying to scrape user timeline")
            raise APIException()

        return Response(
            {
                "tweet_count": tweet_count,
                "total_images": image_count,
                "total_new_images": added_count,
            }
        )


class TwitterUserAPI(RetrieveMultipleMixin, ReadOnlyModelViewSet):
    queryset = TwitterUser.objects.all()
    serializer_class = TwitterUserSerializer

    def get_queryset(self):
        return TwitterUser.objects.all().order_by("id")

    def list(self, request, *args, **kwargs):
        username = request.query_params.get("username", "").strip()

        if username:
            user = get_object_or_404(
                TwitterUser.objects.filter(username__iexact=username)
            )
            serializer = TwitterUserSerializer(user)
            return Response(serializer.data)

        return super().list(request, *args, **kwargs)
