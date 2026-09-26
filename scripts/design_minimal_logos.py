import os
import math
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\satya\.gemini\antigravity\brain\87a0b670-435a-455d-8671-fd6e02f91ac1"
PUBLIC_DIR = r"C:\Users\satya\projects\DemonZDevelopment\frontend\public\logos"

os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

# Colors from site design system (index.css)
COLOR_BG = (12, 11, 10, 255)            # --color-bg: #0c0b0a
COLOR_BG_RAISED = (19, 18, 16, 255)     # --color-bg-raised: #131210
COLOR_TEXT_STRONG = (240, 237, 230, 255) # --color-text-strong: #f0ede6
COLOR_TEXT_MUTED = (140, 135, 126, 255) # --color-text-muted: #8c877e
COLOR_ACCENT = (75, 142, 247, 255)      # --color-accent: #4b8ef7
COLOR_WARM = (245, 158, 11, 255)        # --color-warm: #f59e0b

def draw_horned_d(draw, cx, cy, scale, color_body, color_bolt, color_horn=None):
    if color_horn is None:
        color_horn = color_body
        
    s = scale

    # Left stem
    left = cx - 220 * s
    top = cy - 280 * s
    stem_w = 110 * s
    stem_h = 560 * s

    draw.rounded_rectangle(
        [left, top + 60 * s, left + stem_w, top + stem_h],
        radius=int(18 * s),
        fill=color_body
    )

    # Horns (Left & Right)
    # Left Horn
    draw.polygon([
        (left + 20 * s, top + 80 * s),
        (left - 70 * s, top - 80 * s),
        (left + 100 * s, top + 40 * s),
    ], fill=color_horn)

    # Right Horn
    d_right = left + 440 * s
    draw.polygon([
        (d_right - 80 * s, top + 50 * s),
        (d_right + 70 * s, top - 90 * s),
        (d_right - 20 * s, top + 130 * s),
    ], fill=color_horn)

    # Right Curve of D
    arc_box = [left + stem_w - 90 * s, top + 60 * s, d_right, top + stem_h]
    draw.arc(arc_box, start=270, end=90, fill=color_body, width=int(110 * s))

    # Top & Bottom connect bars
    draw.rectangle([left + stem_w - 10 * s, top + 60 * s, (left + d_right)/2 + 20*s, top + 60 * s + int(110 * s)], fill=color_body)
    draw.rectangle([left + stem_w - 10 * s, top + stem_h - int(110 * s), (left + d_right)/2 + 20*s, top + stem_h], fill=color_body)

    # Lightning Bolt (Sharp center carve)
    bolt_pts = [
        (cx + 40 * s, cy - 220 * s),
        (cx - 70 * s, cy + 20 * s),
        (cx + 10 * s, cy + 20 * s),
        (cx - 90 * s, cy + 260 * s),
        (cx + 80 * s, cy - 10 * s),
        (cx + 10 * s, cy - 10 * s),
    ]
    draw.polygon(bolt_pts, fill=color_bolt)

def render_concept_1():
    # Concept 1: Minimal Monogram Classic (Warm White on Dark)
    size = 2048
    img = Image.new("RGBA", (size, size), COLOR_BG)
    draw = ImageDraw.Draw(img)
    draw_horned_d(draw, size/2, size/2 - 60, scale=2.1, color_body=COLOR_TEXT_STRONG, color_bolt=COLOR_BG)
    final = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    final.save(os.path.join(ARTIFACT_DIR, "logo_concept_1_monochrome.png"))
    final.save(os.path.join(PUBLIC_DIR, "logo_concept_1_monochrome.png"))

def render_concept_2():
    # Concept 2: DemonZ Signature Blue Accent
    size = 2048
    img = Image.new("RGBA", (size, size), COLOR_BG)
    draw = ImageDraw.Draw(img)
    draw_horned_d(draw, size/2, size/2 - 60, scale=2.1, color_body=COLOR_TEXT_STRONG, color_bolt=COLOR_ACCENT)
    final = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    final.save(os.path.join(ARTIFACT_DIR, "logo_concept_2_blue_bolt.png"))
    final.save(os.path.join(PUBLIC_DIR, "logo_concept_2_blue_bolt.png"))

def render_concept_3():
    # Concept 3: Squircle App & Package Badge
    size = 2048
    img = Image.new("RGBA", (size, size), COLOR_BG)
    draw = ImageDraw.Draw(img)
    # Squircle tile
    margin = 240
    draw.rounded_rectangle([margin, margin, size - margin, size - margin], radius=320, fill=COLOR_BG_RAISED, outline=(240, 237, 230, 25), width=16)
    draw_horned_d(draw, size/2, size/2, scale=1.5, color_body=COLOR_TEXT_STRONG, color_bolt=COLOR_ACCENT)
    final = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    final.save(os.path.join(ARTIFACT_DIR, "logo_concept_3_badge.png"))
    final.save(os.path.join(PUBLIC_DIR, "logo_concept_3_badge.png"))

def render_concept_4():
    # Concept 4: Python & DemonZ Dual Tone (DemonZ Blue + Warm Amber)
    size = 2048
    img = Image.new("RGBA", (size, size), COLOR_BG)
    draw = ImageDraw.Draw(img)
    draw_horned_d(draw, size/2, size/2 - 60, scale=2.1, color_body=COLOR_ACCENT, color_bolt=COLOR_WARM, color_horn=COLOR_TEXT_STRONG)
    final = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    final.save(os.path.join(ARTIFACT_DIR, "logo_concept_4_python_fusion.png"))
    final.save(os.path.join(PUBLIC_DIR, "logo_concept_4_python_fusion.png"))

if __name__ == "__main__":
    render_concept_1()
    render_concept_2()
    render_concept_3()
    render_concept_4()
    print("All 4 minimal concepts successfully designed and rendered via Python!")
