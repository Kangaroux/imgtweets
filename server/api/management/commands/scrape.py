from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from api.models import Image, TwitterUser
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
            help="If set, rescrapes all images for the user, not just the most recent ones.",
        )
        parser.add_argument(
            "-y",
            "--no-input",
            action="store_true",
            default=False,
            help="If set, user input prompts will be skipped.",
        )
        parser.add_argument(
            "username",
            help=(
                'The twitter username to scrape. A wildcard "*" can also be provided to '
                "rescrape all existing users (requires -f flag)."
            ),
        )

    def handle(self, username: str, count: int, force: bool, no_input: bool, **options):
        token = settings.TWITTER_API_TOKEN

        if not token:
            raise CommandError(
                "Twitter API token is missing. Please set the TWITTER_API_TOKEN env."
            )
        elif username == "*" and not force:
            raise CommandError("-f flag must be set when username is a wildcard.")

        scraper = Scraper(token)

        if username == "*":
            usernames = [u.username for u in TwitterUser.objects.only("username").all()]

            if not no_input:
                image_count = Image.objects.count()
                ans = input(
                    f"Are you sure you want to rescrape {len(usernames)} users "
                    f"and {image_count} images? [y/N] "
                )

                if ans not in ("y", "Y"):
                    print("Aborting")
                    return

            for username in usernames:
                scraper.scrape_timeline(
                    count=count, username=username, only_recent=False
                )
        else:
            scraper.scrape_timeline(
                count=count, username=username, only_recent=not force
            )
