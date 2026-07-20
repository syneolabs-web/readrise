"""Render reader.glb from the four cardinal directions to find its true front."""
import bpy
import math
import os
import mathutils

ROOT = r"D:\prodoxity"
OUT = os.path.join(ROOT, "scripts", "blender", "previews")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT, "public", "models", "reader.glb"))
obj = next(o for o in bpy.context.scene.objects if o.type == "MESH")

# strip baked colors so we see clean clay silhouettes
mesh = obj.data
while mesh.color_attributes:
    mesh.color_attributes.remove(mesh.color_attributes[0])
mat = bpy.data.materials.new("clay")
mat.use_nodes = True
mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.75, 0.7, 0.65, 1)
mesh.materials.clear()
mesh.materials.append(mat)

key = bpy.data.objects.new("k", bpy.data.lights.new("k", "SUN"))
key.data.energy = 3.5
key.rotation_euler = (math.radians(45), 0, math.radians(20))
bpy.context.collection.objects.link(key)
w = bpy.data.worlds.new("w")
w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.24, 0.23, 0.22, 1)
bpy.context.scene.world = w

center = mathutils.Vector((0, 0, 0.62))
views = {"posX": (2.6, 0), "negX": (-2.6, 0), "posY": (0, 2.6), "negY": (0, -2.6)}
sc = bpy.context.scene
sc.render.resolution_x = 420
sc.render.resolution_y = 420
sc.view_settings.view_transform = "Standard"

for tag, (x, y) in views.items():
    cam = bpy.data.objects.new("cam_" + tag, bpy.data.cameras.new("c"))
    bpy.context.collection.objects.link(cam)
    cam.location = center + mathutils.Vector((x, y, 0.35))
    cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    sc.render.filepath = os.path.join(OUT, f"card_{tag}.png")
    bpy.ops.render.render(write_still=True)
    print(f"[diag3] {tag} rendered")
