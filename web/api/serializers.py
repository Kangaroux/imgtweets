from rest_framework import serializers
from api.models import TwitterUser, Photo


class TwitterUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = TwitterUser
        fields = "__all__"


class PhotoSerializer(serializers.ModelSerializer):
    # Rename the `user` field to `user_id`
    user_id = serializers.IntegerField(source="user.id")

    class Meta:
        model = Photo
        exclude = ["user"]
