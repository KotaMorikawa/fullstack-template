# apps/api

`apps/api` は Hono ベースの API サービスです。  
この README は、API 実装担当者向けにエントリポイント、契約運用、変更フローを整理したものです。

## 1. 役割とスコープ

- 業務 API の実装
- OpenAPI 仕様の提供
- 契約駆動開発における契約生成元としての責務

共通運用ルールはルート `AGENTS.md` を優先し、`apps/api/AGENTS.md` を API 固有ルールとして参照してください。

## 2. 技術スタック

- Hono
- `@hono/zod-openapi`
- `@hono/swagger-ui`
- TypeScript（ESM）

## 3. エントリポイント

- 起動エントリ: `apps/api/src/index.ts`
- アプリ定義: `apps/api/src/app.ts`

## 4. 開発コマンド

```bash
# 開発サーバー
npm run dev --workspace api

# ビルド
npm run build --workspace api

# ビルド成果物で起動
npm run start --workspace api
```

## 5. 提供エンドポイント（現状）

- `GET /health` - Health check
- `GET /openapi.json` - OpenAPI ドキュメント
- `GET /docs` - Swagger UI

ローカル起動時の既定 URL: `http://localhost:3000`

## 6. API 契約（OpenAPI）運用

### 基本原則

- API 契約の canonical は `packages/contracts/openapi.yaml`
- 仕様変更時は契約更新を同一 PR に含める
- FE/BE の共有は OpenAPI 生成物のみを利用する

### 変更フロー

```bash
# 1) API 実装更新（schema/route 含む）

# 2) OpenAPI を生成
npm run generate:openapi

# 3) API クライアント生成物を更新
npm run generate:api-client

# 4) 契約ドリフトを検証
npm run verify:contract-drift
```

仕様変更時のコミット対象:
- `packages/contracts/openapi.yaml`
- `packages/api-client/src/generated/*`

## 7. 実装ルール

- 新規/変更エンドポイントは schema とレスポンス定義を明示する
- 破壊的変更は回避し、必要時は移行方針を記述する
- 内部リファクタと契約変更を混同しない
- 認可・認証や環境依存値は実行環境の設定に分離する

## 8. 変更時チェックリスト

- エンドポイント仕様を schema で表現できている
- OpenAPI と生成物の同期を実施した
- `npm run verify:contract-drift` が通る状態である
- API 変更に伴う Web 側影響を確認した

## 9. 参考

- ルートガイド: `README.md`
- API 配下運用: `apps/api/AGENTS.md`
- 契約運用詳細: `docs/ci_cd_and_api_contracts.md`
