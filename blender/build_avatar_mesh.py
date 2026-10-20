"""
キャラクリ用ベースアバターのメッシュを生成する Blender スクリプト。
Armature（VRM アドオンの基本アーマチュアを頭身に合わせて調整済み）と
マテリアル Skin / Body / Arms / Face がある前提で、Body メッシュを作り直す。

寸法は三面図（頭頂 z=1.38、胴体下端 z=0.20、1m = 504px）から読み取ったもの。
頭と胴体は「高さごとの半径」の輪郭を回転させて作り、袖と手は角を丸めた箱で作る。

色を変える部位（マテリアル）:
  Skin  … 頭・耳・首・手
  Hair  … 髪（ふんわりショート。キャップ＋毛束）
  Body  … 胴体
  Arms  … 袖
  Face  … 目・口・頬のデカール（テクスチャ。色変更の対象外）
"""
import bpy
import bmesh
import math
from mathutils import Vector

# 頭の輪郭 (z, 半径)。下が平らで頬が張った饅頭型
HEAD_PROFILE = [
    (0.755, 0.000), (0.758, 0.150), (0.770, 0.250), (0.795, 0.310),
    (0.840, 0.348), (0.900, 0.363), (0.970, 0.367), (1.050, 0.362),
    (1.130, 0.345), (1.210, 0.310), (1.280, 0.255), (1.330, 0.180),
    (1.365, 0.090), (1.380, 0.000),
]
HEAD_DEPTH_RATIO = 0.93   # 奥行き / 幅
FACE_FLATTEN = 0.94       # 顔側（前面）をわずかに平らにする

# 髪：ふんわりしたショート（blender/hair_reference.png）。
# 頭を一回り大きくしたキャップに、とがった毛束を全周にぶら下げる
HAIR_SCALE = 1.08                 # キャップの拡大率（頭の中心基準）
HAIR_TOP_LIFT = 0.03              # てっぺんのボリューム
HAIR_CAP_HEM_Z = 0.86             # キャップの裾（この下は毛束で表現）
HAIR_FACE_OPEN_Y = -0.10          # 顔の開口部（前面）
HAIR_FACE_OPEN_HALF_WIDTH = 0.27
HAIR_FACE_OPEN_Z = 1.02           # 前面はこの高さまで開ける（額は前髪の毛束で隠す）
# 毛束: (頭を上から見た角度[deg] 0=正面 90=左 180=後ろ, 先端の高さ, 長さ, 幅, 外向きの傾き[deg])
# 隣同士が重なる幅にして、裾全体がギザギザの輪郭になるようにする
HAIR_TUFTS = [
    (-48, 0.97, 0.2, 0.15, 5), (-24, 0.94, 0.21, 0.16, 3), (0, 0.985, 0.2, 0.15, 2),
    (24, 0.94, 0.21, 0.16, 3), (48, 0.97, 0.2, 0.15, 5),
    (-70, 0.85, 0.2, 0.15, 8), (70, 0.85, 0.2, 0.15, 8),
    (-92, 0.83, 0.2, 0.15, 10), (92, 0.83, 0.2, 0.15, 10),
    (-114, 0.81, 0.2, 0.15, 12), (114, 0.81, 0.2, 0.15, 12),
    (-136, 0.80, 0.2, 0.15, 13), (136, 0.80, 0.2, 0.15, 13),
    (-158, 0.80, 0.2, 0.15, 13), (158, 0.80, 0.2, 0.15, 13),
    (180, 0.81, 0.2, 0.15, 12),
]
HAIR_TUFT_DEPTH_RATIO = 0.6       # 毛束の奥行き / 幅

# 胴体の輪郭 (z, 半径)。上が細く下がふくらむ洋梨型（下から上へ）
BODY_PROFILE = [
    (0.200, 0.000), (0.205, 0.080), (0.220, 0.140), (0.260, 0.185),
    (0.320, 0.210), (0.400, 0.218), (0.480, 0.212), (0.560, 0.193),
    (0.630, 0.166), (0.680, 0.136), (0.705, 0.108), (0.714, 0.095),
    (0.716, 0.000),
]
BODY_DEPTH_RATIO = 0.95
COLLAR_RADIUS = 0.095     # 襟のへこみの半径
COLLAR_DEPTH = 0.025      # 襟の中央のへこみ量

