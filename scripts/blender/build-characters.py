"""Process the AI-generated character scans into production web assets.

Run:  blender --background --python scripts/blender/build-characters.py

In:   assets/white_mesh*.glb   (trimesh/PLY scans, 177k-784k tris, no materials)
Out:  public/models/{scroller,reader,pair}.glb

Per model: import -> decimate to a web-weight tri budget -> smooth shading
(with hard-edge preservation) -> floor + centre the origin -> normalise height
-> single white material (the app tints at runtime through the vibe system,
so the export stays colourless clay on purpose) -> GLB.

Deterministic and re-runnable: this script IS the asset pipeline; the repo
never depends on manual Blender sessions.
"""
import bpy
import math
import os
import sys

ROOT = r"D:\prodoxity"
OUT_DIR = os.path.join(ROOT, "public", "models")
os.makedirs(OUT_DIR, exist_ok=True)

# (source, output name, target tris, target height in scene units)
JOBS = [
    ("white_mesh (2).glb", "scroller", 30000, 1.85),  # standing, phone in hand
    ("white_mesh (1).glb", "reader", 30000, 1.25),   # seated, book open
    ("white_mesh.glb", "pair", 48000, 1.30),          # two friends, one book
]


def process(src, name, target_tris, target_h):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, "assets", src))

    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if not meshes:
        print(f"[build] {name}: NO MESH")
        return

    # join into one object
    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    obj.name = name

    # clear parenting/transforms so the mesh owns its world position
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # decimate to budget
    before = len(obj.data.polygons)
    ratio = min(1.0, target_tris / max(before, 1))
    mod = obj.modifiers.new("dec", "DECIMATE")
    mod.ratio = ratio
    bpy.ops.object.modifier_apply(modifier="dec")

    # shading: smooth with sharp-angle split so folds stay crisp
    bpy.ops.object.shade_smooth()
    try:
        bpy.ops.object.shade_auto_smooth(angle=math.radians(38))
    except Exception:
        pass  # older API fallback: plain smooth is acceptable

    # normalise: feet on Z=0, centred in X/Y, scaled to target height
    import mathutils
    mins = mathutils.Vector((1e9,) * 3)
    maxs = mathutils.Vector((-1e9,) * 3)
    for c in obj.bound_box:
        wc = obj.matrix_world @ mathutils.Vector(c)
        mins = mathutils.Vector(map(min, mins, wc))
        maxs = mathutils.Vector(map(max, maxs, wc))
    height = max(maxs.z - mins.z, 1e-6)
    s = target_h / height
    obj.scale = (s, s, s)
    bpy.ops.object.transform_apply(scale=True)
    # recompute after scale
    mins2 = mathutils.Vector((1e9,) * 3)
    maxs2 = mathutils.Vector((-1e9,) * 3)
    for c in obj.bound_box:
        wc = obj.matrix_world @ mathutils.Vector(c)
        mins2 = mathutils.Vector(map(min, mins2, wc))
        maxs2 = mathutils.Vector(map(max, maxs2, wc))
    obj.location.x -= (mins2.x + maxs2.x) / 2
    obj.location.y -= (mins2.y + maxs2.y) / 2
    obj.location.z -= mins2.z
    bpy.ops.object.transform_apply(location=True)

    # one clean clay material; the app overrides it at runtime anyway
    mat = bpy.data.materials.new("clay")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (1, 1, 1, 1)
        bsdf.inputs["Roughness"].default_value = 0.85
    obj.data.materials.clear()
    obj.data.materials.append(mat)

    out = os.path.join(OUT_DIR, f"{name}.glb")
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=out,
        use_selection=True,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
    )
    after = len(obj.data.polygons)
    kb = os.path.getsize(out) // 1024
    print(f"[build] {name}: {before} -> {after} tris, {kb}KB")


for src, name, tris, h in JOBS:
    process(src, name, tris, h)

print("[build] done")
