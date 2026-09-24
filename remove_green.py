"""Punch chroma-key green (#00FF00 and near-lime fills) to transparent alpha."""
from PIL import Image
import numpy as np
import sys
from numpy.lib.stride_tricks import sliding_window_view


def remove_green_screen(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    arr = np.array(img).astype(np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    max_rb = np.maximum(r, b)

    # Strict chroma — avoid morphological dilate so thin metal / fan stays opaque
    mask = (g > 90) & (g > max_rb * 1.85) & ((g - max_rb) > 45) & (r < 130) & (b < 130)
    mask |= (g > 170) & (r < 90) & (b < 90) & (g > r + 50) & (g > b + 50)

    pad = np.pad(mask.astype(np.uint8), 1, mode="edge")
    nb = sliding_window_view(pad, (3, 3)).sum(axis=(-1, -2))
    near = (g > 70) & (g > max_rb * 1.4) & ((g - max_rb) > 25) & (r < 140) & (b < 140)
    mask = mask | (near & (nb >= 5))

    out = arr.copy()
    out[mask, :] = 0

    Image.fromarray(out.astype(np.uint8)).save(output_path)
    transparent_pct = (out[:, :, 3] == 0).mean() * 100
    print(f"{input_path} -> {output_path} ({transparent_pct:.1f}% transparent)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 remove_green.py <input.png> <output.png>")
        sys.exit(1)
    remove_green_screen(sys.argv[1], sys.argv[2])
