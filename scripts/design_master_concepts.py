import os
import math
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\satya\.gemini\antigravity\brain\87a0b670-435a-455d-8671-fd6e02f91ac1"
PUBLIC_DIR = r"C:\Users\satya\projects\DemonZDevelopment\frontend\public\logos"

os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

# Site Design System Colors
COLOR_BG = (12, 11, 10, 255)            # #0c0b0a
COLOR_BG_CARD = (19, 18, 16, 255)       # #131210
COLOR_BORDER = (38, 35, 32, 255)        # #262320
COLOR_TEXT_STRONG = (240, 237, 230, 255) # #f0ede6
COLOR_TEXT_MUTED = (140, 135, 126, 255) # #8c877e
COLOR_BLUE = (75, 142, 247, 255)        # #4b8ef7
COLOR_AMBER = (245, 158, 11, 255)       # #f59e0b

CANVAS = 2048

def rotate_pt(x, y, cx, cy, angle_rad):
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    nx = cos_a * (x - cx) - sin_a * (y - cy) + cx
    ny = sin_a * (x - cx) + cos_a * (y - cy) + cy
    return (nx, ny)

def save_scaled(img, filename_base, target_size=(1024, 1024)):
    final = img.resize(target_size, Image.Resampling.LANCZOS)
    p_art = os.path.join(ARTIFACT_DIR, f"{filename_base}.png")
    p_pub = os.path.join(PUBLIC_DIR, f"{filename_base}.png")
    final.save(p_art, "PNG")
    final.save(p_pub, "PNG")
    print(f"Saved: {filename_base}.png")
    return final

# ==============================================================================
# CONCEPT 1: "The Code Horns" (< / > Meet Demon Crown)
# Developer syntax brackets sculpted into razor-sharp aerodynamic horns
# with a glowing electric blue terminal prompt core.
# ==============================================================================
def draw_concept_1_mark(draw, cx, cy, scale=1.0):
    s = scale
    # Left horn / code bracket polygon
    left_horn = [
        (cx - 24 * s, cy + 280 * s),    # Base center bottom
        (cx - 160 * s, cy + 240 * s),   # Base outer sweep
        (cx - 360 * s, cy + 20 * s),    # Outer elbow
        (cx - 310 * s, cy - 420 * s),   # Sharp horn needle tip
        (cx - 220 * s, cy - 160 * s),   # Inner upper recess
        (cx - 140 * s, cy + 40 * s),    # Inner waist
        (cx - 24 * s, cy + 140 * s),    # Base center top
    ]
    right_horn = [(2 * cx - (x - cx) - cx, y) for (x, y) in left_horn]
    # Correct mirroring
    right_horn = [(cx + (cx - x), y) for (x, y) in left_horn]

    draw.polygon(left_horn, fill=COLOR_TEXT_STRONG)
    draw.polygon(right_horn, fill=COLOR_TEXT_STRONG)

    # Center floating electric spark / prompt
    core = [
        (cx, cy - 220 * s),
        (cx + 60 * s, cy - 60 * s),
        (cx, cy + 100 * s),
        (cx - 60 * s, cy - 60 * s),
    ]
    draw.polygon(core, fill=COLOR_BLUE)

def render_concept_1():
    # 1. Standalone Mark
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    draw_concept_1_mark(draw, CANVAS/2, CANVAS/2 + 20, scale=1.1)
    save_scaled(img, "master_c1_code_horns_mark")

    # 2. Package / App Badge (Squircle)
    img_badge = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw_b = ImageDraw.Draw(img_badge)
    pad = 220
    draw_b.rounded_rectangle([pad, pad, CANVAS - pad, CANVAS - pad], radius=360, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=16)
    draw_concept_1_mark(draw_b, CANVAS/2, CANVAS/2 + 30, scale=0.88)
    save_scaled(img_badge, "master_c1_code_horns_badge")

