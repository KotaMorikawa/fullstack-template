# Infrastructure as Code (IaC) Architecture

本ドキュメントは、本システムにおける **Infrastructure as Code（IaC）設計・State 管理・環境分離・運用ルール**を定義するものである。

アプリケーション構成や論理アーキテクチャは本ドキュメントの対象外とし、**Terraform によるインフラ管理に関する決定事項のみ**を記載する。

---

## 1. 対象範囲（スコープ）

本ドキュメントが扱う範囲：

- Terraform によるインフラ定義
- Terraform state / backend / lock 設計
- 環境分離（test / stage / prod）
- IaC のディレクトリ構成
- IaC 運用ルール（apply / lock / CI）

本ドキュメントが **扱わない範囲**：

- システム全体アーキテクチャ（別ドキュメント）
- API / アプリケーション仕様
- CI/CD の詳細手順（別ドキュメント化予定）

---

## 2. IaC 採用方針

- インフラは **すべて Terraform によりコード管理**する
- AWS マネジメントコンソールでの手動変更は原則禁止
- 商用運用を前提とし、
  - state の安全性
  - 並行実行耐性
  - 変更履歴の追跡可能性
  を最優先とする

---

## 3. Terraform Backend 設計

### 3.1 State 管理方式

- Terraform state は **Amazon S3 backend** に保存する
- `terraform apply` 実行時の競合を防ぐため、**DynamoDB Lock** を使用する
- state は環境ごとに完全分離する

| 環境 | S3 key |
|---|---|
| Test | `myapp/test/terraform.tfstate` |
| Stage | `myapp/stage/terraform.tfstate` |
| Prod | `myapp/prod/terraform.tfstate` |

### 3.2 Backend 採用理由

- 商用環境における state 破損・競合事故の防止
- CI/CD 実行時の安全な apply を保証
- S3 バージョニングによる state 復旧性の確保

---

## 4. Backend Bootstrap 構成

Terraform backend 自体は Terraform の管理対象外とし、
**一度だけローカル state で bootstrap** を行う。

### 4.1 Bootstrap 対象リソース

- Terraform state 用 S3 バケット
  - Versioning 有効
  - Public Access Block 有効
  - SSE-KMS 有効
- Terraform Lock 用 DynamoDB テーブル
- Terraform state 専用 KMS Key（任意だが商用では必須）

### 4.2 Bootstrap ディレクトリ

```text
infra/
  bootstrap/    # backend 専用（通常は再実行しない）
```

---

## 5. Terraform ディレクトリ構成

```text
infra/
  bootstrap/
  modules/
    network/
    alb/
    ecs_service/
    rds_postgres/
    dns_acm/
    secrets/
    observability/
  envs/
    test/
    stage/
    prod/
```

### 5.1 modules

- 環境非依存の再利用可能コンポーネント
- すべての module は **環境名を持たない**

### 5.2 envs/{env}

- 環境固有の値を定義
- 各 env は独立した Terraform state を持つ

---

## 6. 環境分離ルール

- インフラは **環境ごとに完全分離**する
- バックエンド（ECS / RDS）は **環境ごとに1 Service / 1 DB**
- Preview 環境は Terraform では管理せず、**常に Test 環境を参照**する

---

## 7. Secrets 管理方針

- Secrets は **Terraform state / tfvars / Git 管理下に含めない**
- AWS Secrets Manager を唯一の保管場所とする
- Terraform は Secret の **ARN のみ**を参照する

---

## 8. IaC 運用ルール

### 8.1 apply ルール

- Prod 環境の `terraform apply` は **CI 経由のみ**
- Test / Stage は手動 apply を許可
- apply 前には必ず `terraform plan` を確認する

### 8.2 Lock 運用

- DynamoDB Lock は自動取得・自動解放される
- Lock 残存時は原因を確認した上で `terraform force-unlock` を実施
- Lock table の手動削除は禁止

### 8.3 変更ポリシー

- 破壊的変更（VPC / RDS / ALB）は事前レビュー必須
- Prod 変更は Stage での適用確認を前提条件とする

---

## 9. 今後の拡張（別ドキュメント化予定）

- CI/CD（GitHub Actions）による Terraform 運用
- IAM 権限設計（Terraform / ECS / CI）
- Disaster Recovery（state / RDS 復旧手順）

