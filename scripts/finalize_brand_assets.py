import os
import math
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\satya\.gemini\antigravity\brain\87a0b670-435a-455d-8671-fd6e02f91ac1"
FRONTEND_PUB = r"c:\Users\satya\projects\DemonZDevelopment\frontend\public"
ADMIN_PUB = r"c:\Users\satya\projects\DemonZDevelopment\admin-frontend\public"

COLOR_BG = (12, 11, 10, 255)            # #0c0b0a
COLOR_BG_CARD = (19, 18, 16, 255)       # #131210
COLOR_BORDER = (38, 35, 32, 255)        # #262320
COLOR_TEXT_STRONG = (240, 237, 230, 255) # #f0ede6
COLOR_TEXT_MUTED = (140, 135, 126, 255) # #8c877e
COLOR_BLUE = (75, 142, 247, 255)        # #4b8ef7

CANVAS = 2048

def draw_code_horns_tall(draw, cx, cy, scale=1.0, transparent=False):
    s = scale
    # Left horn / code bracket
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

def generate_all():
    print("Generating finalized Option B brand assets...")

    # 1. Main Logo on Dark Canvas (1024x1024)
    img_dark = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw_d = ImageDraw.Draw(img_dark)
    draw_code_horns_tall(draw_d, CANVAS/2, CANVAS/2 + 25, scale=1.15)
    final_dark = img_dark.resize((1024, 1024), Image.Resampling.LANCZOS)

    # 2. Main Logo Transparent (1024x1024)
    img_trans = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    draw_t = ImageDraw.Draw(img_trans)
    draw_code_horns_tall(draw_t, CANVAS/2, CANVAS/2 + 25, scale=1.15)
    final_trans = img_trans.resize((1024, 1024), Image.Resampling.LANCZOS)

    # 3. Squircle Package Badge (1024x1024)
    img_badge = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw_b = ImageDraw.Draw(img_badge)
    pad = 220
    draw_b.rounded_rectangle([pad, pad, CANVAS - pad, CANVAS - pad], radius=360, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=16)
    draw_code_horns_tall(draw_b, CANVAS/2, CANVAS/2 + 30, scale=0.92)
    final_badge = img_badge.resize((1024, 1024), Image.Resampling.LANCZOS)

    # 4. Brand Lockup Banner with Typography (1400x400)
    W, H = 2800, 800
    img_lock = Image.new("RGBA", (W, H), COLOR_BG)
    draw_l = ImageDraw.Draw(img_lock)
    draw_code_horns_tall(draw_l, 440, H/2 + 10, scale=0.76)

    font_bold = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 210)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 62)

    text_x = 860
    title_y = H / 2 - 170
    draw_l.text((text_x, title_y), "DemonZ", fill=COLOR_TEXT_STRONG, font=font_bold)

    sub_y = title_y + 240
    sub_chars = " ".join(list("DEVELOPMENT"))
    draw_l.text((text_x + 8, sub_y), sub_chars, fill=COLOR_TEXT_MUTED, font=font_sub)
    final_lock = img_lock.resize((1400, 400), Image.Resampling.LANCZOS)

    # 5. Favicon ICO (16, 32, 48, 64)
    fav_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
    fav_images = [final_dark.resize(s, Image.Resampling.LANCZOS) for s in fav_sizes]

    # Save to ARTIFACT_DIR
    final_dark.save(os.path.join(ARTIFACT_DIR, "dzd-final-logo.png"), "PNG")
    final_dark.convert("RGB").save(os.path.join(ARTIFACT_DIR, "dzd-final-logo.jpeg"), "JPEG", quality=95)
    final_trans.save(os.path.join(ARTIFACT_DIR, "dzd-final-logo-transparent.png"), "PNG")
    final_badge.save(os.path.join(ARTIFACT_DIR, "dzd-final-badge.png"), "PNG")
    final_lock.save(os.path.join(ARTIFACT_DIR, "dzd-brand-lockup.png"), "PNG")

    # Save to FRONTEND_PUB
    final_dark.save(os.path.join(FRONTEND_PUB, "dzd-logo.png"), "PNG")
    final_dark.convert("RGB").save(os.path.join(FRONTEND_PUB, "dzd-logo.jpeg"), "JPEG", quality=95)
    final_trans.save(os.path.join(FRONTEND_PUB, "dzd-logo-transparent.png"), "PNG")
    final_badge.save(os.path.join(FRONTEND_PUB, "dzd-badge.png"), "PNG")
    final_lock.save(os.path.join(FRONTEND_PUB, "dzd-brand-lockup.png"), "PNG")
    final_lock.convert("RGB").save(os.path.join(FRONTEND_PUB, "og-image.jpg"), "JPEG", quality=95)

    fav_images[0].save(
        os.path.join(FRONTEND_PUB, "favicon.ico"),
        format="ICO",
        sizes=fav_sizes,
        append_images=fav_images[1:]
    )
    fav_images[1].save(os.path.join(FRONTEND_PUB, "favicon.png"), "PNG")
    final_badge.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(FRONTEND_PUB, "apple-touch-icon.png"), "PNG")

    # Save to ADMIN_PUB
    final_dark.save(os.path.join(ADMIN_PUB, "dzd-logo.png"), "PNG")
    final_dark.convert("RGB").save(os.path.join(ADMIN_PUB, "dzd-logo.jpeg"), "JPEG", quality=95)
    final_trans.save(os.path.join(ADMIN_PUB, "dzd-logo-transparent.png"), "PNG")
    final_badge.save(os.path.join(ADMIN_PUB, "dzd-badge.png"), "PNG")
    fav_images[0].save(
        os.path.join(ADMIN_PUB, "favicon.ico"),
        format="ICO",
        sizes=fav_sizes,
        append_images=fav_images[1:]
    )

    print("Successfully exported all finalized assets to frontend, admin-frontend, and artifacts directory!")

if __name__ == "__main__":
    generate_all()
