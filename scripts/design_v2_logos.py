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
COLOR_TEAL = (34, 197, 94, 255)         # nexeu green accent

CANVAS = 2048

def save_image(img, name):
    final = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    p1 = os.path.join(ARTIFACT_DIR, f"{name}.png")
    p2 = os.path.join(PUBLIC_DIR, f"{name}.png")
    final.save(p1, "PNG")
    final.save(p2, "PNG")
    print(f"Rendered: {name}.png")

# ==============================================================================
# LOGO 1: "The DZ Monogram Ribbon"
# An isometric continuous ribbon weaving 'D' and 'Z' in a razor-sharp tech mark
# ==============================================================================
def render_logo_1():
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = CANVAS / 2, CANVAS / 2

    # Top D-arch / Z-top ribbon
    # Poly 1: Upper arm
    w = 110  # ribbon width
    r_top = [
        (cx - 320, cy - 320),   # Left vertical top
        (cx + 100, cy - 320),   # Top horizontal right
        (cx + 340, cy - 100),   # 45 deg chamfer to right
        (cx + 340, cy + 20),    # Right vertical
        (cx + 340 - w, cy + 20),# Inner right vertical
        (cx + 340 - w, cy - 60),# Inner chamfer start
        (cx + 60, cy - 320 + w),# Inner top horizontal
        (cx - 320 + w, cy - 320 + w), # Inner top left
        (cx - 320 + w, cy - 80),# Inner spine
        (cx - 320, cy - 80),    # Outer spine
    ]
    draw.polygon(r_top, fill=COLOR_TEXT_STRONG)

    # Poly 2: Central Z diagonal slash
    slash = [
        (cx + 180, cy - 120),
        (cx + 280, cy - 120),
        (cx - 160, cy + 280),
        (cx - 260, cy + 280),
    ]
    draw.polygon(slash, fill=COLOR_BLUE)

    # Poly 3: Lower base of Z and bottom of D
    r_bot = [
        (cx - 320, cy + 80),
        (cx - 320 + w, cy + 80),
        (cx - 320 + w, cy + 320 - w),
        (cx + 60, cy + 320 - w),
        (cx + 340 - w, cy + 60),
        (cx + 340, cy + 60),
        (cx + 340, cy + 100),
        (cx + 100, cy + 320),
        (cx - 320, cy + 320),
    ]
    draw.polygon(r_bot, fill=COLOR_TEXT_STRONG)

    save_image(img, "logo_v2_dz_ribbon")

# ==============================================================================
# LOGO 2: "The Aerodynamic Cyber Horns" (Sleek Angular Crown)
# Precision dual blades framing an electric blue core spark
# ==============================================================================
def render_logo_2():
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = CANVAS / 2, CANVAS / 2 + 20

    # Left blade (sleeker, longer, hyper-minimal)
    pts_left = [
        (cx - 20, cy + 380),    # Base center
        (cx - 180, cy + 320),   # Lower outer slope
        (cx - 380, cy + 40),    # Mid flank
        (cx - 340, cy - 440),   # Horn needle peak
        (cx - 250, cy - 160),   # Inner upper recess
        (cx - 140, cy + 80),    # Inner waist
        (cx - 20, cy + 220),    # Inner center base
    ]
    pts_right = [(2 * cx - x, y) for (x, y) in pts_left]

    draw.polygon(pts_left, fill=COLOR_TEXT_STRONG)
    draw.polygon(pts_right, fill=COLOR_TEXT_STRONG)

    # Electric center spark / arrow
    spark = [
        (cx, cy - 280),
        (cx + 56, cy - 80),
        (cx, cy + 120),
        (cx - 56, cy - 80),
    ]
    draw.polygon(spark, fill=COLOR_BLUE)

    save_image(img, "logo_v2_cyber_horns")

