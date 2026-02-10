# CI/CD・API契約（OpenAPI）・型共有 運用ドキュメント

## 1. 目的
本ドキュメントは、モノレポ構成における **FE（TanStack Start）/ BE（Hono）/ OpenAPI 契約 / 型共有 / CI/CD** の運用を明確化し、以下を実現する。

- BE 内部リファクタによるノイズを抑える
- API 契約変更を安全に検知・共有する
- AI コーディング前提でも破綻しない CI/CD を構築する

---

## 2. 前提
- モノレポ構成で FE / BE / packages / infra を管理する
- FE は Vercel、BE は AWS で運用する
- OpenAPI を API 契約の中心に据える
- 型共有は OpenAPI 生成物を唯一の共有点とする
- パッケージマネージャは **npm** を採用する
- タスク実行は **npm + Turborepo** を採用する
- lint / format は **Biome** に統一する

---

## 3. ブランチ・環境戦略

### ブランチと環境の対応
| ブランチ | 環境 | デプロイ | 備考 |
|---|---|---|---|
| feature/* | なし | なし | PR 用ブランチ |
| develop | Test | 自動 | feature → develop マージ後 |
| stg | Stage | 自動 | リリース前検証 |
| main | Prod | 自動 | 本番 |

---

## 4. ディレクトリ構成と責務

```text
apps/
  web/                   # TanStack Start
  api/                   # Hono（API実装・OpenAPI生成元）
packages/
  contracts/             # API契約の正（openapi.yaml）
  api-client/            # OpenAPIから生成した型 + fetch client
  config-typescript/     # tsconfig 共通設定
  config-biome/          # biome 共通設定
infra/
  bootstrap/
  modules/
  envs/
```

### 責務の整理
- **apps/api**
  - Hono による API 実装
  - OpenAPI 定義の生成元

- **packages/contracts**
  - `openapi.yaml` を管理
  - API 契約の canonical（正）
  - 契約変更の意思がある場合のみ更新する

- **packages/api-client**
  - `openapi.yaml` から生成した TypeScript 型 + client
  - FE が利用する唯一の API 型定義

---

## 5. API 契約と型共有ポリシー

### 基本方針
- FE / BE で **内部 DTO やドメイン型を直接共有しない**
- 共有するのは **OpenAPI から生成された型と client のみ**

### 理由
- BE 内部構成変更（ディレクトリ再編、DTO 分割など）が FE に波及しない
- API 契約変更のみを明示的にレビュー可能
- AI によるリファクタで境界が壊れにくい

---

## 6. OpenAPI の生成・更新ルール

- OpenAPI は `apps/api/src/openapi/openapi.yaml` を生成元とする
- `npm run generate:openapi` で `packages/contracts/openapi.yaml` を更新する
- 以下の場合のみ `openapi.yaml` を更新する
  - 新規 API 追加
  - 既存 API の仕様変更

※ BE 内部リファクタのみの場合は更新しない

---

## 7. API 追加・変更フロー（単一 PR）

1. `apps/api` にエンドポイントを実装（schema 含む）
2. `npm run generate:openapi` を実行
3. `packages/contracts/openapi.yaml` を更新
4. `npm run generate:api-client` を実行し、生成物をコミット
5. 必要に応じて `apps/web` を実装
6. PR 作成 → CI 実行 → マージ

---

## 8. FE（TanStack Start）と client 設計

### 方針
- CSR / SSR の両方で同一 client を利用できる設計とする

### client の考え方
- `packages/api-client` は **fetch を注入できる factory 形式**とする
- CSR: ブラウザの fetch を使用
- SSR: サーバー側 fetch + request header / cookie を注入

---

## 9. Vercel 運用

### Preview デプロイ
- `apps/web` または依存 packages に変更がある場合のみ Preview を作成
- API 向き先は **常に Test API**（`https://api-test.example.com`）

---

## 10. CI（GitHub Actions）運用

### Node / npm バージョン
- **CI 側で固定**（`actions/setup-node`）
- `npm ci` を必須化
- ローカルは `engines` で推奨バージョンを明示

### PR 時の CI

#### 常時実行
- `npm run lint`（Biome）
- `npm run format:check`（Biome）
- `npm run typecheck`
- `npm run test`
- `npm run build`

#### `packages/contracts/openapi.yaml` が変更された場合のみ
- oasdiff breaking（fail しない、レポートのみ）
- oasdiff changelog 出力
- Spectral（OpenAPI lint）
- `npm run generate:api-client` → 差分があれば fail

---

## 11. CD（自動デプロイ）

- develop マージ → Test 環境へ自動デプロイ
- stg マージ → Stage 環境へ自動デプロイ
- main マージ → Prod 環境へ自動デプロイ

---

## 12. contracts 変更のレビュー方針（暫定）

- 通常 PR と同じレビュー運用
- レビュワーは以下を確認する
  - oasdiff changelog
  - Spectral lint 結果
  - api-client の差分（FE 影響）

---

## 13. 差分検知（生成物整合）の考え方

理想的にはローカル生成と CI 生成で差分は出ないが、以下の理由で差分が生じうる。

- Node / 依存バージョン差
- 生成し忘れ、コミット漏れ
- 非決定的な生成順序

そのため CI での再生成と diff チェックを **安全装置**として必須とする。

---

## 14. 今後の拡張ポイント（未決定）
- contracts の CODEOWNERS 設定
- breaking change を fail にする運用
- Stage / Prod の Blue-Green デプロイ

---

以上
