# System Architecture

本ドキュメントは、本システムにおける **インフラ構成・環境分離・デプロイおよびマイグレーション戦略**を整理したものである。  
対象は **PostgreSQL / ECS(Fargate) / Drizzle / Vercel** を用いた Web アプリケーション。

---

## 1. 全体構成概要

- フロントエンド：Vercel
- バックエンド：AWS ECS (Fargate)
- データベース：Amazon RDS (PostgreSQL)
- ロードバランサ：Application Load Balancer (ALB)
- 秘密情報管理：AWS Secrets Manager
- IaC：Terraform
- ORM / Migration：Drizzle + drizzle-kit

---

## 2. 環境構成方針

### 環境一覧

| 環境 | 用途 |
|---|---|
| Local | ローカル開発（Docker） |
| Test | 統合テスト / Vercel Preview 接続先 |
| Stage | リリース前検証 |
| Prod | 本番環境 |

### 環境設計の原則

- バックエンドは **環境ごとに1 Service**
- ブランチごとに BE を増やさない
- 環境差分は **設定値のみ**
- Preview は **Test 環境のみ**に接続
- Secrets は **コード・tfvars に含めない**

---

## 3. システム構成図（論理）

```mermaid
flowchart TB
  U[Users / Browsers] --> FEProd[Vercel FE (Prod)]
  U --> FEPrev[Vercel FE (Preview)]

  FEProd -->|API_BASE_URL| APIP[api.example.com]
  FEPrev -->|API_BASE_URL| APIT[api-test.example.com]

  APIP --> R53[Route53]
  APIT --> R53

  R53 --> ALBP[ALB (Prod)]
  R53 --> ALBS[ALB (Stage)]
  R53 --> ALBT[ALB (Test)]

  ALBP --- ACM[ACM]
  ALBS --- ACM
  ALBT --- ACM

  subgraph VPC
    subgraph Public
      ALBP
      ALBS
      ALBT
    end

    subgraph Private
      ECSProd[ECS Service (Prod)]
      ECSStage[ECS Service (Stage)]
      ECSTest[ECS Service (Test)]

      RDSProd[(RDS Prod)]
      RDSStage[(RDS Stage)]
      RDSTest[(RDS Test)]

      SM[Secrets Manager]
      CW[CloudWatch]
    end
  end

  ALBP --> ECSProd
  ALBS --> ECSStage
  ALBT --> ECSTest

  ECSProd --> RDSProd
  ECSStage --> RDSStage
  ECSTest --> RDSTest

  ECSProd --> SM
  ECSStage --> SM
  ECSTest --> SM

  ECSProd --> CW
  ECSStage --> CW
  ECSTest --> CW
```

---

## 4. IaC（Terraform）構成

### ディレクトリ構成

```text
infra/
  modules/
    network/
    alb/
    ecs_service/
    rds_postgres/
    dns_acm/
    secrets/
  envs/
    test/
      main.tf
      variables.tf
      terraform.tfvars
    stage/
    prod/
```

---

## 5. マイグレーション戦略（Drizzle）

- ecs run-task によるワンショット実行
- Service 更新前に必ず実行
- 起動時マイグレーションは行わない
