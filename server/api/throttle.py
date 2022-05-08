from rest_framework.throttling import AnonRateThrottle


class StandardThrottle(AnonRateThrottle):
    """
    Throttling for most API endpoints.
    """

    scope = "standard"


class FetchThrottle(AnonRateThrottle):
    """
    Throttling for the fetch/scrape API.
    """

    scope = "fetch"
