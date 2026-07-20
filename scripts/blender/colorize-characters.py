"""Bake the concept art onto the character scans as vertex colours.

Run:  blender --background --python scripts/blender/colorize-characters.py

The scans have no UVs, so classic texturing is out. Instead each vertex is
projected along the model's FRONT axis onto its concept art and the sampled
pixel is stored as a vertex colour (COLOR_0 in the GLB). This works because:

- every camera waypoint in StoryScene shoots from the front hemisphere, so
  the weak side of a front projection is never featured;
- the scans were *generated from* this art, so silhouettes line up;
- at 30-48k tris, vertex colours resolve flat anime shading just fine —
  no texture files, no UV seams, tiny exports.

Background bleed: verts whose projected pixel is the art's grey studio
backdrop walk toward the subject centre until they hit paint; back-facing
verts get an 0.8 shade factor as fake occlusion.
"""
import bpy
import numpy as np
import os
from mathutils import Vector

ROOT = r"D:\prodoxity"
MODELS = os.path.join(ROOT, "public", "models")
ART = os.path.join(ROOT, "assets", "art")

# model -> (art file, subject rect in image fractions: u0, v0, u1, v1; v from BOTTOM)
JOBS = {
    "scroller": ("Teenage_boy_holding_smartphone_202607181351.jpeg", (0.22, 0.02, 0.66, 0.98)),
    "reader": ("Boy_sitting_reading_open_book_202607181613.jpeg", (0.30, 0.01, 0.74, 0.99)),
    "pair": ("Boy_sitting_reading_open_book_202607181613.jpeg_202607181622.jpeg", (0.16, 0.01, 0.81, 0.99)),
}

# Front established empirically (scripts/blender/_diag3.py cardinal renders):
# the scans face -Y; a viewer at -Y has screen-right = +X. The earlier 45-degree
# diagonal assumption sheared the art across depth — cautionary tale preserved
# in the diag scripts.
F = Vector((0, -1, 0))  # front
R = Vector((1, 0, 0))  # screen-right when viewed from the front
U = Vector((0, 0, 1))


def is_bg(rgb):
    mx, mn = max(rgb), min(rgb)
    lum = (rgb[0] + rgb[1] + rgb[2]) / 3
    return (mx - mn) < 0.10 and 0.30 < lum < 0.93


def bake(name, art_file, rect):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS, f"{name}.glb"))
    obj = next(o for o in bpy.context.scene.objects if o.type == "MESH")
    mesh = obj.data

    # Re-runs import a GLB that may already carry a previous bake; a stale
    # attribute would ride along as COLOR_0 and shadow the new one.
    while mesh.color_attributes:
        mesh.color_attributes.remove(mesh.color_attributes[0])

    img = bpy.data.images.load(os.path.join(ART, art_file))
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(h, w, 4)  # row 0 = image bottom
    # JPEG pixels arrive sRGB-encoded; vertex colours live in linear space.
    # Skipping this decode double-encodes and washes everything to pastel.
    srgb = px[:, :, :3]
    px[:, :, :3] = np.where(
        srgb <= 0.04045, srgb / 12.92, ((srgb + 0.055) / 1.055) ** 2.4
    )

    u0, v0, u1, v1 = rect

    # world-space vert coords + normals
    mw = obj.matrix_world
    nverts = len(mesh.vertices)
    co = np.empty(nverts * 3, dtype=np.float64)
    mesh.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    no = np.empty(nverts * 3, dtype=np.float64)
    mesh.vertices.foreach_get("normal", no)
    no = no.reshape(-1, 3)
    # matrix_world is identity after our build pipeline, but stay honest:
    m = np.array(mw.to_3x3())
    t = np.array(mw.translation)
    co = co @ m.T + t
    no = no @ np.array(mw.to_3x3().inverted().transposed())

    r_axis = np.array(R)
    u_axis = np.array(U)
    f_axis = np.array(F)

    rr = co @ r_axis
    uu = co @ u_axis
    rn = (rr - rr.min()) / max(rr.max() - rr.min(), 1e-9)
    un = (uu - uu.min()) / max(uu.max() - uu.min(), 1e-9)
    facing = no @ f_axis

    cx, cy = (u0 + u1) / 2, (v0 + v1) / 2
    colors = np.empty((nverts, 4), dtype=np.float32)

    for i in range(nverts):
        iu = u0 + rn[i] * (u1 - u0)
        iv = v0 + un[i] * (v1 - v0)
        rgb = None
        for step in range(7):
            sx = min(w - 1, max(0, int(iu * w)))
            sy = min(h - 1, max(0, int(iv * h)))
            p = px[sy, sx]
            if not is_bg((p[0], p[1], p[2])) or step == 6:
                rgb = (p[0], p[1], p[2])
                break
            iu += (cx - iu) * 0.22
            iv += (cy - iv) * 0.22
        shade = 0.8 if facing[i] < -0.1 else 1.0
        colors[i] = (rgb[0] * shade, rgb[1] * shade, rgb[2] * shade, 1.0)

    attr = mesh.color_attributes.new(name="Col", type="FLOAT_COLOR", domain="POINT")
    attr.data.foreach_set("color", colors.ravel())
    mesh.color_attributes.active_color = attr

    # material that USES the attribute, so viewers and exporters keep it
    mat = bpy.data.materials.new("painted")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    ca = nt.nodes.new("ShaderNodeVertexColor")
    ca.layer_name = "Col"
    nt.links.new(ca.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.85
    mesh.materials.clear()
    mesh.materials.append(mat)

    out = os.path.join(MODELS, f"{name}.glb")
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=out,
        use_selection=True,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
    )
    kb = os.path.getsize(out) // 1024
    print(f"[colorize] {name}: {nverts} verts painted, {kb}KB")


for name, (art, rect) in JOBS.items():
    bake(name, art, rect)

print("[colorize] done")
