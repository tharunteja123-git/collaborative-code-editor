"""
Sandboxed code execution via Docker.

Each run spins up a fresh, isolated container with:
- a hard memory cap (default 128MB)
- a hard CPU cap (default 0.5 cores)
- no network access
- a wall-clock timeout (default 5s), enforced from the host side
  (in case the in-container process ignores SIGTERM)
- the container is always removed after the run (no state persists between runs)
"""
import time
import docker
from docker.errors import ContainerError, APIError
from docker.types import Ulimit

client = docker.from_env()

# One minimal image per language. Build these from /docker_images first.
LANGUAGE_IMAGES = {
    "python": "collab-exec-python:latest",
    "javascript": "collab-exec-node:latest",
    "node": "collab-exec-node:latest",
}

RUN_COMMANDS = {
    "python": ["-c"],
    "javascript": ["-e"],
    "node": ["-e"],
}

MEMORY_LIMIT = "128m"
CPU_QUOTA = 50000     # 0.5 CPU (CPU period default is 100000)
TIMEOUT_SECONDS = 5


def run_code(code: str, language: str) -> dict:
    if language not in LANGUAGE_IMAGES:
        return {
            "stdout": "",
            "stderr": f"Unsupported language: {language}",
            "exit_code": None,
            "timed_out": False,
            "execution_time_ms": 0,
        }

    image = LANGUAGE_IMAGES[language]
    command = RUN_COMMANDS[language] + [code]

    start = time.monotonic()
    container = None
    timed_out = False
    stdout = ""
    stderr = ""
    exit_code = None

    try:
        container = client.containers.run(
            image=image,
            command=command,
            detach=True,
            mem_limit=MEMORY_LIMIT,
            memswap_limit=MEMORY_LIMIT,   # prevents swap from bypassing the memory cap
            cpu_quota=CPU_QUOTA,
            network_disabled=True,        # no outbound network from inside the sandbox
            ulimits=[Ulimit(name="nproc", soft=64, hard=64)],  # cap forked processes
            security_opt=["no-new-privileges"],
            read_only=True,
            tmpfs={"/tmp": "size=16m"},
        )

        try:
            result = container.wait(timeout=TIMEOUT_SECONDS)
            exit_code = result.get("StatusCode")
        except Exception:
            # container exceeded the wall-clock timeout -> kill it
            timed_out = True
            container.kill()

        logs = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace")
        err_logs = container.logs(stdout=False, stderr=True).decode("utf-8", errors="replace")
        stdout, stderr = logs, err_logs

    except ContainerError as e:
        stderr = str(e)
    except APIError as e:
        stderr = f"Docker API error: {e}"
    finally:
        if container is not None:
            try:
                container.remove(force=True)
            except Exception:
                pass

    elapsed_ms = int((time.monotonic() - start) * 1000)

    return {
        "stdout": stdout,
        "stderr": stderr if not timed_out else stderr + "\n[Execution timed out and was terminated]",
        "exit_code": exit_code,
        "timed_out": timed_out,
        "execution_time_ms": elapsed_ms,
    }
