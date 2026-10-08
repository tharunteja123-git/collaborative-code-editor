FROM node:20-slim

RUN useradd -m sandbox
USER sandbox
WORKDIR /home/sandbox

ENTRYPOINT ["node"]
