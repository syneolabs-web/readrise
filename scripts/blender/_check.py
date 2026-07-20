import bpy, math, os, sys
sys.path.insert(0, r"D:\prodoxity\scripts\blender")
OUT = r"D:\prodoxity\scripts\blender\previews"
for name in ["scroller", "reader", "pair"]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(r"D:\prodoxity\public\models", name + ".glb"))
    import mathutils
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    mins = mathutils.Vector((1e9,)*3); maxs = mathutils.Vector((-1e9,)*3)
    for o in meshes:
        for c in o.bound_box:
            wc = o.matrix_world @ mathutils.Vector(c)
            mins = mathutils.Vector(map(min, mins, wc)); maxs = mathutils.Vector(map(max, maxs, wc))
    center = (mins + maxs) / 2; size = (maxs - mins).length
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("c"))
    bpy.context.collection.objects.link(cam)
    cam.location = center + mathutils.Vector((size*0.25, -size*0.95, size*0.35))
    cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam
    key = bpy.data.objects.new("k", bpy.data.lights.new("k", "SUN")); key.data.energy = 4
    key.rotation_euler = (math.radians(50), 0, math.radians(30)); bpy.context.collection.objects.link(key)
    w = bpy.data.worlds.new("w"); w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.25,0.24,0.23,1)
    bpy.context.scene.world = w
    sc = bpy.context.scene; sc.view_settings.view_transform = 'Standard'
    sc.render.resolution_x = 560; sc.render.resolution_y = 560
    sc.render.filepath = os.path.join(OUT, "out_" + name + ".png")
    bpy.ops.render.render(write_still=True)
    print("[check]", name, "ok")
