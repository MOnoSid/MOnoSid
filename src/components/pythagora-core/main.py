#!/usr/bin/env python
import os.path
import sys

try:
    import sentry_sdk
    from sentry_sdk.integrations.asyncio import AsyncioIntegration

    sentry_sdk.init(
        dsn="https://4101633bc5560bae67d6eab013ba9686@o4508731634221056.ingest.us.sentry.io/4508732401909760",
        send_default_pii=True,
        traces_sample_rate=1.0,
        integrations=[AsyncioIntegration()],
    )

    sentry_sdk.profiler.start_profiler()
except ImportError:
    SENTRY_ENABLED = False

try:
    from core.cli.main import run_pythagora
except ImportError as err:
    pythagora_root = os.path.dirname(__file__)
    venv_path = os.path.join(pythagora_root, "venv")
    requirements_path = os.path.join(pythagora_root, "requirements.txt")
    if sys.prefix == sys.base_prefix:
        venv_python_path = os.path.join(venv_path, "scripts" if sys.platform == "win32" else "bin", "python")
        print(f"Python environment for Pythagora is not set up: module `{err.name}` is missing.", file=sys.stderr)
        print(f"Please create Python virtual environment: {sys.executable} -m venv {venv_path}", file=sys.stderr)
        print(
            f"Then install the required dependencies with: {venv_python_path} -m pip install -r {requirements_path}",
            file=sys.stderr,
        )
    else:
        print(
            f"Python environment for Pythagora is not completely set up: module `{err.name}` is missing",
            file=sys.stderr,
        )
        print(
            f"Please run `{sys.executable} -m pip install -r {requirements_path}` to finish Python setup, and rerun Pythagora.",
            file=sys.stderr,
        )
    sys.exit(255)

sys.exit(run_pythagora())
