import io
import time
import base64
from PIL import Image
import pyautogui

def capture_single_frame(box=None) -> Image.Image:
    """Takes a screenshot of the whole screen or specified bounding box."""
    if box:
        shot = pyautogui.screenshot(region=box)
    else:
        shot = pyautogui.screenshot()
    return shot

def capture_with_scroll(scroll_count: int = 1, scroll_amount: int = -500, delay: float = 0.6) -> list[Image.Image]:
    """
    Captures initial screen, positions cursor over the question description area
    (left-center of screen) and scrolls down, capturing subsequent frames.
    """
    frames = []
    width, height = pyautogui.size()
    
    # Target question pane area (usually left half of screen)
    target_x = int(width * 0.25)
    target_y = int(height * 0.50)
    
    print("[ScreenCapture] Capturing Frame 1 (top view)...")
    frames.append(capture_single_frame())
    
    # Hover over question area and scroll
    for i in range(scroll_count):
        print(f"[ScreenCapture] Hovering at ({target_x}, {target_y}) and scrolling down...")
        pyautogui.moveTo(target_x, target_y)
        pyautogui.scroll(scroll_amount)
        time.sleep(delay)
        
        print(f"[ScreenCapture] Capturing Frame {i + 2} (scrolled view)...")
        frames.append(capture_single_frame())
        
    return frames

def image_to_base64(img: Image.Image, max_dim: int = 1600) -> str:
    """Resizes if necessary to preserve aspect ratio and converts to base64 JPEG."""
    # Convert RGBA to RGB if needed
    if img.mode != "RGB":
        img = img.convert("RGB")
        
    w, h = img.size
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=85)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
