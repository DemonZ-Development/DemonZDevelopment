import os
import math
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\satya\.gemini\antigravity\brain\87a0b670-435a-455d-8671-fd6e02f91ac1"
PUBLIC_DIR = r"C:\Users\satya\projects\DemonZDevelopment\frontend\public\logos"

COLOR_BG = (12, 11, 10, 255)            # #0c0b0a
COLOR_BG_CARD = (19, 18, 16, 255)       # #131210
COLOR_BORDER = (38, 35, 32, 255)        # #262320
COLOR_TEXT_STRONG = (240, 237, 230, 255) # #f0ede6
COLOR_TEXT_MUTED = (140, 135, 126, 255) # #8c877e
COLOR_BLUE = (75, 142, 247, 255)        # #4b8ef7

CANVAS = 2048

def draw_horns(draw, cx, cy, s):
    left_horn = [
        (cx - 24 * s, cy + 280 * s),
        (cx - 160 * s, cy + 240 * s),
        (cx - 360 * s, cy + 20 * s),
        (cx - 310 * s, cy - 420 * s),
        (cx - 220 * s, cy - 160 * s),
        (cx - 140 * s, cy + 40 * s),
        (cx - 24 * s, cy + 140 * s),
    ]
    right_horn = [(cx + (cx - x), y) for (x, y) in left_horn]
    draw.polygon(left_horn, fill=COLOR_TEXT_STRONG)
    draw.polygon(right_horn, fill=COLOR_TEXT_STRONG)

def render_variation(top_y_offset, name):
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = CANVAS / 2, CANVAS / 2 + 20
    s = 1.1

    draw_horns(draw, cx, cy, s)

    # Core with expanded top
    # original top was cy - 220 * s
    top_y = cy - (220 + top_y_offset) * s
    bot_y = cy + 100 * s
    mid_x_w = 64 * s
    mid_y = cy - 60 * s

    core = [
        (cx, top_y),
        (cx + mid_x_w, mid_y),
        (cx, bot_y),
        (cx - mid_x_w, mid_y),
    ]
    draw.polygon(core, fill=COLOR_BLUE)

    final = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    p_art = os.path.join(ARTIFACT_DIR, f"{name}.png")
    final.save(p_art, "PNG")
    print(f"Saved: {name}.png with top_y_offset = {top_y_offset}")

if __name__ == "__main__":
    render_variation(60, "c1_test_top_plus60")   # Top at cy - 280*s
    render_variation(100, "c1_test_top_plus100") # Top at cy - 320*s
    render_variation(140, "c1_test_top_plus140") # Top at cy - 360*s