# 袖の輪郭 (長さ方向の位置, 半径)。両端が丸い棒
SLEEVE_PROFILE = [
    (0.000, 0.000), (0.010, 0.028), (0.028, 0.044), (0.050, 0.050),
    (0.150, 0.050), (0.172, 0.044), (0.190, 0.028), (0.200, 0.000),
]

ARM_Z = 0.646             # 肩の高さ（T ポーズ）
SLEEVE_X0 = 0.185         # 袖の付け根（胴体との間にすき間を空ける）
HAND_CENTER_X = 0.465
HAND_RADII = (0.070, 0.058, 0.068)
THUMB_RADII = (0.032, 0.028, 0.032)

# 顔デカールが覆う正面の範囲（face.png の UV に対応）
FACE_X = (-0.3, 0.3)
FACE_Z = (0.72, 1.32)


def catmull_rom(points, samples=24):
    """制御点列を滑らかに補間して密な (z, r) 列を返す"""
    pts = [points[0]] + list(points) + [points[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = (Vector(p) for p in pts[i - 1:i + 3])
        for k in range(samples):
            t = k / samples
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t
                              + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                              + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t))
    out.append(Vector(points[-1]))
    return [(p.x, p.y) for p in out]


def radius_at(profile, z):
    for (z0, r0), (z1, r1) in zip(profile, profile[1:]):
        if z0 <= z <= z1:
            t = 0 if z1 == z0 else (z - z0) / (z1 - z0)
            return r0 + (r1 - r0) * t
    return 0.0


