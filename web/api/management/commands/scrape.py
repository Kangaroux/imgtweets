from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError

from api.models import Photo, TwitterUser
from lib.twitter import TwitterAPI, TwitterMediaType


class Command(BaseCommand):
    help = "Scrapes photos from a user's timeline"

    def add_arguments(self, parser):
        parser.add_argument(
            "-c",
            "--count",
            type=int,
            default=50,
            help="The max number of tweets to scrape.",
        )
        parser.add_argument(
            "-t",
            "--token",
            default=settings.TWITTER_API_TOKEN,
            help="The twitter API token. Defaults to the TWITTER_API_TOKEN env.",
        )
        parser.add_argument(
            "username",
            help="The twitter username to scrape.",
        )

    def handle(self, username: str, count: int, token: str, **options):
        if not username:
            raise CommandError("Username cannot be empty.")
        elif count < 1 or count > 100:
            raise CommandError("Count must be between [1, 100].")
        elif not token:
            raise CommandError(
                "Twitter API token is missing. Please provide it with the --token option, "
                "or set the TWITTER_API_TOKEN environment variable."
            )

        t = TwitterAPI(token)
        u = t.get_user_by_username(username)
        tweets, _ = t.get_user_media_tweets(u.id, limit=count)

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
