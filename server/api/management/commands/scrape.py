from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from lib.scrape import Scraper


class Command(BaseCommand):
    help = "Scrapes images from a user's timeline"

    def add_arguments(self, parser):
        parser.add_argument(
            "-c",
            "--count",
            type=int,
            default=settings.SCRAPE_COUNT,
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
        if not token:
            raise CommandError(
                "Twitter API token is missing. Please provide it with the --token option, "
                "or set the TWITTER_API_TOKEN environment variable."
            )

        scraper = Scraper(token)
        scraper.scrape_timeline(count=count, username=username)
