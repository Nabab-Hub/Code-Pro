import os
import sys
import time
import threading
from config import GEMINI_API_KEYS
from firebase_client import (
    get_bot_status,
    set_bot_status,
    push_question,
    get_questions,
    clear_all_questions
)
from screen_capture import capture_with_scroll
from gemini_solver import solve_from_images

HOTKEY = "f9"

def banner():
    print("=" * 60)
    print("      🚀 CODE-PRO AUTOMATED SCANNER & SOLVER BOT")
    print("=" * 60)
    print(f" * Firebase RTDB: Connected")
    print(f" * Gemini API Keys: {len(GEMINI_API_KEYS)} configured with auto-failover")
    print(f" * Remote Sync: Listening to web toggle (/bot_status)")
    print(f" * Default State: 🔴 OFF (Turn ON from Website navbar to start)")
    print("=" * 60)

def perform_capture_and_solve(scroll_count: int = 1):
    """Executes the full pipeline: check status -> capture -> scroll -> solve -> upload."""
    print("\n[Bot] Checking remote status from Firebase...")
    is_active = get_bot_status()
    if not is_active:
        print("❌ [Bot is OFF] Remote status is currently OFF / Paused.")
        print("👉 Please click 'Start Bot' in the website navigation bar (http://localhost:5173) to activate it!\n")
        return False
        
    print("📸 [Bot] Starting screen capture sequence in 1 second...")
    time.sleep(1)
    
    try:
        frames = capture_with_scroll(scroll_count=scroll_count, scroll_amount=-550, delay=0.7)
        print(f"✅ [Bot] Captured {len(frames)} frames. Sending to Gemini Multimodal Vision...")
        
        result = solve_from_images(frames)
        print("\n" + "-" * 50)
        print(f"📌 Solved Title:    {result.get('title')}")
        print(f"💻 Language:        {result.get('language')}")
        print(f"⚡ Complexity:      {result.get('complexity')}")
        print("-" * 50)
        
        print("\n☁️ [Bot] Uploading solution to Firebase Realtime Database...")
        key = push_question(result)
        if key:
            print(f"🎉 [Success] Uploaded to Firebase! Key: {key}")
            print("👉 Check your code-pro website now—it will appear in realtime!\n")
            return True
        else:
            print("⚠️ [Error] Failed to push to Firebase.")
            return False
    except Exception as e:
        print(f"❌ [Bot Error] Failed to process coding challenge: {e}")
        return False

def run_hotkey_listener():
    """Starts hotkey listener in background if keyboard module has permissions."""
    try:
        import keyboard
        print(f"\n[Hotkey Listener] Listening for '{HOTKEY.upper()}' to trigger auto-capture.")
        print("   (You can also press Enter in this console at any time to trigger)")
        
        def on_triggered():
            print(f"\n[Hotkey Triggered] '{HOTKEY.upper()}' pressed!")
            perform_capture_and_solve()
            
        keyboard.add_hotkey(HOTKEY, on_triggered)
        return True
    except Exception as e:
        print(f"[Hotkey Notice] Global hotkey unavailable ({e}). Using terminal Enter trigger.")
        return False

def live_monitoring_loop():
    """Live monitor loop checking Firebase status periodically and waiting for user trigger."""
    print("\n🟢 Entering Live Monitoring Mode.")
    print("Switch to your browser with the coding problem open.")
    print(f"Press '{HOTKEY.upper()}' on your keyboard OR press [ENTER] in this window to capture & solve.")
    print("Type 'q' and press Enter to return to main menu.\n")
    
    run_hotkey_listener()
    
    last_status = None
    while True:
        try:
            status = get_bot_status()
            if status != last_status:
                if status:
                    print("🟢 [Status Update] Bot is ACTIVE and ready to capture.")
                else:
                    print("🔴 [Status Update] Bot is INACTIVE (disabled via website toggle).")
                last_status = status
                
            cmd = input("[Press Enter to Capture | Type 'q' to exit]: ")
            if cmd.strip().lower() == "q":
                break
            perform_capture_and_solve()
        except KeyboardInterrupt:
            break

def test_on_dump_screenshot():
    """Tests the solver and Firebase upload using the sample screenshots in dump/."""
    dump_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dump")
    shot1 = os.path.join(dump_dir, "Screenshot (945).png")
    shot2 = os.path.join(dump_dir, "Screenshot (946).png")
    
    imgs = []
    if os.path.exists(shot1):
        imgs.append(shot1)
    if os.path.exists(shot2):
        imgs.append(shot2)
        
    if not imgs:
        print("❌ Dump screenshots not found at:", dump_dir)
        return
        
    print(f"🔍 Testing with {len(imgs)} sample screenshot(s) from dump/...")
    result = solve_from_images(imgs)
    print("\n" + "=" * 50)
    print("TITLE:", result.get("title"))
    print("LANGUAGE:", result.get("language"))
    print("COMPLEXITY:", result.get("complexity"))
    print("CODE PREVIEW:\n", result.get("solution_code")[:300])
    print("=" * 50)
    
    push = input("\nUpload this result to Firebase? (y/n) [default: y]: ")
    if push.strip().lower() in ("", "y", "yes"):
        key = push_question(result)
        print(f"✅ Successfully uploaded to Firebase! Key: {key}")

def show_firebase_questions():
    """Lists current questions in Firebase."""
    print("\nFetching questions from Firebase Realtime Database...")
    qs = get_questions()
    if not qs:
        print("ℹ️ No questions found in database.")
        return
    print(f"\nFound {len(qs)} question(s):")
    for qid, q in qs.items():
        title = q.get("title", "Untitled")
        lang = q.get("language", "unknown")
        ts = q.get("timestamp", 0)
        print(f" * [{qid}] ({lang}) {title}")

def main_menu():
    banner()
    while True:
        print("\nMAIN MENU:")
        status = get_bot_status()
        status_str = "🟢 ACTIVE" if status else "🔴 INACTIVE (Paused via Web)"
        print(f"Status in Firebase: {status_str}")
        print(" [1] Start Live Monitoring Mode (Auto-listen / Hotkey F9)")
        print(" [2] Instant Capture & Solve (3s countdown)")
        print(" [3] Test Solve Sample Screenshots (dump/Two Sum)")
        print(" [4] Toggle Bot Remote Status (On / Off)")
        print(" [5] View Questions in Firebase")
        print(" [6] Clear All Questions in Firebase")
        print(" [0] Exit")
        
        choice = input("\nEnter choice [0-6]: ").strip()
        
        if choice == "1":
            live_monitoring_loop()
        elif choice == "2":
            sec = 3
            print(f"\n⏱️ Switch to your coding problem browser window! Capturing in {sec} seconds...")
            for s in range(sec, 0, -1):
                print(f"   {s}...")
                time.sleep(1)
            perform_capture_and_solve()
        elif choice == "3":
            test_on_dump_screenshot()
        elif choice == "4":
            new_status = not status
            set_bot_status(new_status)
            print(f"Updated status to: {'ACTIVE' if new_status else 'INACTIVE'}")
        elif choice == "5":
            show_firebase_questions()
        elif choice == "6":
            confirm = input("Are you sure you want to delete all questions? (y/n): ")
            if confirm.strip().lower() == "y":
                clear_all_questions()
                print("All questions cleared from database.")
        elif choice == "0":
            print("Exiting code-bot. Goodbye!")
            sys.exit(0)
        else:
            print("Invalid choice. Please select 0-6.")

if __name__ == "__main__":
    main_menu()
