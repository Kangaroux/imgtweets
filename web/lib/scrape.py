from django.db import IntegrityError
from web.api.models import Photo, TwitterUser
from web.lib.twitter import TwitterAPI, TwitterMediaType


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

        u = self.api.get_user_by_username(username)
        tweets, _ = self.api.get_user_media_tweets(u.id, limit=count)

        print(f"Found {len(tweets)} tweets")

        if not tweets:
            return

        try:
            user = TwitterUser.objects.get(twitter_id=u.id)
            print("Fetched existing user")
        except TwitterUser.DoesNotExist:
            user = TwitterUser.objects.create(twitter_id=u.id, username=u.username)
            print("Created new user")

        photos = []

        for t in tweets:
            for m in t.media:
                if m.type != TwitterMediaType.Photo:
                    continue

                photos.append(Photo(user=user, key=m.key, url=m.url))

        print(f"Found {len(photos)} photos")

        added = 0

        for obj in photos:
            try:
                obj.save()
                added += 1
            except IntegrityError:
                pass

        print(f"Added {added} photos")
