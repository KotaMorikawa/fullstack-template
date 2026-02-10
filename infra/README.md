# infra

`infra` は Terraform によるインフラ定義を管理するディレクトリです。  
この README は、IaC 担当者向けの構成理解と運用ルールをまとめています。

## 1. 目的

- AWS インフラをコードとして管理する
- `test` / `stage` / `prod` の環境分離を徹底する
- 変更履歴と再現性を担保した運用を行う

## 2. ディレクトリ構成

```text
infra/
├─ bootstrap/      # backend（state/lock）初期構成
├─ modules/        # 再利用 Terraform modules
└─ envs/
   ├─ test/        # Test 環境スタック
   ├─ stage/       # Stage 環境スタック
   └─ prod/        # Prod 環境スタック
```

`modules` は環境非依存、`envs/*` は環境固有設定という責務で分離します。

## 3. 基本運用ルール

- `apply` 前に必ず `plan` の差分を確認する
- 破壊的変更（ネットワーク/RDS/ALB 等）は事前レビュー必須
- 機密情報はコード・`tfvars` に直接記載しない
- Secrets は Secrets Manager 等の既存設計に従う
- 単一環境向け変更か全環境展開変更かを明示してから作業する

## 4. よく使うコマンド例

```bash
# Test 環境
cd infra/envs/test
terraform init
terraform plan

# Stage 環境
cd infra/envs/stage
terraform init
terraform plan

# Prod 環境
cd infra/envs/prod
terraform init
terraform plan
```

`terraform apply` は対象環境と影響範囲を明確にした上で実施してください。

## 5. CI/CD との関係

GitHub Actions の `terraform.yml` では以下を実施しています。

- PR（`infra/**` 変更時）: `infra/envs/test` で `terraform plan`
- `develop` / `staging` / `main` への push: 対応環境で `init` / `plan` / `apply`

ブランチと環境の対応:
- `develop` -> `test`
- `staging` -> `stage`
- `main` -> `prod`

## 6. 変更時チェックリスト

- 変更意図と影響環境を説明できる
- `modules` と `envs/*` の参照整合が取れている
- 破壊的変更のリスク評価を行った
- 状態管理・Secrets 管理方針に反していない

## 7. 参考

- ルートガイド: `README.md`
- infra 配下運用: `infra/AGENTS.md`
- IaC 詳細設計: `docs/IaC.md`
- システム全体構成: `docs/system-architecture.md`
