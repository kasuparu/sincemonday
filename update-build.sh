#!/bin/sh
GIT_DIR='.git'
git rev-list HEAD | wc -l | awk '{print $1}' > software-build