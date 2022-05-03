import logging

from api.models import Image, TwitterUser
from django.db import IntegrityError
from django.utils import timezone
from lib.twitter import TwitterAPI, TwitterMediaType

logger = logging.getLogger(__name__)


class Scraper:
    api: TwitterAPI

    def __init__(self, token: str):
        self.api = TwitterAPI(token)

    def scrape_timeline(self, username: str, count: int):
        """
        Scrapes a user's timeline for images and adds them to the database.

        Returns a 3-tuple with some stats from the scrape:

            - The number of tweets retrieved
            - The number of images found
            - The number of images that were missing and added to the database
        """
        if not username:
            raise ValueError("Username cannot be empty.")
        elif count < TwitterAPI.MIN_RESULTS_LIMIT:
            raise ValueError(f"Count must be at least 1.")

        logger.info(f"Starting to scrape timeline for user '{username}'")
        u = self.api.get_user_by_username(username)
        logger.debug("Lookup user in DB")

        try:
            user = TwitterUser.objects.get(twitter_id=u.id)
            logger.debug("Fetched existing user")
        except TwitterUser.DoesNotExist:
            user = TwitterUser.objects.create(
                profile_image_url=u.profile_image_url,
                twitter_id=u.id,
                username=u.username,
            )
            logger.debug("Created new user")

        # Set this early to try and mitigate simultaneous fetch requests
        user.last_scraped_at = timezone.now()
        user.save()

        tweets = self.api.get_user_media_tweets_auto_paginate(u.id, limit=count)
        logger.debug(f"Found {len(tweets)} tweets")

        if not tweets:
            return

        images = []

        for t in tweets:
            for m in t.media:
                if m.type != TwitterMediaType.Photo:
                    continue

                images.append(
                    Image(
                        key=m.key,
                        tweet_id=t.tweet_id,
                        url=m.url,
                        user=user,
                        tweeted_at=t.created_at,
                    )
                )

        logger.debug(f"Found {len(images)} images")

        added = 0

        for obj in images:
            try:
                obj.save()
                added += 1
            except IntegrityError:
                pass

        logger.debug(f"Added {added} new images")
        logger.info("Finished scraping")

        return (len(tweets), len(images), added)
