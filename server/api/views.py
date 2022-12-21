import logging
import math
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from django.db.models import Count
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, NotFound, Throttled, ValidationError
from rest_framework.filters import BaseFilterBackend, OrderingFilter
from rest_framework.generics import get_object_or_404
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.models import Image, TwitterUser
from api.serializers import ImageSerializer, TwitterUserSerializer
from api.throttle import FetchThrottle, StandardThrottle
from lib.scrape import Scraper
from lib.twitter import TwitterErrorNotFound, TwitterRateLimit

logger = logging.getLogger(__name__)


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
    RESCRAPE_TIME = timedelta(hours=4)
    throttle_classes = [StandardThrottle]

    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    filter_backends = [OrderingFilter]
    ordering_fields = "__all__"
    ordering = ["-tweeted_at"]

    def filter_queryset(self, queryset):
        qs = super().filter_queryset(queryset)
        username = self.request.query_params.get("username", "").strip()

        if username:
            qs = qs.filter(user__username__iexact=username)

        return qs

    def list(self, request, *args, **kwargs):
        username = request.query_params.get("username", "").strip()

        # If a username was provided, try rescraping their timeline first if needed
        if username:
            try:
                user: TwitterUser = TwitterUser.objects.get(username__iexact=username)
            except TwitterUser.DoesNotExist:
                pass

            # Check if the user's timeline should be rescraped
            if user and user.last_scraped_at:
                diff: timedelta = timezone.now() - user.last_scraped_at

                if diff > self.RESCRAPE_TIME:
                    try:
                        logger.info(
                            f"User {user.username} was last scraped at {user.last_scraped_at} "
                            f"({str(diff)} ago), rescraping"
                        )
                        scraper = Scraper(settings.TWITTER_API_TOKEN)
                        scraper.scrape_timeline(
                            count=settings.SCRAPE_COUNT, username=user.username
                        )
                    except:
                        logger.exception(
                            "Caught exception trying to rescrape user %s", user.username
                        )

        return super().list(request, *args, **kwargs)

    @action(detail=False, throttle_classes=[FetchThrottle])
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

        # The fetch API is only meant for an initial scrape. Rescraping is handled
        # by the GET /images API.
        if user and user.last_scraped_at:
            return Response(
                {"message": "User's timeline has already been scraped."}, status=400
            )

        scraper = Scraper(settings.TWITTER_API_TOKEN)

        try:
            tweet_count, image_count, added_count = scraper.scrape_timeline(
                count=settings.SCRAPE_COUNT,
                username=username,
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
    throttle_classes = [StandardThrottle]

    queryset = TwitterUser.objects.annotate(image_count=Count("image")).order_by("id")
    serializer_class = TwitterUserSerializer

    def list(self, request, *args, **kwargs):
        username = request.query_params.get("username", "").strip()

        if username:
            user = get_object_or_404(
                TwitterUser.objects.filter(username__iexact=username)
            )
            serializer = TwitterUserSerializer(user)
            return Response(serializer.data)

        return super().list(request, *args, **kwargs)
