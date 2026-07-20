"""Render a 3/4-view preview PNG of every 3D asset candidate.

Run:  blender --background --python scripts/blender/preview-assets.py -- <outdir>

Each asset gets a fresh scene, auto-framed camera, three-point-ish light, and
a neutral grey world so the geometry reads honestly — no flattering tricks.
"""
import bpy
import math
import os
import sys

ASSETS = r"D:\prodoxity\assets"
OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else r"D:\prodoxity\scripts\blender\previews"

CANDIDATES = [
    ("white_mesh.glb", "glb"),
    ("white_mesh (1).glb", "glb"),
    ("white_mesh (2).glb", "glb"),
    ("white_mesh (3).glb", "glb"),
    ("characterMedium.fbx", "fbx"),
    ("Ch42_nonPBR.fbx", "fbx"),
]

os.makedirs(OUT, exist_ok=True)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def frame_and_render(name):
    # Collect imported mesh bounds
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if not meshes:
        print(f"[preview] {name}: NO MESHES")
        return

    # world-space bounding box
    import mathutils
    mins = mathutils.Vector((1e9, 1e9, 1e9))
    maxs = mathutils.Vector((-1e9, -1e9, -1e9))
    for o in meshes:
        for corner in o.bound_box:
            wc = o.matrix_world @ mathutils.Vector(corner)
            mins = mathutils.Vector(map(min, mins, wc))
            maxs = mathutils.Vector(map(max, maxs, wc))
    center = (mins + maxs) / 2
    size = max((maxs - mins).length, 0.001)

    # camera at 3/4 view
    cam_data = bpy.data.cameras.new("cam")
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.collection.objects.link(cam)
    dist = size * 1.1
    cam.location = center + mathutils.Vector((dist, -dist, dist * 0.6))
    direction = center - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam

    # lights
    key = bpy.data.objects.new("key", bpy.data.lights.new("key", "SUN"))
    key.data.energy = 4.0
    key.rotation_euler = (math.radians(50), 0, math.radians(30))
    bpy.context.collection.objects.link(key)
    fill = bpy.data.objects.new("fill", bpy.data.lights.new("fill", "SUN"))
    fill.data.energy = 1.2
    fill.rotation_euler = (math.radians(60), 0, math.radians(-120))
    bpy.context.collection.objects.link(fill)

    # neutral world
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.28, 0.27, 0.26, 1)
    bpy.context.scene.world = world

    scene = bpy.context.scene
    scene.render.resolution_x = 640
    scene.render.resolution_y = 640
    scene.render.filepath = os.path.join(OUT, name + ".png")
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except Exception:
        pass
    bpy.ops.render.render(write_still=True)
    tri_total = sum(len(o.data.polygons) for o in meshes)
    print(f"[preview] {name}: rendered, polys={tri_total}, size={size:.2f}")


for fname, kind in CANDIDATES:
    reset_scene()
    path = os.path.join(ASSETS, fname)
    try:
        if kind == "glb":
            bpy.ops.import_scene.gltf(filepath=path)
        else:
            bpy.ops.import_scene.fbx(filepath=path)
    except Exception as e:
        print(f"[preview] {fname}: IMPORT FAILED — {e}")
        continue
    safe = fname.replace(" ", "_").replace("(", "").replace(")", "").rsplit(".", 1)[0]
    frame_and_render(safe)

print("[preview] done")
