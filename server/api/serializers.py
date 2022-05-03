from api.models import Image, TwitterUser
from rest_framework import serializers


class TwitterUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = TwitterUser
        fields = "__all__"


class ImageSerializer(serializers.ModelSerializer):
    # Rename the `user` field to `user_id`
    user_id = serializers.IntegerField(source="user.id")
    tweet_url = serializers.CharField()

    class Meta:
        model = Image
        exclude = ["user"]
