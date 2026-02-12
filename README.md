# fullstack-template

TanStack Start（Web）+ Hono（API）+ OpenAPI 契約駆動 + Terraform（IaC）で構成された、実運用前提のモノレポテンプレートです。

この README は、初期セットアップだけでなく、日常開発・契約更新・デプロイ運用までを一通りカバーするためのガイドです。

## 1. プロジェクト概要

- フロントエンド: `apps/web`（TanStack Start + TanStack Router）
- バックエンド: `apps/api`（Hono + OpenAPI）
- API 契約の正: `packages/contracts/openapi.yaml`
- API クライアント生成物: `packages/api-client/src/generated`
- IaC: `infra/`（Terraform、`test/stage/prod` 分離）

基本方針は「API 契約を中心に FE/BE の境界を保つ」ことです。  
FE/BE で内部型を直接共有せず、OpenAPI から生成した型・クライアントのみを共有点にします。

## 2. 技術スタック

- Node.js: `>=22.0.0`（Volta 固定: `22.14.0`）
- npm: `>=10.0.0`（Volta 固定: `10.9.2`）
- Monorepo: npm workspaces
- Task Orchestration: Turborepo
- Lint / Format: Biome
- Frontend: React 19, TanStack Start, Vite, Vitest
- Backend: Hono, `@hono/zod-openapi`, Drizzle ORM, PostgreSQL
- IaC: Terraform（AWS）

## 3. ディレクトリ構成

```text
.
├─ apps/
│  ├─ web/                  # フロントエンド（TanStack Start）
│  └─ api/                  # API（Hono）
├─ packages/
│  ├─ contracts/            # OpenAPI 契約（canonical）
│  ├─ api-client/           # OpenAPI 生成型・クライアント
│  ├─ config-biome/         # Biome 共通設定
│  └─ config-typescript/    # TS 共通設定
├─ infra/
│  ├─ bootstrap/            # Terraform backend 初期化用
│  ├─ modules/              # 再利用 Terraform module
│  └─ envs/
│     ├─ test/
│     ├─ stage/
│     └─ prod/
├─ docs/                    # 設計・運用ドキュメント
├─ scripts/                 # 契約生成・整合確認スクリプト
└─ AGENTS.md                # 運用ルール（必読）
```

## 4. セットアップ

```bash
npm ci
```

### API を起動

```bash
# 初回のみ API 用 env 雛形をコピー（npm run dev/start 用）
cp apps/api/.env.example apps/api/.env.local

npm run dev --workspace api
```

- `apps/api/.env.local` をローカル時に自動読込します（`NODE_ENV=production` では無効）。
- API URL: `http://localhost:3000`
- OpenAPI JSON: `http://localhost:3000/openapi.json`
- Swagger UI: `http://localhost:3000/docs`
- Healthcheck: `http://localhost:3000/health`（DB疎通込み）

### API + DB を Docker で起動（ローカル）

```bash
# 1) 初回のみ env 雛形をコピー
cp apps/api/.env.compose.example apps/api/.env.compose.local

# 2) DB と API を起動（migration は自動実行しない）
docker compose -f docker-compose.local.yml --env-file apps/api/.env.compose.local up -d db api

# 3) migration が必要なときだけ手動実行
docker compose -f docker-compose.local.yml --env-file apps/api/.env.compose.local --profile migration run --rm migrate
```

補足:
- ローカルは安全性優先で「手動 migration」運用です。
- DBを作り直す場合は `docker compose -f docker-compose.local.yml --env-file apps/api/.env.compose.local down -v` を使用します。

### Web を起動

```bash
npm run dev --workspace web
```

- Web URL: `http://localhost:3000`

補足: `apps/api` と `apps/web` はどちらも既定ポートが `3000` です。  
同時起動する場合はどちらかのポートを変更して起動してください（例: Web を `3001`）。

### ルートで並列起動

```bash
npm run dev
```

