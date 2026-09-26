import os
import math
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\satya\.gemini\antigravity\brain\87a0b670-435a-455d-8671-fd6e02f91ac1"
PUBLIC_DIR = r"C:\Users\satya\projects\DemonZDevelopment\frontend\public\logos"

os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

COLOR_BG = (12, 11, 10, 255)            # #0c0b0a
COLOR_BG_CARD = (19, 18, 16, 255)       # #131210
COLOR_BORDER = (38, 35, 32, 255)        # #262320
COLOR_TEXT_STRONG = (240, 237, 230, 255) # #f0ede6
COLOR_TEXT_MUTED = (140, 135, 126, 255) # #8c877e
COLOR_BLUE = (75, 142, 247, 255)        # #4b8ef7
COLOR_AMBER = (245, 158, 11, 255)       # #f59e0b

CANVAS = 2048

def save_scaled(img, filename_base, target_size=(1024, 1024)):
    final = img.resize(target_size, Image.Resampling.LANCZOS)
    p_art = os.path.join(ARTIFACT_DIR, f"{filename_base}.png")
    p_pub = os.path.join(PUBLIC_DIR, f"{filename_base}.png")
    final.save(p_art, "PNG")
    final.save(p_pub, "PNG")
    print(f"Saved: {filename_base}.png")
    return final

# ==============================================================================
# CONCEPT 5: "The Monolithic Horned D" (Bauhaus Precision Tech)
# Completely different from the old logo: Bold, clean, solid architecture.
# The top-right curve tapers into a single aerodynamic horn, with a terminal '>' inner counter.
# ==============================================================================
def draw_concept_5_mark(draw, cx, cy, scale=1.0):
    s = scale
    # Outer monolithic D with top horn flare
    poly_d = [
        (cx - 280 * s, cy + 340 * s),   # Bottom left
        (cx - 280 * s, cy - 300 * s),   # Left vertical spine
        (cx + 100 * s, cy - 300 * s),   # Top bar
        (cx + 380 * s, cy - 440 * s),   # Sweeping aerodynamic horn tip!
        (cx + 320 * s, cy - 180 * s),   # Horn underside
        (cx + 380 * s, cy - 20 * s),    # Outer curve flank
        (cx + 380 * s, cy + 80 * s),    # Lower curve flank
        (cx + 200 * s, cy + 340 * s),   # Bottom right curve
    ]
    draw.polygon(poly_d, fill=COLOR_TEXT_STRONG)

    # Inner counter: terminal prompt '>' in background color
    inner_counter = [
        (cx - 130 * s, cy - 150 * s),
        (cx + 60 * s, cy - 150 * s),
        (cx + 210 * s, cy + 20 * s),
        (cx + 60 * s, cy + 190 * s),
        (cx - 130 * s, cy + 190 * s),
        (cx + 20 * s, cy + 20 * s),
    ]
    draw.polygon(inner_counter, fill=COLOR_BG)

    # Electric blue terminal prompt accent
    accent = [
        (cx - 50 * s, cy - 80 * s),
        (cx + 50 * s, cy + 20 * s),
        (cx - 50 * s, cy + 120 * s),
        (cx - 100 * s, cy + 120 * s),
        (cx, cy + 20 * s),
        (cx - 100 * s, cy - 80 * s),
    ]
    draw.polygon(accent, fill=COLOR_BLUE)

def render_concept_5():
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    draw_concept_5_mark(draw, CANVAS/2, CANVAS/2 + 20, scale=1.1)
    save_scaled(img, "master_c5_monolith_d_mark")

    img_b = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw_b = ImageDraw.Draw(img_b)
    pad = 220
    draw_b.rounded_rectangle([pad, pad, CANVAS - pad, CANVAS - pad], radius=360, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=16)
    draw_concept_5_mark(draw_b, CANVAS/2, CANVAS/2 + 25, scale=0.88)
    save_scaled(img_b, "master_c5_monolith_d_badge")

