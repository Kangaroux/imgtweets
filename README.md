# Twitter Image Viewer

The goal of this project is to scrape images from Twitter and provide a website for viewing those images.

Twitter is a great platform for sharing but terrible for searching. It can also be difficult to find something in a sea of tweets.

## Scraping Process

The scrape process is relatively simple.

1. Provide the scraper a username
2. The scraper fetches tweets from the user's timeline
3. Fetched tweets are inspected for media, i.e. photos and videos
4. Media URLs are collected and added to a database for caching

A REST API provides access to the database for easy searching.