def build():
    old = bpy.data.objects.get('Body')
    if old:
        bpy.data.objects.remove(old, do_unlink=True)
    for me in list(bpy.data.meshes):
        if me.users == 0:
            bpy.data.meshes.remove(me)

    mats = {n: bpy.data.materials[n] for n in ('Skin', 'Hair', 'Body', 'Arms', 'Face')}
    parts = []

    def finish(o, mat, bone):
        o.data.materials.clear()
        o.data.materials.append(mats[mat])
        vg = o.vertex_groups.new(name=bone)
        vg.add([v.index for v in o.data.vertices], 1.0, 'REPLACE')
        for p in o.data.polygons:
            p.use_smooth = True
        parts.append(o)
        return o

    def edit(o, fn):
        bm = bmesh.new()
        bm.from_mesh(o.data)
        for v in bm.verts:
            fn(v.co)
        bm.to_mesh(o.data)
        bm.free()

    def lathe(name, profile, depth_ratio, seg=48, rings=36, grow=0.0):
        """輪郭 (z, r) を Z 軸まわりに回転させた形。UV 球の各頂点を輪郭に合わせて置き直す"""
        prof = [(z, r + grow if r > 0 else r) for z, r in catmull_rom(profile)]
        zmin, zmax = profile[0][0], profile[-1][0]
        bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=1, location=(0, 0, 0))
        o = bpy.context.active_object
        o.name = name

        def reshape(c):
            z = zmin + (c.z + 1) / 2 * (zmax - zmin)
            rho = math.hypot(c.x, c.y)
            r = radius_at(prof, z)
            if rho > 1e-9:
                c.x, c.y = c.x / rho * r, c.y / rho * r * depth_ratio
            else:
                c.x, c.y = 0.0, 0.0
            c.z = z
        edit(o, reshape)
        return o

    def ellipsoid(name, center, radii, seg=24, rings=16):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=1, location=center)
        o = bpy.context.active_object
        o.name = name
        o.scale = radii
        bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)
        return o

    # ---- 頭 ----
    head = lathe('Head', HEAD_PROFILE, HEAD_DEPTH_RATIO)

    def flatten_face(c):
        if c.y < 0:
            c.y *= FACE_FLATTEN
    edit(head, flatten_face)
    finish(head, 'Skin', 'head')

    # 髪：キャップ（頭の輪郭を中心から拡大し、てっぺんを持ち上げる）
    head_prof = catmull_rom(HEAD_PROFILE)
    head_bottom, head_top = HEAD_PROFILE[0][0], HEAD_PROFILE[-1][0]
    head_center = (head_bottom + head_top) / 2

    def hair_radius(z):
        z_head = head_center + (z - head_center) / HAIR_SCALE
        return HAIR_SCALE * radius_at(head_prof, z_head)

    hair_top = head_center + (head_top - head_center) * HAIR_SCALE + HAIR_TOP_LIFT
    hair_bottom = HAIR_CAP_HEM_Z - 0.03
    n = 48
    hair_profile = [(hair_bottom, 0.0)]
    for i in range(1, n):
        z = hair_bottom + (hair_top - hair_bottom) * i / n
        # てっぺん側は持ち上げた分だけ縦に引き伸ばして輪郭を取る
        z_src = z if z < head_center else head_center + (z - head_center) * (head_top - head_center) * HAIR_SCALE / (hair_top - head_center)
        hair_profile.append((z, hair_radius(z_src)))
    hair_profile.append((hair_top, 0.0))
    hair = lathe('Hair', hair_profile, HEAD_DEPTH_RATIO, seg=64, rings=48)
    edit(hair, flatten_face)

    bm = bmesh.new()
    bm.from_mesh(hair.data)
    cut = [
        v for v in bm.verts
        if v.co.z < HAIR_CAP_HEM_Z
        or (v.co.y < HAIR_FACE_OPEN_Y and abs(v.co.x) < HAIR_FACE_OPEN_HALF_WIDTH and v.co.z < HAIR_FACE_OPEN_Z)
    ]
    bmesh.ops.delete(bm, geom=cut, context='VERTS')
    bm.to_mesh(hair.data)
    bm.free()
    finish(hair, 'Hair', 'head')

    # 髪：毛束。根元をキャップの表面に埋め、先端を下へ少し外向きに
    tuft_profile = [(0.0, 0.0), (0.12, 0.42), (0.3, 0.75), (0.55, 0.98), (0.8, 1.0), (0.95, 0.9), (1.0, 0.0)]
    for i, (deg, tip_z, length, width, tilt_deg) in enumerate(HAIR_TUFTS):
        theta = math.radians(deg)
        u = Vector((math.sin(theta), -math.cos(theta), 0.0))  # 外向き（水平）
        root_z = tip_z + length
        r = hair_radius(root_z) - 0.02
        root = Vector((u.x * r, u.y * r * HEAD_DEPTH_RATIO, root_z))
        tilt = math.radians(tilt_deg)
        axis = (Vector((0, 0, -1)) * math.cos(tilt) + u * math.sin(tilt)).normalized()  # 根元 → 先端
        # 先端を原点、根元を +Z 方向 length の位置に置いた毛束を作る
        prof = [(length * t, width / 2 * rr) for t, rr in tuft_profile]
        tuft = lathe(f'Tuft.{i}', prof, HAIR_TUFT_DEPTH_RATIO, seg=16, rings=14)
        rot = Vector((0, 0, 1)).rotation_difference(-axis)
        tip = root + axis * length

        def place(c, rot=rot, tip=tip):
            c.rotate(rot)
            c += tip
        edit(tuft, place)
        finish(tuft, 'Hair', 'head')

    # 耳：頭の側面に貼りつく、厚みの薄い半楕円
    for s in (1, -1):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=14, radius=1, location=(s * 0.352, 0.015, 0.905))
        ear = bpy.context.active_object
        ear.name = 'Ear'
        ear.scale = (0.034, 0.048, 0.062)
        bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)
        finish(ear, 'Skin', 'head')

    # 首：短い円柱
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.052, depth=0.07, location=(0, 0, 0.74))
    neck = bpy.context.active_object
    neck.name = 'Neck'
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)
    finish(neck, 'Skin', 'neck')

    # ---- 胴体 ----
    body = lathe('Torso', BODY_PROFILE, BODY_DEPTH_RATIO, rings=40)

    def collar(c):
        rho = math.hypot(c.x, c.y)
        if c.z > 0.70 and rho < COLLAR_RADIUS:
            c.z -= COLLAR_DEPTH * (1 - (rho / COLLAR_RADIUS) ** 2)
    edit(body, collar)
    finish(body, 'Body', 'chest')
    vg_hips = body.vertex_groups.new(name='hips')
    vg_chest = body.vertex_groups['chest']
    for v in body.data.vertices:
        if v.co.z < 0.40:
            vg_chest.remove([v.index])
            vg_hips.add([v.index], 1.0, 'REPLACE')

    # ---- 腕（VRM の規定どおり T ポーズ。袖と手は浮いたパーツ） ----
    for s, side in ((1, 'L'), (-1, 'R')):
        sleeve = lathe(f'Sleeve.{side}', SLEEVE_PROFILE, 1.0, seg=32, rings=24)
        # 輪郭は z 方向に作ってあるので、x 方向に倒して肩の位置へ

        def lay_down(c, s=s):
            c.x, c.y, c.z = s * (SLEEVE_X0 + c.z), c.y, ARM_Z + c.x
        edit(sleeve, lay_down)
        finish(sleeve, 'Arms', f'upper_arm.{side}')

        # 手：丸いミトン。前側・内側に親指の山を重ねる
        finish(ellipsoid(f'Hand.{side}', (s * HAND_CENTER_X, 0, ARM_Z), HAND_RADII, seg=32, rings=20), 'Skin', f'hand.{side}')
        finish(ellipsoid(f'Thumb.{side}', (s * (HAND_CENTER_X - 0.03), -0.05, ARM_Z + 0.03), THUMB_RADII), 'Skin', f'hand.{side}')

    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    mesh_obj = bpy.context.active_object
    mesh_obj.name = 'Body'
    mesh_obj.data.name = 'Body'
    arm = bpy.data.objects['Armature']
    mesh_obj.parent = arm
    mesh_obj.modifiers.new('Armature', 'ARMATURE').object = arm
    add_face_decal(mesh_obj)
    return mesh_obj