# ==============================================================================
# CONCEPT 2: "The DZ Origami Sigil" (Interlocking D + Z)
# Pure geometric precision: An outer 'D' woven into an electric 'Z' ribbon.
# ==============================================================================
def draw_concept_2_mark(draw, cx, cy, scale=1.0):
    s = scale
    w = 110 * s

    # Upper D arch and Z top
    r_top = [
        (cx - 300 * s, cy - 300 * s),
        (cx + 120 * s, cy - 300 * s),
        (cx + 340 * s, cy - 80 * s),
        (cx + 340 * s, cy + 40 * s),
        (cx + (340 - 110) * s, cy + 40 * s),
        (cx + (340 - 110) * s, cy - 40 * s),
        (cx + 80 * s, cy - (300 - 110) * s),
        (cx - (300 - 110) * s, cy - (300 - 110) * s),
        (cx - (300 - 110) * s, cy - 60 * s),
        (cx - 300 * s, cy - 60 * s),
    ]
    draw.polygon(r_top, fill=COLOR_TEXT_STRONG)

    # Central diagonal Z slash
    slash = [
        (cx + 170 * s, cy - 100 * s),
        (cx + 270 * s, cy - 100 * s),
        (cx - 170 * s, cy + 280 * s),
        (cx - 270 * s, cy + 280 * s),
    ]
    draw.polygon(slash, fill=COLOR_BLUE)

    # Lower Z base & D anchor
    r_bot = [
        (cx - 300 * s, cy + 60 * s),
        (cx - (300 - 110) * s, cy + 60 * s),
        (cx - (300 - 110) * s, cy + (300 - 110) * s),
        (cx + 80 * s, cy + (300 - 110) * s),
        (cx + (340 - 110) * s, cy + 40 * s),
        (cx + 340 * s, cy + 40 * s),
        (cx + 340 * s, cy + 80 * s),
        (cx + 120 * s, cy + 300 * s),
        (cx - 300 * s, cy + 300 * s),
    ]
    draw.polygon(r_bot, fill=COLOR_TEXT_STRONG)

def render_concept_2():
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    draw_concept_2_mark(draw, CANVAS/2, CANVAS/2, scale=1.1)
    save_scaled(img, "master_c2_dz_sigil_mark")

    img_badge = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw_b = ImageDraw.Draw(img_badge)
    pad = 220
    draw_b.rounded_rectangle([pad, pad, CANVAS - pad, CANVAS - pad], radius=360, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=16)
    draw_concept_2_mark(draw_b, CANVAS/2, CANVAS/2, scale=0.88)
    save_scaled(img_badge, "master_c2_dz_sigil_badge")

# ==============================================================================
# CONCEPT 3: "The Hexa-Daemon" (Tripartite Modular Node / Package Core)
# 3 rotating isometric cyber blades forming an inner tri-star.
# Dedicated nod to Python pip packaging, microservices, and daemon nodes.
# ==============================================================================
def draw_concept_3_mark(draw, cx, cy, scale=1.0):
    s = scale
    # Aerodynamic cyber blade relative to center
    blade = [
        (0, -50 * s),
        (180 * s, -160 * s),
        (420 * s, -300 * s),
        (340 * s, -60 * s),
        (200 * s, 30 * s),
        (60 * s, -10 * s),
    ]
    colors = [COLOR_TEXT_STRONG, COLOR_BLUE, COLOR_AMBER]

    for i in range(3):
        angle = i * (2 * math.pi / 3)
        pts = [rotate_pt(x + cx, y + cy, cx, cy, angle) for (x, y) in blade]
        draw.polygon(pts, fill=colors[i])

    # Inner negative core
    r_tri = 44 * s
    inner_tri = [
        (cx + r_tri * math.cos(i * 2 * math.pi / 3 - math.pi / 2),
         cy + r_tri * math.sin(i * 2 * math.pi / 3 - math.pi / 2))
        for i in range(3)
    ]
    draw.polygon(inner_tri, fill=COLOR_BG)

def render_concept_3():
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    draw_concept_3_mark(draw, CANVAS/2, CANVAS/2, scale=1.1)
    save_scaled(img, "master_c3_hex_daemon_mark")

    img_badge = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw_b = ImageDraw.Draw(img_badge)
    pad = 220
    draw_b.rounded_rectangle([pad, pad, CANVAS - pad, CANVAS - pad], radius=360, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=16)
    draw_concept_3_mark(draw_b, CANVAS/2, CANVAS/2, scale=0.88)
    save_scaled(img_badge, "master_c3_hex_daemon_badge")

