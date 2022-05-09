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
            "-f",
            "--force",
            action="store_true",
            default=False,
            help="If set, rescrapes all images for the user, not just the most recent ones",
        )
        parser.add_argument(
            "username",
            help="The twitter username to scrape.",
        )

    def handle(self, username: str, count: int, force: bool, **options):
        token = settings.TWITTER_API_TOKEN

        if not token:
            raise CommandError(
                "Twitter API token is missing. Please set the TWITTER_API_TOKEN env."
            )

        scraper = Scraper(token)
        scraper.scrape_timeline(count=count, username=username, only_recent=not force)
