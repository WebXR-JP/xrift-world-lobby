# キャラクリブース（AvatarMaker）設計

ワールド内で簡易的にアバターの色をカスタマイズし、VRM としてダウンロードできる仕組み。
Resonite の NeoRoid のような体験を XRift のロビーで提供する。

## 要件

- 編集できるのは **色だけ**（最初のバージョン）。パーツの切り替えや体型変更はしない
- 色は **パレットから選ぶ**（部位ごとに 8〜12 色）。自由な色指定はしない
- プレビューの色と向きは **インスタンス内の全員で共有** する
- プレビューの回転は **◀ / ▶ ボタン** で 45° ずつ（ドラッグ操作はしない）
- ダウンロードすると、現在の色が反映された `.vrm` が端末に保存される

## ベースモデル

`public/avatar-base.vrm`（VRM 1.0）。元データは `blender/avatar-base.blend`。
メッシュは ChatGPT（Codex）が `blender/hair_reference.png` を参考に手作業で作ったもの（2026-10-20 取り込み）。
`blender/build_avatar_mesh.py` はそれ以前の手続き生成版で、現在は使っていない。

- 頭（髪付き）・胴体・腕（袖＋手）の 3 パーツ構成。脚は VRM の必須ボーンとして胴体内に収めている（メッシュなし）
- 腕のボーンは VRM の規定どおり T ポーズ。メッシュの袖は少し下がった A ポーズ気味に作られている
- 目・口・頬・耳の内側は立体のパーツ（マテリアル `Eyes` / `Cheeks` / `Mouth` / `Tongue` / `EarInner`、色変更の対象外）
- `head` ボーンは y=1.20 に置く。XRift はネームプレートを「head ボーンの高さ + 0.4m」に出すため、
  髪の頂点（y=1.455）から 14cm 上（y=1.60）に出るようにしている。目ボーンは y=0.966 のまま（目線の高さに使われる）
- 全マテリアルは MToon。色を変える部位のテクスチャは持たず、`baseColorFactor` / `shadeColorFactor` だけで色が決まる
- メッシュには **UV（`TEXCOORD_0`）が必須**。テクスチャは使わないが、XRift 本体の VRM 最適化（`vrmOptimizer`）が
  UV のないプリミティブを「UVアトリビュートが存在しません」で拒否するため、Smart UV Project で UV を付けている。
  Blender で再書き出しするときは UV マップを消さないこと
- 面の向きは **全パーツ外向き** にすること。XRift の最適化で統合されるマテリアルは片面描画（FrontSide）固定のため、
  裏向きの面は両面描画のベース VRM では見えてもアップロード後に消える（2026-10-20 に口・頬・舌で発生、flip_normals で修正）

| マテリアル | 対象 | 初期色（ベース / 影） |
|---|---|---|
| `Skin` | 頭・耳・首・手 | `#fde0cc` / `#f2b9a0` |
| `Hair` | 髪（ふんわりショート） | `#b8b0c4` / 影は自動算出 |
| `Body` | 胴体 | `#5b2ff0` / `#4120c0` |
| `Arms` | 袖 | `#5b2ff0` / `#4120c0` |
| `Eyes` | 目（立体パーツ） | `#002691` / 影は自動算出 |
| `Cheeks` ほか | 口・頬・耳の内側（立体パーツ） | 変更対象外 |

メタ情報: 作者 `XRift`（仮）、誰でも利用可、商用利用・改変・再配布可、クレジット不要。配布前に要確認。

## 配置

西ウイングに「キャラクリブース」を置く。

1. **プレビュー台**: ベース VRM を three-vrm で表示
2. **色パレットのパネル**: 部位（Skin / Body / Arms）ごとに色見本を並べ、クリックで色を変える
3. **◀ / ▶ ボタン**: プレビューを 45° ずつ回す
4. **ダウンロードボタン**: 現在の色の `.vrm` を保存
5. **リセットボタン**: 色と向きを初期値に戻す

## コード構成

```
src/components/AvatarMaker/
├── index.tsx          # ブース全体（配置・ボタン）
├── Preview.tsx        # three-vrm でベースモデルを表示し、色と向きを反映
├── ColorPanel.tsx     # 部位ごとの色パレット
├── parts.ts           # 部位の定義: マテリアル名・パレット（ベース色 / 影色のペア）・初期色
├── useAvatarColors.ts # useInstanceState で色と向きを共有
└── exportVrm.ts       # exportVrm(colors) => Blob
```

- 状態は `useInstanceState('avatar-maker')` で共有。`{ colors: { Skin, Body, Arms }, rotation }`
- 書き出しは `exportVrm(colors)` の 1 関数に閉じ込める。方式を入れ替えても他に影響しない

## データの流れ

**プレビュー**

1. `GLTFLoader` + `VRMLoaderPlugin` で `${baseUrl}avatar-base.vrm` を読み込む
2. 共有ステートの色が変わるたびに、対象マテリアル（`MToonMaterial`）の `color` と `shadeColorFactor` を書き換える

**書き出し（方式 A：JSON の色の値だけ書き換える）**

1. 同じ `.vrm` を `FileLoader`（`arraybuffer`）で読み込む。ワールドのコードに `fetch` は直接書かない
2. GLB を JSON チャンクとバイナリチャンクに分け、JSON 内の対象マテリアルの
   `pbrMetallicRoughness.baseColorFactor` と `extensions.VRMC_materials_mtoon.shadeColorFactor` を書き換える
3. GLB に組み直して Blob にし、`avatar-YYYYMMDD.vrm` として保存する

骨格・表情・揺れ物などは一切触らないので、元ファイルの VRM 固有情報がそのまま保たれる。

**色の変換**: パレットは sRGB の 16 進数で持ち、ファイルに書くときはリニア値に変換する（glTF の仕様）。
プレビューとダウンロードした VRM の色がずれないよう必須。

**将来（方式 B）**: three-vrm で読み込んだシーンを three.js の `GLTFExporter` で書き出し、VRM 拡張を
自前で付け直す。パーツ切り替えなど、JSON の書き換えでは足りない編集が必要になったら移行する。
`exportVrm.ts` の中身を差し替えるだけで済むようにしておく。

## エラー処理

- モデルの読み込み失敗: プレビュー台に「読み込みに失敗しました」と表示し、ダウンロードボタンを無効化
- VR 中のダウンロード: 保存はせず「VR を終了してからダウンロードしてください」と表示
- 同時に色を変えたとき: 最後に押した人の色が採用される（共有ステートの通常の挙動）

## 検証

- `@pixiv/three-vrm` を同梱したビルドは、セキュリティチェックの `no-obfuscation` に引っかかる
  （three-vrm のライブラリ自体が `_VRMFirstPerson` のような `_` 始まりのクラス名を持つため）。
  禁止 API（eval / Worker / fetch 等）は含まれていないことを確認したうえで、`xrift.json` の
  `permissions.allowedCodeRules` に `no-obfuscation` を加えて通している
- `exportVrm` の単体テスト: 書き出したファイルを three-vrm で再読み込みできること、色の値が書き換わっていること
- 書き出した VRM を XRift 本体のアバター設定に取り込めることを手動で確認する