# ==============================================================================
# LOGO 3: "The Isometric Daemon Package / Pip Core"
# 3D isometric hexagonal cube with demonic chamfered facets & blue core
# Perfect for Python packages, cloud infrastructure, and CLI tools
# ==============================================================================
def render_logo_3():
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = CANVAS / 2, CANVAS / 2

    R = 440 # Hexagon radius
    h = R * math.sin(math.pi / 3) # ~381

    # Hexagon outer vertices: 0 is top (cy - R), 1 is top-right, etc.
    verts = [
        (cx, cy - R),                       # 0: Top
        (cx + h, cy - R / 2),               # 1: Top Right
        (cx + h, cy + R / 2),               # 2: Bottom Right
        (cx, cy + R),                       # 3: Bottom
        (cx - h, cy + R / 2),               # 4: Bottom Left
        (cx - h, cy - R / 2),               # 5: Top Left
    ]

    # Draw Top Face (Warm Off-White) with an inner chevron cut
    face_top = [
        verts[0],
        verts[1],
        (cx + 20, cy - 20),
        (cx, cy - 100),                     # Inward notch (horn cutout)
        (cx - 20, cy - 20),
        verts[5],
    ]
    draw.polygon(face_top, fill=COLOR_TEXT_STRONG)

    # Draw Left Face (DemonZ Blue with angled bevel)
    face_left = [
        verts[5],
        (cx - 20, cy - 10),
        (cx - 20, cy + R - 40),
        verts[4],
    ]
    draw.polygon(face_left, fill=COLOR_BLUE)

    # Draw Right Face (Deep raised carbon surface with warm amber accent)
    face_right = [
        verts[1],
        verts[2],
        verts[3],
        (cx + 20, cy + R - 40),
        (cx + 20, cy - 10),
    ]
    draw.polygon(face_right, fill=COLOR_BG_CARD)
    # Right face accent border
    draw.line([verts[1], verts[2], verts[3]], fill=COLOR_AMBER, width=16)

    # Center floating neon nucleus
    draw.polygon([
        (cx, cy - 70),
        (cx + 40, cy),
        (cx, cy + 70),
        (cx - 40, cy),
    ], fill=COLOR_TEXT_STRONG)

    save_image(img, "logo_v2_daemon_cube")

# ==============================================================================
# LOGO 4: "The Minimalist Horned 'D' (Bauhaus Dark Modern)"
# A bold, disciplined geometric 'D' with a single integrated horn bevel
# and an inner razor-sharp diamond counter. 100% minimal, zero clutter.
# ==============================================================================
def render_logo_4():
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = CANVAS / 2, CANVAS / 2

    # Outer D silhouette:
    # Starts at left stem bottom, goes up, top-left features an integrated horn spike,
    # top horizontal, smooth 45-deg faceted curve, bottom horizontal back to stem.
    outer_d = [
        (cx - 280, cy + 360),   # Bottom left
        (cx - 280, cy - 200),   # Left stem rising
        (cx - 360, cy - 420),   # Integrated demon horn spike
        (cx - 180, cy - 320),   # Horn slope to top bar
        (cx + 120, cy - 320),   # Top bar right
        (cx + 360, cy - 80),    # Chamfered upper-right curve
        (cx + 360, cy + 120),   # Outer right flank
        (cx + 160, cy + 360),   # Chamfered lower-right curve
    ]
    draw.polygon(outer_d, fill=COLOR_TEXT_STRONG)

    # Inner counter hole: A sleek, clean faceted diamond / chevron in pure background color
    inner_counter = [
        (cx - 130, cy - 170),
        (cx + 80, cy - 170),
        (cx + 210, cy),
        (cx + 80, cy + 210),
        (cx - 130, cy + 210),
    ]
    draw.polygon(inner_counter, fill=COLOR_BG)

    # A single electric blue slash across the inner counter
    accent_bar = [
        (cx - 40, cy - 120),
        (cx + 30, cy - 120),
        (cx - 10, cy + 150),
        (cx - 80, cy + 150),
    ]
    draw.polygon(accent_bar, fill=COLOR_BLUE)

    save_image(img, "logo_v2_bauhaus_d")

# ==============================================================================
# LOGO 5: "The Terminal Chevrons / Code Daemon (`< / >`)"
# Two nested terminal prompt chevrons forming a demon mask / digital sigil
# ==============================================================================
def render_logo_5():
    img = Image.new("RGBA", (CANVAS, CANVAS), COLOR_BG)
    draw = ImageDraw.Draw(img)
    cx, cy = CANVAS / 2, CANVAS / 2

    # Outer chevron pair pointing up like horns
    # Left chevron:
    w = 80
    ch_left = [
        (cx - 30, cy + 280),
        (cx - 280, cy - 80),
        (cx - 340, cy - 400),   # Sharp peak tip
        (cx - 240, cy - 280),
        (cx - 160, cy - 60),
        (cx - 30, cy + 140),
    ]
    ch_right = [(2 * cx - x, y) for (x, y) in ch_left]

    draw.polygon(ch_left, fill=COLOR_TEXT_STRONG)
    draw.polygon(ch_right, fill=COLOR_TEXT_STRONG)

    # Inner terminal cursor / prompt '>' styled chevron in DemonZ blue
    inner_cursor = [
        (cx, cy - 180),
        (cx + 120, cy - 20),
        (cx, cy + 140),
        (cx - 40, cy + 90),
        (cx + 40, cy - 20),
        (cx - 40, cy - 130),
    ]
    draw.polygon(inner_cursor, fill=COLOR_BLUE)

    save_image(img, "logo_v2_terminal_chevrons")

if __name__ == "__main__":
    render_logo_1()
    render_logo_2()
    render_logo_3()
    render_logo_4()
    render_logo_5()
    print("V2 logos designed & rendered successfully!")
