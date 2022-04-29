from django.db import models


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        abstract = True


class TwitterUser(BaseModel):
    twitter_id = models.CharField(max_length=20, unique=True)

    # Usernames can change, so if possible avoid using this as the lookup
    # for the user
    username = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return self.username


class Photo(BaseModel):
    # The media key of the photo. This is basically the Twitter ID.
    key = models.CharField(max_length=50, unique=True)
    url = models.CharField(max_length=255)
    user = models.ForeignKey(TwitterUser, on_delete=models.CASCADE)
    tweet_id = models.CharField(max_length=20)

    @property
    def tweet_url(self):
        return f"https://twitter.com/{self.user.username}/status/{self.tweet_id}"

    def __str__(self):
        return f"{self.user.username}({self.key})"
