#!/bin/bash

git checkout master && \
git merge staging && \
git add --all && \
git commit -m "Updated on $(date)" && \
git push
