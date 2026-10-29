"""Gera fundos estilo ICM (intentional camera movement) como os das LPs da Plane.

Pinceladas de cor em paleta terrosa + desfoque direcional forte. Placeholders até
termos fotos reais (cavalos, haras) com o mesmo tratamento.
"""
import sys, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

PALETTES = {
    "oliva":   ["#2f3524", "#5b6236", "#8c8a4f", "#b9a96b", "#d8cba0", "#3e4a2c"],
    "dourado": ["#3a2a17", "#7a5426", "#b9853f", "#e0b56e", "#f1dcae", "#5e4a2a"],
    "areia":   ["#6f6453", "#a8977b", "#cdbb9b", "#e7dcc6", "#f4eee2", "#8d7f69"],
    "noite":   ["#070b1a", "#0f1b3d", "#1d2f63", "#3d5aa8", "#b8323a", "#e2e6f2"],
    "musgo":   ["#1e2a22", "#38503d", "#5f7a55", "#9aa775", "#cfcf9e", "#2b3a2e"],
    "pessego": ["#7d5a4f", "#b98475", "#e2b3a0", "#f2d3c3", "#f8eadf", "#9c6e60"],
}

def hex2rgb(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))

def motion_blur(img, length, angle):
    # desfoque direcional: rotaciona, borra no eixo x por média móvel, desrotaciona
    big = img.rotate(angle, resample=Image.BICUBIC, expand=True)
    a = np.asarray(big).astype(np.float32)
    k = max(1, int(length))
    c = np.cumsum(np.pad(a, ((0, 0), (k, k), (0, 0)), mode="edge"), axis=1)
    a = (c[:, 2 * k:] - c[:, :-2 * k]) / (2 * k)
    big = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    out = big.rotate(-angle, resample=Image.BICUBIC, expand=False)
    w, h = img.size; W, H = out.size
    return out.crop(((W - w) // 2, (H - h) // 2, (W - w) // 2 + w, (H - h) // 2 + h))

def make(name, palette, seed, w=2400, h=1500, angle=-18):
    rnd = random.Random(seed)
    cols = [hex2rgb(c) for c in PALETTES[palette]]
    W, H = int(w * 1.6), int(h * 1.6)  # margem: a rotação do desfoque não deixa bordas
    ow, oh = w, h
    w, h = W, H
    # base: céu claro em cima, chão escuro embaixo (estrutura de horizonte das fotos ICM)
    light, dark = max(cols, key=sum), min(cols, key=sum)
    t = np.linspace(0, 1, h)[:, None, None]
    base = (np.array(light) * (1 - t) + np.array(dark) * t) * np.ones((1, w, 1))
    img = Image.fromarray(base.astype(np.uint8))
    d = ImageDraw.Draw(img)
    # faixas horizontais (horizonte) + manchas
    for i in range(8):
        y = rnd.uniform(0.3, 1.0) * h
        d.rectangle([0, y, w, y + rnd.uniform(0.02, 0.12) * h], fill=rnd.choice(cols))
    for i in range(140):
        x, y = rnd.uniform(-0.1, 1.1) * w, rnd.uniform(0.2, 1.1) * h
        r = rnd.uniform(0.01, 0.08) * w
        d.ellipse([x - r, y - r * 0.25, x + r, y + r * 0.25], fill=rnd.choice(cols))
    img = img.filter(ImageFilter.GaussianBlur(18))
    img = motion_blur(img, w * 0.09, angle)
    img = motion_blur(img, w * 0.03, angle + 4)
    img = img.crop(((w - ow) // 2, (h - oh) // 2, (w - ow) // 2 + ow, (h - oh) // 2 + oh))
    w, h = ow, oh
    # grão fotográfico
    a = np.asarray(img).astype(np.float32)
    a += np.random.default_rng(seed).normal(0, 5, a.shape)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    img.save(f"{sys.argv[1]}/{name}.webp", quality=82)

if __name__ == "__main__":
    for i, (name, pal, ang) in enumerate([
        ("icm-oliva", "oliva", -16), ("icm-dourado", "dourado", -22), ("icm-areia", "areia", -12),
        ("icm-noite", "noite", -8), ("icm-musgo", "musgo", -20), ("icm-pessego", "pessego", -14),
    ]):
        make(name, pal, 100 + i, angle=ang)
        print("ok", name)
