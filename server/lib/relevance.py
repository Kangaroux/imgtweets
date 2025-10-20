from typing import List

from rapidfuzz import process, fuzz
from api.models import TwitterUser


def sort_users_by_best_match(
    users: List[TwitterUser], search: str
) -> List[TwitterUser]:
    """
    Returns the users sorted by how close their username is to the search query.
    """
    results = process.extract(
        search,
        [u.username for u in users],
        scorer=fuzz.WRatio,
        limit=len(users),
    )
    return [users[i] for _, _, i in results]
