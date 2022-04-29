#!/bin/bash

set -e
cd ${0%/*}

case "$1" in
"build")
    cd frontend
    yarn build
    cd ../server
    ./manage.py collectstatic -c --no-input
    ;;
esac