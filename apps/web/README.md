# apps/web

`apps/web` は TanStack Start ベースのフロントエンドアプリケーションです。  
この README は、Web 実装担当者向けのローカル開発・実装ルール・確認手順をまとめています。

## 1. 役割とスコープ

- UI 実装（画面・ルーティング・表示ロジック）
- ルート単位のデータ取得と表示責務の整理
- API との接続（契約は `@repo/api-client` を利用）

共通運用ルールはルートの `AGENTS.md` を優先し、`apps/web/AGENTS.md` をこのディレクトリの補足ルールとして扱います。

## 2. 技術スタック

- TanStack Start
- TanStack Router（file-based routing）
- React 19
- Vite
- Vitest + Testing Library

## 3. 主要ディレクトリ

```text
apps/web/
├─ src/
│  ├─ routes/        # ルート定義（file-based）
│  ├─ components/    # 画面共通部品
│  ├─ data/          # デモ/静的データ
│  └─ styles.css     # グローバルスタイル
├─ public/           # 静的アセット
└─ vite.config.ts
```

## 4. 開発コマンド

```bash
# 開発サーバー
npm run dev --workspace web

# 本番ビルド
npm run build --workspace web

# プレビュー
npm run preview --workspace web

# テスト
npm run test --workspace web
```

補足:
- 既定ポートは `3000` です。
- `apps/api` も `3000` を使うため、同時起動時はどちらかのポートを変更してください。

## 5. 実装ルール

- ルートは `src/routes` 配下に配置し、責務を route 単位で分離する
- UI 変更時は関連する route component と `src/components` を同時に見直す
- 状態管理は必要最小限にし、ローカルな責務はローカルに閉じる
- 命名はドメイン意図が分かる名前を優先する

## 6. API 連携方針

- FE/BE の共有点は OpenAPI 生成物のみとする
- API 仕様の型は `packages/api-client` を利用する
- API 契約変更がある PR では、`packages/contracts/openapi.yaml` と `packages/api-client/src/generated/*` の整合を確認する

## 7. テストと品質チェック

Web 変更時の最低確認:

```bash
npm run test --workspace web
npm run lint
npm run typecheck
```

必要に応じて全体確認:

```bash
npm run test
npm run build
```

## 8. 変更時チェックリスト

- ルート構成や導線に破綻がない
- ユーザー影響のある変更にテストを追加/更新した
- 不要な生成物やデモコードを混入させていない
- ルート README と齟齬のある運用ルールを追加していない

## 9. 参考

- ルートガイド: `README.md`
- Web 配下運用: `apps/web/AGENTS.md`
- API 契約運用: `docs/ci_cd_and_api_contracts.md`
