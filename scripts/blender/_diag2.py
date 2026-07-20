"""Visual diagnosis: bake (a) rn/un gradient, (b) raw projection, render front views."""
import bpy
import numpy as np
import os

ROOT = r"D:\prodoxity"
OUT = os.path.join(ROOT, "scripts", "blender", "previews")
name = "reader"
art_file = "Boy_sitting_reading_open_book_202607181613.jpeg"
u0, v0, u1, v1 = (0.30, 0.01, 0.74, 0.99)

SQ2 = 2 ** 0.5
R = np.array((1 / SQ2, 1 / SQ2, 0))
U = np.array((0, 0, 1))


def setup():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, "public", "models", f"{name}.glb"))
    obj = next(o for o in bpy.context.scene.objects if o.type == "MESH")
    mesh = obj.data
    n = len(mesh.vertices)
    co = np.empty(n * 3, dtype=np.float64)
    mesh.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    rr = co @ R
    uu = co @ U
    rn = (rr - rr.min()) / (rr.max() - rr.min())
    un = (uu - uu.min()) / (uu.max() - uu.min())
    return obj, mesh, n, rn, un


def paint_and_render(tag, colors, obj, mesh):
    # nuke existing color attrs, add ours
    while mesh.color_attributes:
        mesh.color_attributes.remove(mesh.color_attributes[0])
    attr = mesh.color_attributes.new(name="Col", type="FLOAT_COLOR", domain="POINT")
    attr.data.foreach_set("color", colors.ravel())
    mesh.color_attributes.active_color = attr

    mat = bpy.data.materials.new("dbg")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    ca = nt.nodes.new("ShaderNodeVertexColor")
    ca.layer_name = "Col"
    nt.links.new(ca.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = 1.0
    bsdf.inputs["Base Color"].default_value = (0, 0, 0, 1)
    mesh.materials.clear()
    mesh.materials.append(mat)

    import mathutils, math
    center = mathutils.Vector((0, 0, 0.62))
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("c"))
    bpy.context.collection.objects.link(cam)
    d = 2.6
    cam.location = center + mathutils.Vector((d / SQ2, -d / SQ2, 0.25))
    cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam
    w = bpy.data.worlds.new("w"); w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.1, 0.1, 0.1, 1)
    bpy.context.scene.world = w
    sc = bpy.context.scene
    sc.render.resolution_x = 560
    sc.render.resolution_y = 560
    sc.view_settings.view_transform = 'Standard'
    sc.render.filepath = os.path.join(OUT, f"diag_{tag}.png")
    bpy.ops.render.render(write_still=True)
    print(f"[diag2] {tag} rendered")


# (a) gradient: red = rn (screen right), green = un (up)
obj, mesh, n, rn, un = setup()
grad = np.stack([rn, un, np.zeros(n), np.ones(n)], axis=1).astype(np.float32)
paint_and_render("gradient", grad, obj, mesh)

# (b) raw projection, no bg walk
obj, mesh, n, rn, un = setup()
img = bpy.data.images.load(os.path.join(ROOT, "assets", "art", art_file))
w, h = img.size
px = np.empty(w * h * 4, dtype=np.float32)
img.pixels.foreach_get(px)
px = px.reshape(h, w, 4)
# JPEG pixels arrive sRGB-encoded; vertex colors are linear. Decode or we double-encode.
srgb = px[:, :, :3]
px[:, :, :3] = np.where(srgb <= 0.04045, srgb / 12.92, ((srgb + 0.055) / 1.055) ** 2.4)
ix = np.clip(((u0 + rn * (u1 - u0)) * w).astype(int), 0, w - 1)
iy = np.clip(((v0 + un * (v1 - v0)) * h).astype(int), 0, h - 1)
raw = px[iy, ix].astype(np.float32)
raw[:, 3] = 1.0
paint_and_render("rawproject", raw, obj, mesh)
