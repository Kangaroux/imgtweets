from rest_framework import serializers

from api.models import Image, TwitterUser


class TwitterUserSerializer(serializers.ModelSerializer):
    image_count = serializers.IntegerField(source="get_image_count")

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
