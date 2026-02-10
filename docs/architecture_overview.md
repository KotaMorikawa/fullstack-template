# システム設計概要（Prod / Stage / Test）

## 1. 目的
- フロントエンド（TanStack Start）を **Vercelで最速にホスティング**する。
- バックエンド（Hono）は **AWS上のコンテナ**で管理する。
- Vercel Preview を活用し、**ブランチ単位のフロントエンド検証**を可能にする。
- バックエンドはブランチごとに増やさず、**Test環境をPreviewの受け皿**とする。
- 認証はフロントエンド側でライブラリを利用し、バックエンドは **JWT検証・認可**に集中する。
- 環境混線（Test → Prod など）を **issuer / audience レベルで構造的に防止**する。

---

## 2. 環境構成

### 2.1 Prod（本番）
**目的**: エンドユーザー向け本番環境

- FE
  - ホスティング: Vercel（Production）
  - URL: `https://app.example.com`
- BE
  - 実行環境: AWS（ECS/Fargate 等）
  - URL: `https://api.example.com`
- 認証
  - Prod用 IdP
  - JWT（issuer / audience 固定）
- アクセス制御
  - Vercel Authentication: **OFF**
  - CORS: `https://app.example.com` のみ許可

---

### 2.2 Stage（ステージ環境）
**目的**: 本番リリース直前の最終確認（Release Candidate）

- FE
  - ホスティング: Vercel
  - URL: `https://stage.app.example.com`
- BE
  - 実行環境: AWS（ECS/Fargate 等）
  - URL: `https://api-stage.example.com`
- 認証
  - Stage用 IdP
  - JWT（issuer / audience 固定）
- アクセス制御
  - Vercel Authentication: **ON**（社内メンバーのみ）
  - CORS: `https://stage.app.example.com` のみ許可
- 備考
  - Preview環境からの接続は禁止
  - 安定性を最優先とする

---

### 2.3 Test（開発・統合・Preview用）
**目的**: 開発者用・統合テスト用・Preview環境の受け皿

- FE
  - 固定URL: `https://test.app.example.com`（必要に応じて）
  - 可変URL: Vercel Preview（`https://<branch>.vercel.app`）
- BE
  - 実行環境: AWS（ECS/Fargate 等）
  - URL: `https://api-test.example.com`
- 認証
  - Test用 IdP
  - JWT（issuer / audience 固定）
- アクセス制御
  - Vercel Authentication: **ON**（社内メンバーのみ）
  - CORS:
    - `https://test.app.example.com`
    - `https://*.vercel.app`（Preview想定、条件付き許可）
- 備考
  - 壊れても良い環境
  - Previewは **必ず Test BE に接続**する

---

## 3. フロントエンド設計

- フレームワーク: TanStack Start
- ホスティング: Vercel
- 認証:
  - Auth0 / Clerk / Cognito 等の IdP SDK を利用
  - ログイン・セッション管理は SDK に委譲
- API通信:
  - `Authorization: Bearer <JWT>` を使用
  - 接続先は環境変数 `API_BASE_URL` で切り替える

---

## 4. バックエンド設計

- フレームワーク: Hono
- 実行環境: AWS コンテナ（ECS/Fargate or App Runner 等）
- 役割:
  - JWT検証（JWKS取得、issuer / audience チェック）
  - 認可（role / scope / tenant 等の claim に基づく制御）
  - 業務APIの提供

### 環境差分
- 同一 Docker イメージを使用
- 環境変数・Secrets により以下を切り替える
  - IdP issuer / audience
  - DB接続先
  - 外部API接続先
  - CORS許可Origin

---

## 5. 通信・セキュリティ設計

### 5.1 API接続先
Vercelの環境ごとに以下を設定する。

- Production: `API_BASE_URL=https://api.example.com`
- Stage: `API_BASE_URL=https://api-stage.example.com`
- Preview: `API_BASE_URL=https://api-test.example.com`

### 5.2 CORSポリシー

- Prod BE
  - Allow-Origin: `https://app.example.com`
- Stage BE
  - Allow-Origin: `https://stage.app.example.com`
- Test BE
  - Allow-Origin:
    - `https://test.app.example.com`
    - `https://*.vercel.app`
  - `Vary: Origin` を必ず付与

### 5.3 認証の環境分離
- Prod / Stage / Test で IdP を分離
- BEは環境ごとに issuer / audience を固定
- 異なる環境のJWTは必ず拒否する

---

## 6. デプロイ・ブランチ運用

| ブランチ種別 | FEデプロイ | 接続先BE |
|------------|-----------|---------|
| feature/*  | Vercel Preview | Test |
| develop / main | Test | Test |
| release/* | Stage | Stage |
| main（tag） | Prod | Prod |

---

## 7. 構成方針まとめ
- 環境は **Prod / Stage / Test の3環境**
- Vercel Previewは **Test環境に固定**
- Stage / Prod は Preview を完全に遮断
- 認証（JWT issuer / audience）で環境混線を防止
- BEはブランチごとに増やさず、運用負荷を抑える

---

## 8. 今後の検討事項
- IdPの最終選定と環境分離方法（3テナント or 3アプリ）
- Test環境の `*.vercel.app` 許可条件の強化有無
- DBおよび外部APIの環境分離ポリシー
- レート制限・WAF・監視設計

