import logging
from datetime import timedelta
from typing import List

from django.conf import settings
from django.utils import timezone
from django.db.models import Count, F
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, NotFound, Throttled, ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.models import Image, TwitterUser, USERNAME_LENGTH
from api.serializers import ImageSerializer, TwitterUserSerializer
from api.throttle import FetchThrottle, StandardThrottle
from lib.relevance import sort_users_by_best_match
from lib.scrape import Scraper
from lib.twitter import TwitterErrorNotFound, TwitterRateLimit

logger = logging.getLogger(__name__)


class ImageAPI(ReadOnlyModelViewSet):
    RESCRAPE_TIME = timedelta(hours=4)
    throttle_classes = [StandardThrottle]

    queryset = Image.objects.select_related("user")
    serializer_class = ImageSerializer
    filter_backends = [OrderingFilter]
    ordering_fields = "__all__"
    ordering = ["-tweeted_at"]

    def filter_queryset(self, queryset):
        qs = super().filter_queryset(queryset)
        username = self.request.query_params.get(
            "username",
            "",
        ).strip()[:USERNAME_LENGTH]

        if username:
            qs = qs.filter(user__username__iexact=username)

        return qs

    def list(self, request, *args, **kwargs):
        username = request.query_params.get("username", "").strip()[:USERNAME_LENGTH]

        # If a username was provided, try rescraping their timeline first if needed
        if username:
            user: TwitterUser | None = None

            try:
                user: TwitterUser = TwitterUser.objects.get(username__iexact=username)
            except TwitterUser.DoesNotExist:
                pass

            # Searching directly for a user should update their hit count. Checking the page
            # number avoids counting multiple hits if paginating. Yes, this is abusable, but
            # it doesn't need to be very accurate
            if user and request.query_params.get("page", "1") == "1":
                TwitterUser.objects.filter(pk=user.pk).update(
                    num_hits=F("num_hits") + 1
                )

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
        username = request.query_params.get("username", "").strip()[:USERNAME_LENGTH]

        if not username:
            raise ValidationError(
                {"username": "username query param is missing or empty"}
            )

        user: TwitterUser | None = None

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


class TwitterUserAPI(ReadOnlyModelViewSet):
    throttle_classes = [StandardThrottle]

    queryset = TwitterUser.objects.annotate(image_count=Count("image"))
    serializer_class = TwitterUserSerializer

    def list(self, request, *args, **kwargs):
        is_exact = request.query_params.get("exact", "0") == "1"
        search = request.query_params.get("search", "").strip()[:USERNAME_LENGTH]
        sort = request.query_params.get("sort", "newest")

        qs = self.filter_queryset(self.get_queryset())

        if search:
            if is_exact:
                qs = qs.filter(username__iexact=search)
            else:
                qs = qs.filter(username__icontains=search)

        if sort == "popular":
            qs = qs.order_by("-num_hits")
        elif sort == "newest":
            qs = qs.order_by("-id")
        elif sort == "oldest":
            qs = qs.order_by("id")

        page = self.paginate_queryset(qs)
        results = list(page) if page is not None else list(qs)

        if sort == "match":
            results = sort_users_by_best_match(results, search)

        if page is not None:
            serializer = self.get_serializer(results, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)