# ==============================================================================
# CONCEPT 4: "The Cyber Daemon Visor" (Faceted Minimalist Crest)
# Ultra-clean cybernetic demon mask / diamond shield with electric core.
# ==============================================================================
def draw_concept_4_mark(draw, cx, cy, scale=1.0):
    s = scale
    # Horned diamond shield
    crest = [
        (cx - 340 * s, cy - 320 * s),   # Left horn tip
        (cx - 200 * s, cy - 120 * s),   # Left shoulder
        (cx - 300 * s, cy + 160 * s),   # Left flank
        (cx, cy + 380 * s),             # Bottom point
        (cx + 300 * s, cy + 160 * s),   # Right flank
        (cx + 200 * s, cy - 120 * s),   # Right shoulder
        (cx + 340 * s, cy - 320 * s),   # Right horn tip
        (cx + 120 * s, cy - 200 * s),   # Right inner throat
        (cx, cy - 280 * s),             # Center top notch
        (cx - 120 * s, cy - 200 * s),   # Left inner throat
    ]
    draw.polygon(crest, fill=COLOR_TEXT_STRONG)

    # Inner negative space cutout
    cutout = [
        (cx, cy - 150 * s),
        (cx + 150 * s, cy + 80 * s),
        (cx, cy + 240 * s),
        (cx - 150 * s, cy + 80 * s),
    ]
    draw.polygon(cutout, fill=COLOR_BG)

    # Core electric blue diamond
    core = [
        (cx, cy - 60 * s),
        (cx + 45 * s, cy + 50 * s),
        (cx, cy + 120 * s),
        (cx - 45 * s, cy + 50 * s),
    ]
    draw.polygon(core, fill=COLOR_BLUE)

def render_concept_4():
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    draw_concept_4_mark(draw, CANVAS/2, CANVAS/2, scale=1.1)
    save_scaled(img, "master_c4_cyber_visor_mark")

    img_badge = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw_b = ImageDraw.Draw(img_badge)
    pad = 220
    draw_b.rounded_rectangle([pad, pad, CANVAS - pad, CANVAS - pad], radius=360, fill=COLOR_BG_CARD, outline=COLOR_BORDER, width=16)
    draw_concept_4_mark(draw_b, CANVAS/2, CANVAS/2, scale=0.88)
    save_scaled(img_badge, "master_c4_cyber_visor_badge")

# ==============================================================================
# RENDER BRAND LOCKUPS (Mark + "DemonZ DEVELOPMENT" Typography)
# High-resolution 2400 x 700 banner
# ==============================================================================
def render_brand_lockup(mark_func, name, title="DemonZ", subtitle="DEVELOPMENT"):
    W, H = 2800, 800
    img = Image.new("RGBA", (W, H), COLOR_BG)
    draw = ImageDraw.Draw(img)

    # Draw mark on left side
    mark_cx = 440
    mark_cy = H / 2
    mark_func(draw, mark_cx, mark_cy, scale=0.72)

    # Load typography
    font_bold = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 210)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/bahnschrift.ttf", 62)

    # Text coordinates
    text_x = 860
    title_y = H / 2 - 170

    draw.text((text_x, title_y), title, fill=COLOR_TEXT_STRONG, font=font_bold)

    # Subtitle with letter spacing (tracking)
    sub_y = title_y + 240
    sub_chars = " ".join(list(subtitle))
    draw.text((text_x + 8, sub_y), sub_chars, fill=COLOR_TEXT_MUTED, font=font_sub)

    # Save
    final = img.resize((1400, 400), Image.Resampling.LANCZOS)
    p_art = os.path.join(ARTIFACT_DIR, f"{name}_lockup.png")
    p_pub = os.path.join(PUBLIC_DIR, f"{name}_lockup.png")
    final.save(p_art, "PNG")
    final.save(p_pub, "PNG")
    print(f"Saved: {name}_lockup.png")

if __name__ == "__main__":
    render_concept_1()
    render_concept_2()
    render_concept_3()
    render_concept_4()

    render_brand_lockup(draw_concept_1_mark, "master_c1_code_horns")
    render_brand_lockup(draw_concept_2_mark, "master_c2_dz_sigil")
    render_brand_lockup(draw_concept_3_mark, "master_c3_hex_daemon")
    render_brand_lockup(draw_concept_4_mark, "master_c4_cyber_visor")

    print("\nAll 4 Master Concepts + Badges + Typography Lockups rendered successfully via Python!")