# ==============================================================================
# CONCEPT 6: "The Cyber Trident" (Daemon Threads / Process Fork)
# 3 hyper-clean needles/forks. Outer tines flare outward like demon horns.
# Center tine features a glowing electric blue needle.
# ==============================================================================
def draw_concept_6_mark(draw, cx, cy, scale=1.0):
    s = scale
    # Left horn tine
    w_tine = 90 * s
    left_tine = [
        (cx - 320 * s, cy - 380 * s),   # Left horn sharp needle tip
        (cx - 220 * s, cy - 240 * s),   # Inner slope
        (cx - 170 * s, cy + 240 * s),   # Base inner
        (cx - (170 + w_tine) * s, cy + 240 * s), # Base outer
        (cx - 320 * s, cy - 140 * s),   # Outer flank
    ]
    right_tine = [(cx + (cx - x), y) for (x, y) in left_tine]

    draw.polygon(left_tine, fill=COLOR_TEXT_STRONG)
    draw.polygon(right_tine, fill=COLOR_TEXT_STRONG)

    # Center spire / thread in DemonZ Blue
    mid_tine = [
        (cx, cy - 440 * s),             # Taller center needle tip
        (cx + 45 * s, cy - 340 * s),
        (cx + 45 * s, cy + 240 * s),
        (cx - 45 * s, cy + 240 * s),
        (cx - 45 * s, cy - 340 * s),
    ]
    draw.polygon(mid_tine, fill=COLOR_BLUE)

    # Connecting horizontal crossbar anchor
    bar_w = 540 * s
    draw.rounded_rectangle(
        [cx - bar_w/2, cy + 200 * s, cx + bar_w/2, cy + 300 * s],
        radius=int(20 * s),
        fill=COLOR_TEXT_STRONG
    )

    # Center notch in crossbar
    draw.polygon([
        (cx - 25 * s, cy + 300 * s),
        (cx, cy + 260 * s),
        (cx + 25 * s, cy + 300 * s),
    ], fill=COLOR_BG)

def render_concept_6():
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    draw_concept_6_mark(draw, CANVAS/2, CANVAS/2 + 20, scale=1.1)
    save_scaled(img, "master_c6_cyber_trident_mark")

    img_b = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw_b = ImageDraw.Draw(img_b)
    pad = 220
    draw_b.rounded_rectangle([pad, pad, CANVAS - pad, CANVAS - pad], radius=360, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=16)
    draw_concept_6_mark(draw_b, CANVAS/2, CANVAS/2 + 30, scale=0.88)
    save_scaled(img_b, "master_c6_cyber_trident_badge")

def render_brand_lockup(mark_func, name, title="DemonZ", subtitle="DEVELOPMENT"):
    W, H = 2800, 800
    img = Image.new("RGBA", (W, H), COLOR_BG)
    draw = ImageDraw.Draw(img)

    mark_cx = 440
    mark_cy = H / 2
    mark_func(draw, mark_cx, mark_cy, scale=0.72)

    font_bold = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 210)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 62)

    text_x = 860
    title_y = H / 2 - 170

    draw.text((text_x, title_y), title, fill=COLOR_TEXT_STRONG, font=font_bold)

    sub_y = title_y + 240
    sub_chars = " ".join(list(subtitle))
    draw.text((text_x + 8, sub_y), sub_chars, fill=COLOR_TEXT_MUTED, font=font_sub)

    final = img.resize((1400, 400), Image.Resampling.LANCZOS)
    p_art = os.path.join(ARTIFACT_DIR, f"{name}_lockup.png")
    p_pub = os.path.join(PUBLIC_DIR, f"{name}_lockup.png")
    final.save(p_art, "PNG")
    final.save(p_pub, "PNG")
    print(f"Saved: {name}_lockup.png")

if __name__ == "__main__":
    render_concept_5()
    render_concept_6()
    render_brand_lockup(draw_concept_5_mark, "master_c5_monolith_d")
    render_brand_lockup(draw_concept_6_mark, "master_c6_cyber_trident")
    print("Concepts 5 & 6 rendered!")
