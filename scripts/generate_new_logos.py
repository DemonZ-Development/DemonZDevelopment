import os
import math
from PIL import Image, ImageDraw, ImageFont

ARTIFACT_DIR = r"C:\Users\satya\.gemini\antigravity\brain\87a0b670-435a-455d-8671-fd6e02f91ac1"
PUBLIC_DIR = r"C:\Users\satya\projects\DemonZDevelopment\frontend\public\logos"

os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

# DemonZ Aesthetic Colors
COLOR_BG = (12, 11, 10, 255)            # #0c0b0a
COLOR_BG_RAISED = (19, 18, 16, 255)     # #131210
COLOR_BORDER = (38, 35, 32, 255)        # #262320
COLOR_TEXT_STRONG = (240, 237, 230, 255) # #f0ede6
COLOR_TEXT_MUTED = (140, 135, 126, 255) # #8c877e
COLOR_BLUE = (75, 142, 247, 255)        # #4b8ef7
COLOR_AMBER = (245, 158, 11, 255)       # #f59e0b
COLOR_WHITE = (255, 255, 255, 255)

CANVAS_SIZE = 2048

def rotate_pt(x, y, cx, cy, angle_rad):
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    nx = cos_a * (x - cx) - sin_a * (y - cy) + cx
    ny = sin_a * (x - cx) + cos_a * (y - cy) + cy
    return (nx, ny)

def save_and_export(img, filename_base):
    # Downsample from 2048 to 1024 with Lanczos for anti-aliasing
    final = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    path_artifact = os.path.join(ARTIFACT_DIR, f"{filename_base}.png")
    path_public = os.path.join(PUBLIC_DIR, f"{filename_base}.png")
    final.save(path_artifact, "PNG")
    final.save(path_public, "PNG")
    print(f"Saved: {filename_base}.png")

# ==============================================================================
# CONCEPT 1: "The Cyber Horns" (Architectural Wing / Crown)
# Ultra-minimalist dual angled horns with central floating energy core.
# ==============================================================================
def render_concept_1():
    img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), COLOR_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 30

    # Left horn polygon
    pts_left = [
        (cx - 30, cy + 340),    # Base center
        (cx - 240, cy + 280),   # Lower outer shoulder
        (cx - 380, cy - 40),    # Mid outer flank
        (cx - 320, cy - 420),   # Horn peak tip
        (cx - 220, cy - 180),   # Inner upper recess
        (cx - 120, cy + 80),    # Inner valley
        (cx - 30, cy + 180),    # Inner base
    ]
    # Right horn polygon (mirror of left)
    pts_right = [(2 * cx - x, y) for (x, y) in pts_left]

    # Draw horns in warm off-white
    draw.polygon(pts_left, fill=COLOR_TEXT_STRONG)
    draw.polygon(pts_right, fill=COLOR_TEXT_STRONG)

    # Central floating diamond/blade (demon core / terminal prompt)
    core_pts = [
        (cx, cy - 240),
        (cx + 64, cy - 70),
        (cx, cy + 100),
        (cx - 64, cy - 70),
    ]
    draw.polygon(core_pts, fill=COLOR_BLUE)

    save_and_export(img, "concept_1_cyber_horns")

# ==============================================================================
# CONCEPT 2: "The DZ Interlock" (Folded Ribbon Monogram)
# A unified geometric monogram weaving 'D' and 'Z' seamlessly.
# ==============================================================================
def render_concept_2():
    img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), COLOR_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = CANVAS_SIZE / 2, CANVAS_SIZE / 2

    poly_upper = [
        (cx - 340, cy - 260),
        (cx - 340, cy - 440),
        (cx - 200, cy - 300),
        (cx + 160, cy - 300),
        (cx + 360, cy - 100),
        (cx + 360, cy + 20),
        (cx + 200, cy + 20),
        (cx + 200, cy - 140),
        (cx - 100, cy - 140),
        (cx + 120, cy + 80),
        (cx - 40, cy + 80),
        (cx - 200, cy - 100),
        (cx - 200, cy + 60),
        (cx - 340, cy + 60),
    ]

    poly_lower = [
        (cx - 120, cy + 160),
        (cx + 40, cy + 160),
        (cx + 340, cy + 160),
        (cx + 340, cy + 320),
        (cx + 200, cy + 460),
        (cx - 160, cy + 320),
        (cx - 340, cy + 320),
        (cx - 340, cy + 160),
        (cx - 200, cy + 160),
        (cx - 200, cy + 220),
        (cx + 180, cy + 220),
    ]

    draw.polygon(poly_upper, fill=COLOR_TEXT_STRONG)
    draw.polygon(poly_lower, fill=COLOR_BLUE)

    save_and_export(img, "concept_2_dz_interlock")

