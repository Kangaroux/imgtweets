from django.db import models


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class TwitterUser(BaseModel):
    twitter_id = models.CharField(max_length=20)
    username = models.CharField(max_length=15)


class TwitterMedia(BaseModel):
    TYPE_PHOTO = "photo"
    TYPE_VIDEO = "video"
    TYPE_CHOICES = [(TYPE_PHOTO, TYPE_PHOTO), (TYPE_VIDEO, TYPE_VIDEO)]

    user = models.ForeignKey(TwitterUser, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    key = models.CharField(max_length=50)
    url = models.CharField(max_length=255)
