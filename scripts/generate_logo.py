import os
from PIL import Image, ImageDraw

def create_demonz_logo(size=1024, theme="white", transparent=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0 if transparent else 255))
    draw = ImageDraw.Draw(img)

    s = size / 1024.0

    if theme == "python":
        primary = (255, 212, 59, 255)    # Python Yellow
        secondary = (75, 139, 190, 255)  # Python Blue
    elif theme == "blue":
        primary = (75, 142, 247, 255)    # DemonZ Accent Blue
        secondary = (240, 237, 230, 255) # Warm White
    else:
        primary = (255, 255, 255, 255)   # Pure White
        secondary = (12, 11, 10, 255)

    left = 220 * s
    top = 180 * s
    width = 560 * s
    height = 640 * s
    cx, cy = size / 2, size / 2

    # Left vertical bar of D
    draw.rounded_rectangle(
        [left, top + 60 * s, left + 140 * s, top + height],
        radius=int(24 * s),
        fill=primary
    )

    # Horns
    draw.polygon([
        (left, top + 100 * s),
        (left - 40 * s, top - 40 * s),
        (left + 90 * s, top + 40 * s),
    ], fill=primary)

    draw.polygon([
        (left + width - 140 * s, top + 60 * s),
        (left + width + 40 * s, top - 50 * s),
        (left + width - 60 * s, top + 120 * s),
    ], fill=primary)

    # D Arc
    loop_box = [left + 40 * s, top + 60 * s, left + width, top + height]
    draw.arc(loop_box, start=270, end=90, fill=primary, width=int(140 * s))

    # Lightning Bolt
    bolt_pts = [
        (cx + 60 * s, top + 120 * s),
        (cx - 50 * s, cy + 30 * s),
        (cx + 20 * s, cy + 30 * s),
        (cx - 70 * s, top + height + 30 * s),
        (cx + 100 * s, cy - 20 * s),
        (cx + 30 * s, cy - 20 * s),
    ]
    draw.polygon(bolt_pts, fill=secondary)

    return img

def main():
    os.makedirs("generated_logos", exist_ok=True)
    
    logo_white = create_demonz_logo(1024, theme="white", transparent=True)
    logo_white.save("generated_logos/demonz_logo_transparent.png", "PNG")

    logo_dark = create_demonz_logo(1024, theme="white", transparent=False)
    logo_dark.save("generated_logos/demonz_logo_dark.png", "PNG")

    logo_py = create_demonz_logo(1024, theme="python", transparent=True)
    logo_py.save("generated_logos/demonz_python_pip_logo.png", "PNG")

    favicon = logo_white.resize((64, 64), Image.Resampling.LANCZOS)
    favicon.save("generated_logos/favicon.ico", format="ICO", sizes=[(64, 64), (32, 32), (16, 16)])

    print("Successfully generated all logo assets in generated_logos/")

if __name__ == "__main__":
    main()