# ==============================================================================
# CONCEPT 3: "The Daemon Fork" (Kernel / Thread Trident)
# ==============================================================================
def render_concept_3():
    img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), COLOR_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 40

    w_mid = 110
    top_mid = cy - 460
    base_y = cy + 260
    mid_prong = [
        (cx, top_mid),
        (cx + w_mid/2, top_mid + 110),
        (cx + w_mid/2, base_y),
        (cx - w_mid/2, base_y),
        (cx - w_mid/2, top_mid + 110),
    ]
    draw.polygon(mid_prong, fill=COLOR_TEXT_STRONG)

    gap = 90
    w_side = 100
    top_side = cy - 320
    x_left_inner = cx - w_mid/2 - gap
    left_prong = [
        (x_left_inner - 100, top_side),
        (x_left_inner, top_side + 80),
        (x_left_inner, base_y),
        (x_left_inner - w_side, base_y),
        (x_left_inner - w_side, top_side + 180),
    ]
    draw.polygon(left_prong, fill=COLOR_TEXT_STRONG)

    right_prong = [(2 * cx - x, y) for (x, y) in left_prong]
    draw.polygon(right_prong, fill=COLOR_TEXT_STRONG)

    bar_w = (cx - (x_left_inner - w_side)) * 2
    draw.rounded_rectangle(
        [cx - bar_w/2, base_y - 20, cx + bar_w/2, base_y + 110],
        radius=24,
        fill=COLOR_BLUE
    )

    draw.polygon([
        (cx - 30, base_y + 110),
        (cx, base_y + 60),
        (cx + 30, base_y + 110)
    ], fill=COLOR_BG)

    save_and_export(img, "concept_3_daemon_fork")

# ==============================================================================
# CONCEPT 4: "The Cyber Vortex" (Tripartite Hex Modular Core)
# ==============================================================================
def render_concept_4():
    img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), COLOR_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = CANVAS_SIZE / 2, CANVAS_SIZE / 2

    wing_local = [
        (0, -60),
        (220, -180),
        (460, -320),
        (380, -80),
        (240, 20),
        (80, -20),
    ]

    colors = [COLOR_TEXT_STRONG, COLOR_BLUE, COLOR_AMBER]

    for i in range(3):
        angle = i * (2 * math.pi / 3)
        pts_rot = [rotate_pt(x + cx, y + cy, cx, cy, angle) for (x, y) in wing_local]
        draw.polygon(pts_rot, fill=colors[i])

    r_core = 48
    tri_pts = [
        (cx + r_core * math.cos(i * 2 * math.pi / 3 - math.pi / 2),
         cy + r_core * math.sin(i * 2 * math.pi / 3 - math.pi / 2))
        for i in range(3)
    ]
    draw.polygon(tri_pts, fill=COLOR_BG)

    save_and_export(img, "concept_4_cyber_vortex")

# ==============================================================================
# CONCEPT 5: "The Cyber Sigil" (Diamond Daemon in Squircle)
# ==============================================================================
def render_concept_5():
    img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), COLOR_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = CANVAS_SIZE / 2, CANVAS_SIZE / 2

    pad = 220
    draw.rounded_rectangle(
        [pad, pad, CANVAS_SIZE - pad, CANVAS_SIZE - pad],
        radius=360,
        fill=COLOR_BG_RAISED,
        outline=COLOR_BORDER,
        width=16
    )

    pts_d = [
        (cx - 360, cy - 360),
        (cx - 220, cy - 140),
        (cx - 320, cy + 180),
        (cx, cy + 420),
        (cx + 320, cy + 180),
        (cx + 220, cy - 140),
        (cx + 360, cy - 360),
        (cx + 140, cy - 240),
        (cx, cy - 320),
        (cx - 140, cy - 240),
    ]
    draw.polygon(pts_d, fill=COLOR_TEXT_STRONG)

    inner_cutout = [
        (cx, cy - 180),
        (cx + 170, cy + 80),
        (cx, cy + 280),
        (cx - 170, cy + 80),
    ]
    draw.polygon(inner_cutout, fill=COLOR_BG_RAISED)

    spark = [
        (cx, cy - 70),
        (cx + 50, cy + 50),
        (cx, cy + 130),
        (cx - 50, cy + 50),
    ]
    draw.polygon(spark, fill=COLOR_BLUE)

    save_and_export(img, "concept_5_cyber_sigil")

if __name__ == "__main__":
    render_concept_1()
    render_concept_2()
    render_concept_3()
    render_concept_4()
    render_concept_5()
    print("All 5 fresh concepts rendered successfully!")