def add_face_decal(mesh_obj):
    """頭の前面を複製して少し浮かせ、Face マテリアル（透過テクスチャ）を割り当てる"""
    me = mesh_obj.data
    names = [m.name for m in me.materials]
    if 'Face' not in names:
        me.materials.append(bpy.data.materials['Face'])
    face_idx = [m.name for m in me.materials].index('Face')
    skin_idx = [m.name for m in me.materials].index('Skin')
    head_vg = mesh_obj.vertex_groups['head'].index

    bm = bmesh.new()
    bm.from_mesh(me)
    deform = bm.verts.layers.deform.active
    uv = bm.loops.layers.uv.active or bm.loops.layers.uv.new('UVMap')

    def on_head(v):
        return head_vg in v[deform] and v[deform][head_vg] > 0.5

    sel = []
    for f in bm.faces:
        if f.material_index != skin_idx or not all(on_head(v) for v in f.verts):
            continue
        c = f.calc_center_median()
        if f.normal.y < -0.15 and FACE_X[0] < c.x < FACE_X[1] and FACE_Z[0] < c.z < FACE_Z[1]:
            sel.append(f)
    ret = bmesh.ops.duplicate(bm, geom=sel)
    new_faces = [g for g in ret['geom'] if isinstance(g, bmesh.types.BMFace)]
    new_verts = [g for g in ret['geom'] if isinstance(g, bmesh.types.BMVert)]
    bm.normal_update()
    for v in new_verts:
        v.co += v.normal * 0.002
    for f in new_faces:
        f.material_index = face_idx
        for l in f.loops:
            x, z = l.vert.co.x, l.vert.co.z
            l[uv].uv = ((x - FACE_X[0]) / (FACE_X[1] - FACE_X[0]), (z - FACE_Z[0]) / (FACE_Z[1] - FACE_Z[0]))
    bm.to_mesh(me)
    bm.free()


build()
