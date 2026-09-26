import os
import math
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\satya\.gemini\antigravity\brain\87a0b670-435a-455d-8671-fd6e02f91ac1"
PUBLIC_DIR = r"c:\Users\satya\projects\DemonZDevelopment\frontend\public\logos"

os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

# Colors
COLOR_BG = (12, 11, 10, 255)            # #0c0b0a
COLOR_BG_CARD = (19, 18, 16, 255)       # #131210
COLOR_BORDER = (38, 35, 32, 255)        # #262320
COLOR_TEXT_STRONG = (240, 237, 230, 255) # #f0ede6
COLOR_TEXT_MUTED = (140, 135, 126, 255) # #8c877e
COLOR_BLUE = (75, 142, 247, 255)        # #4b8ef7
COLOR_AMBER = (245, 158, 11, 255)       # #f59e0b

# 4:5 Instagram Portrait: 1080 x 1350 (rendered at 2160 x 2700 for ultra-sharp supersampling)
W, H = 2160, 2700

def draw_code_horns(draw, cx, cy, scale=1.0):
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

    # Option B: Tall crystal (+110px top boost)
    top_boost = 110
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

def save_slide(img, filename):
    final = img.resize((1080, 1350), Image.Resampling.LANCZOS)
    p_art = os.path.join(ARTIFACT_DIR, f"{filename}.png")
    p_pub = os.path.join(PUBLIC_DIR, f"{filename}.png")
    final.save(p_art, "PNG")
    final.save(p_pub, "PNG")
    print(f"Saved: {filename}.png")

# ==============================================================================
# SLIDE 1: The Reveal Cover (Minimal & Clean)
# ==============================================================================
def render_slide_1():
    img = Image.new("RGBA", (W, H), COLOR_BG)
    draw = ImageDraw.Draw(img)

    # Outer subtle card frame
    pad = 120
    draw.rounded_rectangle([pad, pad, W - pad, H - pad], radius=64, outline=COLOR_BORDER, width=6)

    # Center Logo Mark (Balanced vertically)
    mark_cy = 1040
    draw_code_horns(draw, W/2, mark_cy, scale=1.5)

    # Typography Lockup
    font_brand = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 200)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 68)

    brand_text = "DemonZ"
    bbox_b = font_brand.getbbox(brand_text)
    bw = bbox_b[2] - bbox_b[0]
    draw.text(((W - bw)/2, 1660), brand_text, fill=COLOR_TEXT_STRONG, font=font_brand)

    sub_text = "D E V E L O P M E N T"
    bbox_s = font_sub.getbbox(sub_text)
    sw = bbox_s[2] - bbox_s[0]
    draw.text(((W - sw)/2, 1880), sub_text, fill=COLOR_TEXT_MUTED, font=font_sub)

    # Bottom Tagline & URL
    font_desc = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 56)
    tag_text = "A new visual identity"
    b_t = font_desc.getbbox(tag_text)
    draw.text(((W - (b_t[2] - b_t[0]))/2, 2180), tag_text, fill=COLOR_TEXT_MUTED, font=font_desc)

    font_url = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 58)
    url_text = "demonz.org"
    b_u = font_url.getbbox(url_text)
    draw.text(((W - (b_u[2] - b_u[0]))/2, 2320), url_text, fill=COLOR_BLUE, font=font_url)

    save_slide(img, "instagram_post_slide_1_reveal")

