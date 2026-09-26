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

def draw_code_horns_refined(draw, cx, cy, scale=1.0, top_boost=100):
    s = scale
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

    # Core crystal expanded from top
    # Base top was cy - 220 * s
    top_y = cy - (220 + top_boost) * s
    bot_y = cy + 100 * s
    mid_w = 64 * s
    mid_y = cy - 60 * s

    core = [
        (cx, top_y),
        (cx + mid_w, mid_y),
        (cx, bot_y),
        (cx - mid_w, mid_y),
    ]
    draw.polygon(core, fill=COLOR_BLUE)

def render_suite(top_boost, prefix):
    # 1. Standalone Mark (1024x1024)
    img_mark = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw_m = ImageDraw.Draw(img_mark)
    draw_code_horns_refined(draw_m, CANVAS/2, CANVAS/2 + 20, scale=1.1, top_boost=top_boost)
    final_mark = img_mark.resize((1024, 1024), Image.Resampling.LANCZOS)
    final_mark.save(os.path.join(ARTIFACT_DIR, f"{prefix}_mark.png"), "PNG")
    final_mark.save(os.path.join(PUBLIC_DIR, f"{prefix}_mark.png"), "PNG")

    # 2. Package / App Badge (Squircle)
    img_badge = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw_b = ImageDraw.Draw(img_badge)
    pad = 220
    draw_b.rounded_rectangle([pad, pad, CANVAS - pad, CANVAS - pad], radius=360, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=16)
    draw_code_horns_refined(draw_b, CANVAS/2, CANVAS/2 + 30, scale=0.88, top_boost=top_boost)
    final_badge = img_badge.resize((1024, 1024), Image.Resampling.LANCZOS)
    final_badge.save(os.path.join(ARTIFACT_DIR, f"{prefix}_badge.png"), "PNG")
    final_badge.save(os.path.join(PUBLIC_DIR, f"{prefix}_badge.png"), "PNG")

    # 3. Horizontal Brand Lockup with Typography (1400x400)
    W, H = 2800, 800
    img_lock = Image.new("RGBA", (W, H), COLOR_BG)
    draw_l = ImageDraw.Draw(img_lock)
    draw_code_horns_refined(draw_l, 440, H/2, scale=0.72, top_boost=top_boost)

    font_bold = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 210)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 62)

    text_x = 860
    title_y = H / 2 - 170
    draw_l.text((text_x, title_y), "DemonZ", fill=COLOR_TEXT_STRONG, font=font_bold)

    sub_y = title_y + 240
    sub_chars = " ".join(list("DEVELOPMENT"))
    draw_l.text((text_x + 8, sub_y), sub_chars, fill=COLOR_TEXT_MUTED, font=font_sub)

    final_lock = img_lock.resize((1400, 400), Image.Resampling.LANCZOS)
    final_lock.save(os.path.join(ARTIFACT_DIR, f"{prefix}_lockup.png"), "PNG")
    final_lock.save(os.path.join(PUBLIC_DIR, f"{prefix}_lockup.png"), "PNG")

    print(f"Rendered suite for {prefix} (top_boost={top_boost})")

if __name__ == "__main__":
    render_suite(80, "master_c1_expanded_medium")   # +80px top boost
    render_suite(110, "master_c1_expanded_tall")    # +110px top boost
    render_suite(140, "master_c1_expanded_ultra")   # +140px top boost
    print("Done rendering all refined suites!")
