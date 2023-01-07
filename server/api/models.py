from django.db import models


USERNAME_LENGTH = 15


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class TwitterUser(BaseModel):
    last_scraped_at = models.DateTimeField(null=True)
    profile_image_url = models.CharField(max_length=255)
    twitter_id = models.CharField(max_length=20, unique=True)

    num_hits = models.IntegerField(
        default=0,
        help_text="Number of times this user has been searched for.",
    )
    num_scrapes = models.IntegerField(
        default=0,
        help_text="Number of times this user's images have been scraped.",
    )

    # Usernames can change, so if possible avoid using this as the lookup
    # for the user
    username = models.CharField(max_length=USERNAME_LENGTH, unique=True)

    def __str__(self):
        return self.username


class Image(BaseModel):
    key = models.CharField(
        max_length=50,
        unique=True,
        help_text="The media key of the image (twitter ID).",
    )
    nsfw = models.BooleanField()
    url = models.CharField(max_length=255)
    user = models.ForeignKey(TwitterUser, on_delete=models.CASCADE)
    tweet_id = models.CharField(max_length=20)
    tweeted_at = models.DateTimeField()

    @property
    def tweet_url(self):
        return f"https://twitter.com/{self.user.username}/status/{self.tweet_id}"

    def __str__(self):
        return f"{self.user.username}({self.key})"