# ==============================================================================
# SLIDE 2: The Anatomy / Design Metaphor
# ==============================================================================
def render_slide_2():
    img = Image.new("RGBA", (W, H), COLOR_BG)
    draw = ImageDraw.Draw(img)

    pad = 120
    draw.rounded_rectangle([pad, pad, W - pad, H - pad], radius=64, outline=COLOR_BORDER, width=6)

    # Header
    font_title = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 100)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 52)

    title = "THE ANATOMY OF A DAEMON"
    b_t = font_title.getbbox(title)
    draw.text(((W - (b_t[2] - b_t[0]))/2, 260), title, fill=COLOR_TEXT_STRONG, font=font_title)

    sub = "Geometric synthesis of code and identity"
    b_s = font_sub.getbbox(sub)
    draw.text(((W - (b_s[2] - b_s[0]))/2, 380), sub, fill=COLOR_TEXT_MUTED, font=font_sub)

    # Center Logo Mark
    draw_code_horns(draw, W/2, 1060, scale=1.3)

    # 3 Feature Cards / Callouts
    cards = [
        ("01 / SYNTAX BRACKETS", "The foundational symbols of code (< >) sculpted into twin aerodynamic horns.", COLOR_TEXT_STRONG),
        ("02 / ELECTRIC CORE", "A floating power shard representing active background daemon processes and speed.", COLOR_BLUE),
        ("03 / DARK-MODE FIRST", "Pure obsidian canvas (#0c0b0a) with warm off-white and zero artificial neon bloom.", COLOR_AMBER),
    ]

    card_y_start = 1680
    card_h = 240
    card_margin = 40

    font_c_title = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 54)
    font_c_desc = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 46)

    for i, (ctitle, cdesc, accent_color) in enumerate(cards):
        cy = card_y_start + i * (card_h + card_margin)
        # Background card
        draw.rounded_rectangle([200, cy, W - 200, cy + card_h], radius=28, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=4)
        # Accent left pill
        draw.rounded_rectangle([200, cy, 216, cy + card_h], radius=8, fill=accent_color)
        # Text
        draw.text((250, cy + 45), ctitle, fill=COLOR_TEXT_STRONG, font=font_c_title)
        draw.text((250, cy + 125), cdesc, fill=COLOR_TEXT_MUTED, font=font_c_desc)

    save_slide(img, "instagram_post_slide_2_anatomy")

# ==============================================================================
# SLIDE 3: System & Ecosystem Applications
# ==============================================================================
def render_slide_3():
    img = Image.new("RGBA", (W, H), COLOR_BG)
    draw = ImageDraw.Draw(img)

    pad = 120
    draw.rounded_rectangle([pad, pad, W - pad, H - pad], radius=64, outline=COLOR_BORDER, width=6)

    font_title = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 100)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 52)

    title = "BUILT FOR PRODUCTION"
    b_t = font_title.getbbox(title)
    draw.text(((W - (b_t[2] - b_t[0]))/2, 260), title, fill=COLOR_TEXT_STRONG, font=font_title)

    sub = "Now deployed across our ecosystem"
    b_s = font_sub.getbbox(sub)
    draw.text(((W - (b_s[2] - b_s[0]))/2, 380), sub, fill=COLOR_TEXT_MUTED, font=font_sub)

    # Squircle App / Package Badge centered
    badge_size = 720
    bx = (W - badge_size) / 2
    by = 560
    draw.rounded_rectangle([bx, by, bx + badge_size, by + badge_size], radius=160, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=8)
    draw_code_horns(draw, W/2, by + badge_size/2 + 25, scale=0.88)

    # Context items below
    items = [
        ("WEBSITE & DOCS", "Live at demonz.org"),
        ("DISCORD COLLECTIVE", "Official community & project hub"),
        ("PYTHON PACKAGES", "PyPI, CLI tools & engine modules"),
        ("OPEN SOURCE REPOS", "github.com/DemonZ-Development"),
    ]

    item_y_start = 1420
    font_label = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 52)
    font_val = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 46)

    for i, (label, val) in enumerate(items):
        iy = item_y_start + i * 190
        draw.rounded_rectangle([200, iy, W - 200, iy + 145], radius=24, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=4)
        draw.text((250, iy + 45), label, fill=COLOR_TEXT_STRONG, font=font_label)
        draw.text((W - 260 - font_val.getbbox(val)[2], iy + 48), val, fill=COLOR_BLUE, font=font_val)

    # Bottom footer note
    font_foot = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 48)
    foot_text = "Free & Open Source · Independent Collective"
    b_f = font_foot.getbbox(foot_text)
    draw.text(((W - (b_f[2] - b_f[0]))/2, 2380), foot_text, fill=COLOR_TEXT_MUTED, font=font_foot)

    save_slide(img, "instagram_post_slide_3_ecosystem")

if __name__ == "__main__":
    render_slide_1()
    render_slide_2()
    render_slide_3()
    print("All 3 Instagram slides generated successfully!")
