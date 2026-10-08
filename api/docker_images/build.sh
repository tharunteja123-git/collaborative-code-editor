#!/bin/bash
# Build the minimal per-language execution images used by app/core/executor.py
set -e

docker build -t collab-exec-python:latest -f python.Dockerfile .
docker build -t collab-exec-node:latest -f node.Dockerfile .

echo "Sandbox images built: collab-exec-python:latest, collab-exec-node:latest"
