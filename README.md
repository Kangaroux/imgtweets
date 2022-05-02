# Twitter Image Viewer

The goal of this project is to scrape images from Twitter and provide a website for viewing those images.

Twitter is a great platform for sharing but terrible for searching. It can also be difficult to find something in a sea of tweets.

## Setup

This project requires the following:

- Python 3.10
- Node 14 (and yarn)

Docker is used for production but isn't necessary for development.

### Frontend

The frontend uses create-react-app. It runs a development server and serves the frontend assets at http://localhost:3000. This is the URL you should visit to view the site.

```bash
cd frontend
yarn
yarn start
```

### Backend

The backend uses Django and DRF. It runs a development server at http://localhost:8000 and a browsable API at http://localhost:8000/api/.

```bash
pip install -r requirements.txt
cd server
./manage.py runserver
```

## Scraping Process

The scrape process is relatively simple.

1. Provide the scraper a username
2. The scraper fetches tweets from the user's timeline
3. Fetched tweets are inspected for media, i.e. images and videos
4. Media URLs are collected and added to a database for caching

A REST API provides access to the database for easy searching.