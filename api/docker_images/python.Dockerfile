FROM python:3.11-slim

# No pip packages, no shell tools beyond the interpreter itself —
# keeps the attack surface and image size minimal.
RUN useradd -m sandbox
USER sandbox
WORKDIR /home/sandbox

ENTRYPOINT ["python3"]
