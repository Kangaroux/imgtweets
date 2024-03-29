#!/bin/bash

set -e
cd ${0%/*}

case "$1" in
"build")
    # echo '>> Building frontend'
    # cd frontend
    # yarn build

    # echo '>> Collecting server static files'
    # cd ../server
    # rm -rf static/
    # ./manage.py collectstatic --no-input

    # Copies the frontend and server assets to dist/
    #
    # dist/
    #   index.html
    #   static/
    #     {css,js}/                 <- frontend assets
    #     {admin,rest_framework}/   <- server assets
    # echo '>> Copying to dist/'
    # cd ..

    rm -rf dist/ && mkdir -p dist/

    # cp -R server/static/* dist/static/
    cp -r frontend/public/* dist/
    ;;
esac
