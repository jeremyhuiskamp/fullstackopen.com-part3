#!/usr/bin/env bash

set -euo pipefail

rm -rf uibuild/

if [ ! -d uicode ]; then
  git clone git@github.com:jeremyhuiskamp/fullstackopen.com.git uicode
fi

git -C ./uicode pull
npm --prefix ./uicode/part2/phonebook install
npm --prefix ./uicode/part2/phonebook run build --prod
cp -r ./uicode/part2/phonebook/build uibuild
