# infra Guidelines

## Scope
- このファイルは `infra` 配下に適用します。
- 共通方針はルートの `AGENTS.md` を継承します。
- ルートと矛盾する場合は、よりスコープの狭い本ファイルを優先します。

## Structure
- `infra/bootstrap`: Terraform backend などの初期構成。
- `infra/modules`: 再利用モジュール（network, alb, ecs_service, rds_postgres など）。
- `infra/envs/{test,stage,prod}`: 環境ごとのスタック定義。

## Terraform Operation Policy
- Terraform の実行（`init` / `plan` / `apply` / `destroy`）は環境・状態へ影響するため、実行前に目的と対象環境を明示してください。
- `apply` / `destroy` は明示的な承認がある場合のみ実行します。
- 変更時は `modules` と `envs/*` の整合性（変数・出力・参照先）を同時に確認してください。

## Change Rules
- 機密情報はコードへ直接埋め込まず、既存の secrets 管理設計に従います。
- 単一環境だけに必要な差分か、全環境に展開すべき差分かを明示してから編集します。
- 影響範囲が広い変更は、モジュール単位で段階的に適用してください。