## 5. 主要コマンド

```bash
# 全体品質チェック
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run build

# 生成・契約関連
npm run generate:openapi
npm run generate:api-client
npm run verify:contract-drift
```

## 6. API 契約（OpenAPI）運用ルール

### 6.1 重要な原則

- API 契約の canonical は `packages/contracts/openapi.yaml`
- FE/BE 共有は OpenAPI 生成物のみを使う
- BE 内部リファクタだけなら契約変更は不要
- API 仕様変更時は `contracts` と `api-client generated` を同一 PR に含める

### 6.2 変更フロー

```bash
# 1) API 実装変更
# 2) 契約更新
npm run generate:openapi

# 3) クライアント再生成
npm run generate:api-client

# 4) ドリフト検証
npm run verify:contract-drift
```

コミット対象（仕様変更時）:
- `packages/contracts/openapi.yaml`
- `packages/api-client/src/generated/*`

## 7. ブランチ・環境・デプロイ運用

推奨ブランチ戦略:
- `feature/*` → `develop` → `staging` → `main`

GitHub Actions による環境対応:

| トリガー | Workflow | 対象環境 |
|---|---|---|
| PR / `develop` / `staging` / `main` push | `ci.yml` | 品質チェック |
| `develop` push | `cd-test.yml` | Test |
| `staging` push | `cd-stage.yml` | Stage |
| `main` push | `cd-prod.yml` | Prod |
| `infra/**` の PR / push | `terraform.yml` | plan / apply |

CD ワークフローでは Web build 時に `API_BASE_URL` を環境ごとに切り替えています。
加えて、デプロイ前に `db:migrate` を実行し、成功時のみ deploy に進む構成です。

## 8. CI 品質ゲート

`ci.yml` では以下を実行します。

- `npm ci`
- `npm run lint`
- `npm run format:check`
- `npm run typecheck`
- `npm run test`
- `npm run build`

PR で `packages/contracts/openapi.yaml` が変更された場合のみ、追加で以下を実行します。

- `oasdiff` breaking report（non-blocking）
- `oasdiff` changelog
- Spectral lint
- `npm run generate:api-client`
- 生成差分チェック（未コミット差分が出たら fail）

## 9. IaC 運用ルール（要点）

- `infra/modules`: 再利用モジュール
- `infra/envs/{test,stage,prod}`: 環境別スタック
- state は環境ごとに分離
- Secrets はコード・`tfvars` に埋め込まない（Secrets Manager 前提）
- `apply` 前に必ず `plan` を確認
- 破壊的変更は段階適用・事前レビューを必須にする

`terraform.yml` では以下を実施しています。
- PR（`infra/**` 変更時）: `infra/envs/test` で `plan`
- push（`develop` / `staging` / `main`）: 対応環境で `init` / `plan` / `apply`

## 10. コーディング規約と開発ルール

- TypeScript + ESM を使用
- Biome を唯一の lint / format 基準とする
- インデントは tab、文字列は double quote
- できるだけシンプルな実装を優先し、過剰防御を避ける
- 変更時は関連テスト（`*.test.ts` / `*.test.tsx`）の追加・更新を検討する

## 11. コミット / PR ルール

- Conventional Commits を推奨  
  例: `feat(web): add campaign filter`
- PR では scope・変更意図・影響範囲を簡潔に記載
- UI 変更を含む場合はスクリーンショットを添付
- OpenAPI 変更時は生成物を必ず同梱

## 12. 参考ドキュメント

- 全体運用規約: `AGENTS.md`
- API 配下補足: `apps/api/AGENTS.md`
- Web 配下補足: `apps/web/AGENTS.md`
- IaC 配下補足: `infra/AGENTS.md`
- 設計概要: `docs/architecture_overview.md`
- システム構成: `docs/system-architecture.md`
- IaC 設計: `docs/IaC.md`
- CI/CD と契約運用: `docs/ci_cd_and_api_contracts.md`
