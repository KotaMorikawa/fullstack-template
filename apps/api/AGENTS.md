# apps/api Guidelines

## Scope
- このファイルは `apps/api` 配下に適用します。
- 共通方針はルートの `AGENTS.md` を継承します。
- ルートと矛盾する場合は、よりスコープの狭い本ファイルを優先します。

## Architecture
- API サービスは Hono ベースで構成されています。
- エントリーポイントは `apps/api/src/index.ts`、アプリ定義は `apps/api/src/app.ts` を基準にします。
- エンドポイント変更時は、契約（OpenAPI）との整合性を常に意識してください。

## Commands
- 開発サーバー: `npm run dev --workspace api`
- ビルド: `npm run build --workspace api`
- 起動（build後）: `npm run start --workspace api`
- 契約関連: ルートで `npm run generate:openapi` / `npm run generate:api-client` / `npm run verify:contract-drift`

## Contract Rules
- リクエスト/レスポンス仕様に変更がある場合、`packages/contracts/openapi.yaml` を更新対象に含めます。
- OpenAPI 変更時は `packages/api-client/src/generated` の再生成結果も同一変更に含めます。
- 破壊的変更は回避し、必要時は互換性方針を明示してください。
