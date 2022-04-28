from dataclasses import dataclass
from enum import Enum
from typing import Dict, List

import requests


class TwitterError(Exception):
    pass


class TwitterErrorNotFound(TwitterError):
    pass


class TwitterRateLimit(TwitterError):
    pass


class TwitterMediaType(Enum):
    Gif = "animated_gif"
    Photo = "photo"
    Video = "video"


@dataclass
class TwitterUser:
    id: str
    name: str
    username: str


@dataclass
class TwitterMedia:
    key: str
    type: TwitterMediaType
    url: str


@dataclass
class TwitterMediaTweet:
    media: List[TwitterMedia]
    tweet_id: str
    user_id: str


class TwitterAPI:
    bearer_token: str
    session: requests.Session

    BASE_PATH = "https://api.twitter.com/2"

    def __init__(self, bearer_token: str):
        self.bearer_token = bearer_token
        self.session = requests.Session()
        self.session.headers["Authorization"] = f"Bearer {bearer_token}"
        self.session

    def get_user_by_username(self, username: str):
        """
        https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
        """
        resp = self.session.get(self.BASE_PATH + f"/users/by/username/{username}")
        self._handle_errors(resp)

        data = resp.json()["data"]

        return TwitterUser(id=data["id"], name=data["name"], username=data["username"])

    def get_user_media_tweets(
        self, user_id: str, limit=10, pagination_token: str = None
    ):
        """
        https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets
        """
        params = {
            "exclude": "retweets,replies",
            "expansions": "attachments.media_keys",
            "media.fields": "type,url",
            "max_results": limit,
        }

        if pagination_token:
            params["pagination_token"] = pagination_token

        resp = self.session.get(
            self.BASE_PATH + f"/users/{user_id}/tweets", params=params
        )
        self._handle_errors(resp)

        media: Dict[str, TwitterMedia] = {}
        tweets: List[TwitterMediaTweet] = []

        for data in resp.json().get("includes", {}).get("media", []):
            key = data["media_key"]

            # URL seems to be missing for animated_gif media
            url = data.get("url")
            media[key] = TwitterMedia(
                key=key,
                type=TwitterMediaType(data["type"]),
                url=url,
            )

        for data in resp.json()["data"]:
            media_keys = data.get("attachments", {}).get("media_keys", [])

            if not media_keys:
                continue

            tweets.append(
                TwitterMediaTweet(
                    media=[media[key] for key in media_keys],
                    user_id=user_id,
                    tweet_id=data["id"],
                )
            )

        pagination_token = resp.json()["meta"]["next_token"]

        return (tweets, pagination_token)

    def _handle_errors(self, resp: requests.Response):
        if resp.status_code == 429:
            raise TwitterRateLimit(resp.text, resp.headers)

        resp.raise_for_status()

        errs = resp.json().get("errors")

        if errs:
            if errs[0].get("title") == "Not Found Error":
                raise TwitterErrorNotFound(resp.text)
            else:
                raise TwitterError(resp.text)
