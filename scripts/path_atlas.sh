#!/bin/bash

# Colors
RED='\033[0;31m';
GRAY='\033[0;90m';
GREEN='\033[0;32m';
NC='\033[0m'; # No Color (reset)

# Let's install all the required packages
if [ ! -d ./node_modules/ ]; then
  # check if yarn is installed
  yarn --version >> /dev/null || YARN_NOT_EXISTS="checked";
  npm --version >> /dev/null || NPM_NOT_EXISTS="checked";

  if [ -z "$YARN_NOT_EXISTS" ]; then
    yarn install
    echo ""
  elif [ -z "$YARN_NOT_EXISTS" ]; then
    npm install
    echo ""
  else
    echo "" \
    && echo -e "${RED}ERROR:${NC} Install package files" \
    && echo -e "${GRAY}###${NC} Missing package installer: npm or yarn" \
    && exit 1;
  fi
fi

# Let's load all the env variables
[ ! -f .env ] || export $( grep -v '^#' .env | xargs );

node bundle.js