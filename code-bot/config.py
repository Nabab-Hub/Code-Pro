import os
import re

def _load_env_file(filepath):
    """Simple parser for .env files without requiring python-dotenv."""
    if not os.path.exists(filepath):
        return {}
    env_vars = {}
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                env_vars[k.strip()] = v.strip().strip("'\"")
    return env_vars

# Check local code-bot/.env or code-pro/.env
_bot_env = _load_env_file(os.path.join(os.path.dirname(__file__), ".env"))
_pro_env = _load_env_file(os.path.join(os.path.dirname(os.path.dirname(__file__)), "code-pro", ".env"))

def get_env_val(key, default=""):
    return os.environ.get(key) or _bot_env.get(key) or _pro_env.get(key) or _pro_env.get(f"VITE_{key}") or default

FIREBASE_DATABASE_URL = get_env_val("FIREBASE_DATABASE_URL", "https://quipu-c6fdb-default-rtdb.firebaseio.com")

RAW_KEYS = []
for i in range(1, 6):
    k = get_env_val(f"GEMINI_API_KEY_{i}")
    if k:
        RAW_KEYS.append(k)

# Clean up any whitespace/newlines in keys
GEMINI_API_KEYS = [re.sub(r"\s+", "", k) for k in RAW_KEYS]

GEMINI_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3-flash-preview"
]
