from django.db import models


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class TwitterUser(BaseModel):
    twitter_id = models.CharField(max_length=20, unique=True)
    username = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return self.username


class Photo(BaseModel):
    user = models.ForeignKey(TwitterUser, on_delete=models.CASCADE)
    key = models.CharField(max_length=50, unique=True)
    url = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.user.username}({self.key})"
