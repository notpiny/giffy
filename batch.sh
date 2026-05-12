#!/bin/bash
SOURCE_DIR=$1
if [ -z "$SOURCE_DIR" ]; then
  SOURCE_DIR="$HOME/Downloads/incoming/"
fi

for dir in "$SOURCE_DIR"/*; do
  if [ -d "$dir" ]; then
    echo "Processing $dir"
    for file in "$dir"/*; do
      if [ -f "$file" ]; then
        echo "Processing file: $file"

        CATEGORY=$(basename "$dir") node $PWD/add.js "$file"
      fi
    done
  fi
done