#!/bin/bash

# Colors
RED='\033[0;31m';
GRAY='\033[0;90m';
GREEN='\033[0;32m';
NC='\033[0m'; # No Color (reset)

PACKAGE_FILE="package.json";

BUILD_DIRECTORY="build";
BUNDLED_FILE="bundle.js";
SCRIPT_FILE="file_atlas.sh";


check_file() {
    local file=$1;
    local error=${2:-"This file does not exist."};

    [ ! -f "$file" ] \
        && echo "" \
        && echo -e "${RED}ERROR:${NC} ${file} file does not exist!" \
        && echo -e "${GRAY}###${NC} ${error}" \
        && exit 1;
}

check_directory() {
    local directory=$1;
    local error=${2:-"This file does not exist."};

    [ ! -d "$directory" ] \
        && echo "" \
        && echo -e "${RED}ERROR:${NC} ${directory} directory does not exist!" \
        && echo -e "${GRAY}###${NC} ${error}" \
        && exit 1;
}





# Check if we have the package.json file
check_file $PACKAGE_FILE "Make sure this script is being ran from the base directory.";

# Build with webpack
npx webpack

# Check if the build was successful
check_directory $BUILD_DIRECTORY "There could have been an issue with building with webpack.";
check_file "${BUILD_DIRECTORY}/${BUNDLED_FILE}" "Make sure this script is being ran from the base directory.";

# Let's create a runnable script
echo "#!/usr/bin/env node" > $BUILD_DIRECTORY/$SCRIPT_FILE;
cat $BUILD_DIRECTORY/$BUNDLED_FILE >> $BUILD_DIRECTORY/$SCRIPT_FILE;
chmod +x $BUILD_DIRECTORY/$SCRIPT_FILE;

# Let's copy all needed the items into the build folder
cp ./package.json ./.atlasignore ./build/;
cp -a ./docs ./build/;
