import logging

from django.db import IntegrityError

from api.models import Image, TwitterUser
from lib.twitter import TwitterAPI, TwitterMediaType

logger = logging.getLogger(__name__)


class Scraper:
    api: TwitterAPI

    MAX_SCRAPE_COUNT = 100

    def __init__(self, token: str):
        self.api = TwitterAPI(token)

    def scrape_timeline(self, username: str, count: int):
        if not username:
            raise ValueError("Username cannot be empty.")
        elif count < 1 or count > 100:
            raise ValueError(f"Count must be between [1, {self.MAX_SCRAPE_COUNT}].")

        logger.info(f"Starting to scrape timeline for user '{username}'")

        u = self.api.get_user_by_username(username)
        tweets, _ = self.api.get_user_media_tweets(u.id, limit=count)

        logger.debug(f"Found {len(tweets)} tweets")

        if not tweets:
            return

        logger.debug("Lookup user in DB")

        try:
            user = TwitterUser.objects.get(twitter_id=u.id)
            logger.debug("Fetched existing user")
        except TwitterUser.DoesNotExist:
            user = TwitterUser.objects.create(twitter_id=u.id, username=u.username)
            logger.debug("Created new user")

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
