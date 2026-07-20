"""Diagnose the projection mapping with landmark vertices, print-only."""
import bpy
import numpy as np
import os
from mathutils import Vector

ROOT = r"D:\prodoxity"
name = "reader"
art_file = "Boy_sitting_reading_open_book_202607181613.jpeg"
u0, v0, u1, v1 = (0.30, 0.01, 0.74, 0.99)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, "public", "models", f"{name}.glb"))
obj = next(o for o in bpy.context.scene.objects if o.type == "MESH")
mesh = obj.data

img = bpy.data.images.load(os.path.join(ROOT, "assets", "art", art_file))
w, h = img.size
px = np.empty(w * h * 4, dtype=np.float32)
img.pixels.foreach_get(px)
px = px.reshape(h, w, 4)
print(f"[diag] image {w}x{h}")

SQ2 = 2 ** 0.5
R = np.array((1 / SQ2, 1 / SQ2, 0))
U = np.array((0, 0, 1))

mw = obj.matrix_world
print(f"[diag] matrix_world rot: {tuple(round(a,2) for a in mw.to_euler())} scale {tuple(round(s,2) for s in mw.to_scale())}")

n = len(mesh.vertices)
co = np.empty(n * 3, dtype=np.float64)
mesh.vertices.foreach_get("co", co)
co = co.reshape(-1, 3)
m = np.array(mw.to_3x3())
t = np.array(mw.translation)
co = co @ m.T + t

rr = co @ R
uu = co @ U
print(f"[diag] world bbox: x[{co[:,0].min():.2f},{co[:,0].max():.2f}] y[{co[:,1].min():.2f},{co[:,1].max():.2f}] z[{co[:,2].min():.2f},{co[:,2].max():.2f}]")
print(f"[diag] rr range [{rr.min():.2f},{rr.max():.2f}] uu range [{uu.min():.2f},{uu.max():.2f}]")

rn = (rr - rr.min()) / (rr.max() - rr.min())
un = (uu - uu.min()) / (uu.max() - uu.min())

landmarks = {
    "top(head)": int(np.argmax(uu)),
    "bottom": int(np.argmin(uu)),
    "left(rr min)": int(np.argmin(rr)),
    "right(rr max)": int(np.argmax(rr)),
}
for label, i in landmarks.items():
    iu = u0 + rn[i] * (u1 - u0)
    iv = v0 + un[i] * (v1 - v0)
    sx, sy = int(iu * w), int(iv * h)
    p = px[min(h-1, sy), min(w-1, sx)]
    print(f"[diag] {label}: world({co[i,0]:.2f},{co[i,1]:.2f},{co[i,2]:.2f}) -> img u={iu:.2f} v={iv:.2f} rgb=({p[0]:.2f},{p[1]:.2f},{p[2]:.2f})")
