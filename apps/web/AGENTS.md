# apps/web Guidelines

## Scope
- このファイルは `apps/web` 配下に適用します。
- 共通方針はルートの `AGENTS.md` を継承します。
- ルートと矛盾する場合は、よりスコープの狭い本ファイルを優先します。

## Architecture
- フロントエンドは TanStack Start + TanStack Router を利用します。
- ルートは `apps/web/src/routes` 配下で管理します（file-based routing）。
- 静的アセットは `apps/web/public` に配置します。

## Commands
- 開発サーバー: `npm run dev --workspace web`
- ビルド: `npm run build --workspace web`
- テスト: `npm run test --workspace web`
- モノレポ全体チェックが必要な場合はルートで `npm run lint` / `npm run typecheck` を実行します。

## Implementation Notes
- 画面仕様変更時は、影響範囲の route component と関連 UI 部品を合わせて更新します。
- データ取得の実装は route 単位での責務分離を優先し、状態管理を過剰に広げないでください。
- スタイルや構造の変更では、既存のルーティング構成と命名規則を崩さないことを優先します。

## Testing
- UI のユーザー影響がある変更には Vitest + Testing Library のテスト追加/更新を検討します。
- テスト名は `*.test.ts` または `*.test.tsx` を使用します。
