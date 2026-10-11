import os
import sys
import time
from datetime import datetime
from config import GEMINI_API_KEYS
from firebase_client import (
    get_bot_status,
    set_bot_status,
    push_question
)
from screen_capture import capture_with_scroll
from gemini_solver import solve_from_images

POLL_INTERVAL_SECONDS = 2
HOTKEY = "f9"

def log(msg: str):
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {msg}", flush=True)

def banner():
    print("=" * 64)
    print("       🚀 CODE-PRO FULLY AUTOMATED SCANNER BOT")
    print("=" * 64)
    print(" * Control Mode:   100% REMOTE (Controlled via Website Navbar)")
    print(" * Terminal Input: NONE REQUIRED (Runs continuously in background)")
    print(f" * Remote Polling: Every {POLL_INTERVAL_SECONDS} seconds from Firebase RTDB")
    print(f" * Hotkey Fallback: Press '{HOTKEY.upper()}' to trigger manually anytime")
    print(" * Stop Bot:       Press Ctrl+C in this terminal to exit")
    print("=" * 64)

def perform_capture_and_solve(scroll_count: int = 1):
    """Executes the capture -> scroll -> solve -> upload pipeline."""
    log("📸 Starting screen capture sequence in 1 second...")
    time.sleep(1)

    try:
        frames = capture_with_scroll(scroll_count=scroll_count, scroll_amount=-550, delay=0.7)
        log(f"✅ Captured {len(frames)} frames. Analyzing with Gemini Vision AI...")

        result = solve_from_images(frames)
        print("-" * 55, flush=True)
        print(f"📌 Problem:    {result.get('title')}", flush=True)
        print(f"💻 Language:   {result.get('language')}", flush=True)
        print(f"⚡ Complexity: {result.get('complexity')}", flush=True)
        print("-" * 55, flush=True)

        log("☁️ Uploading solution to Firebase Realtime Database...")
        key = push_question(result)
        if key:
            log(f"🎉 SUCCESS! Uploaded to Firebase (Key: {key})")
            log("👉 Solution is now live on your code-pro website!")
            return True
        else:
            log("⚠️ Failed to upload question to Firebase.")
            return False
    except Exception as e:
        log(f"❌ Error during solve pipeline: {e}")
        return False

def init_hotkey():
    """Optional background listener for F9 hotkey."""
    try:
        import keyboard
        def on_f9():
            log(f"⚡ Hotkey '{HOTKEY.upper()}' pressed! Triggering capture...")
            perform_capture_and_solve()
        keyboard.add_hotkey(HOTKEY, on_f9)
        log(f"🎹 Global hotkey '{HOTKEY.upper()}' is active.")
    except Exception:
        pass

def auto_daemon_loop():
    banner()
    init_hotkey()

    # Always ensure bot starts safely in OFF state
    set_bot_status(False)
    log("🔴 Bot initialized in OFF state.")
    log("👉 Open your website (http://localhost:5173) and click 'Start Bot' whenever you have a problem on screen.")
    print("-" * 64, flush=True)

    was_active = False

    while True:
        try:
            is_active = get_bot_status()

            # State transition: OFF -> ON (User clicked 'Start Bot' on website)
            if is_active and not was_active:
                log("🟢 [WEB TRIGGER] 'Start Bot' activated from website!")
                log("⚡ Beginning automated scan & solve in 1 second...")
                
                success = perform_capture_and_solve()

                # Automatically reset status to OFF so website button flips back to 'Start Bot'
                # This prevents repeatedly capturing the same screen in an infinite loop
                set_bot_status(False)
                was_active = False
                log("🔄 Solved! Status reset to OFF. Ready for your next problem.")
                log("Waiting for next 'Start Bot' toggle from website...\n")

            # State transition: ON -> OFF (User manually stopped or reset)
            elif not is_active and was_active:
                log("🔴 [WEB TRIGGER] Bot was paused/stopped from website.")
                was_active = False

            else:
                # Bot is idle waiting for signal
                pass

            time.sleep(POLL_INTERVAL_SECONDS)

        except KeyboardInterrupt:
            print("\n")
            log("🛑 Received shutdown signal (Ctrl+C). Stopping bot...")
            try:
                set_bot_status(False)
            except Exception:
                pass
            log("Bot exited cleanly. Goodbye!")
            sys.exit(0)
        except Exception as e:
            log(f"⚠️ Polling warning: {e}")
            time.sleep(POLL_INTERVAL_SECONDS)

if __name__ == "__main__":
    auto_daemon_loop()
