# 𝄇MEDIUM

Notionで管理した記事をWebサイトとして公開する、React製のメディアサイトです。

記事データはビルド時に **Notion API** から取得し、静的なJSONと画像へ変換します。生成したフロントエンドは **Cloudflare Pages** にデプロイし、記事の「いいね」機能には **Cloudflare Pages Functions + D1** を使用します。

## 主な機能

- Notionデータベースから公開済みの記事を自動取得
- Notionの本文ブロックをHTMLへ変換
- 記事一覧・詳細ページの表示
- タイトル、カテゴリーによる記事検索
- YouTube、SoundCloud、Instagram、Apple Musicなどの埋め込み表示
- X、LINE、OS標準共有メニューによる記事共有
- Cloudflare D1を利用した、訪問者ごとの「いいね」登録・解除
- GitHub ActionsによるNotion記事の定期同期

## システム構成

```text
Notion Database
      |
      | Notion API（ビルド時に取得）
      v
fetch-articles.js
      |-- src/data/articles.json   記事データ
      `-- public/images/           記事画像
                |
                v
        React + Vite build
                |
                v
         Cloudflare Pages
                |
                | /api/likes/:articleId
                v
     Pages Functions + Cloudflare D1
```

Notion APIはブラウザから直接呼び出しません。APIトークンをビルド環境だけで使用し、取得済みの記事を静的ファイルとして配信するため、トークンがフロントエンドへ露出しない構成です。

## 技術スタック

| 分類 | 技術 |
| --- | --- |
| フロントエンド | React 19 / TypeScript / React Router |
| ビルド | Vite 8 |
| CMS | Notion / Notion API |
| ホスティング | Cloudflare Pages |
| サーバー処理 | Cloudflare Pages Functions |
| データベース | Cloudflare D1 |
| 自動同期 | GitHub Actions |

## Notion API連携

### 仕組み

[`fetch-articles.js`](./fetch-articles.js) がNotion APIを呼び出し、`Published`がオンの記事だけを`Date`の降順で取得します。本文ブロックをHTMLへ変換し、以下のファイルを生成・更新します。

- `src/data/articles.json`: タイトル、概要、日付、カテゴリー、本文HTMLなど
- `public/images/`: アイキャッチ画像と本文画像

Notion上の画像URLは有効期限があるため、画像を`public/images/`へダウンロードしてから配信しています。

### 必要な環境変数

| 変数名 | 内容 |
| --- | --- |
| `NOTION_TOKEN` | Notion Integrationのシークレット |
| `NOTION_DATABASE_ID` | 記事を管理するNotionデータベースのID |

Notion Integrationを作成したら、対象データベースの「接続」へIntegrationを追加し、読み取り権限を付与してください。

### 想定するデータベースプロパティ

| プロパティ | Notionの型 | 必須 | 用途 |
| --- | --- | --- | --- |
| `Name` または `名前` | Title | 必須 | 記事タイトル |
| `Published` | Checkbox | 必須 | 公開対象の判定 |
| `Date` | Date | 推奨 | 公開日と並び順 |
| `Excerpt` | Rich text | 任意 | 記事概要・著者紹介欄 |
| `Category` / `カテゴリー`など | Select / Multi-select | 任意 | カテゴリー |
| `Image` / `画像` / `アイキャッチ`など | Files / URL / Rich text | 任意 | アイキャッチ画像 |

本文では段落、見出し、箇条書き、番号付きリスト、コード、画像、ブックマーク、埋め込み、動画を変換できます。

## ローカル開発

### 必要環境

- Node.js 20以上
- npm
- 読み取り可能なNotion Integrationとデータベース

### セットアップ

```bash
npm install
```

環境変数を設定して、Notionの記事を取得します。

```bash
export NOTION_TOKEN="secret_xxx"
export NOTION_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
node fetch-articles.js
```

開発サーバーを起動します。

```bash
npm run dev
```

`npm run dev`だけではNotionの再取得を行いません。Notion側の変更を反映したい場合は、先に`node fetch-articles.js`を実行してください。

### コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | Vite開発サーバーを起動 |
| `npm run build` | Notionから記事を取得し、型チェック後に本番ビルド |
| `npm run lint` | Oxlintを実行 |
| `npm run preview` | 本番ビルドをローカルで確認 |

> `npm run build`は最初にNotion APIへ接続します。`NOTION_TOKEN`と`NOTION_DATABASE_ID`を設定して実行してください。

## Cloudflareへのデプロイ

このプロジェクトは **Cloudflare Pages** へのデプロイを前提としています。

### Pagesのビルド設定

Cloudflare DashboardでGitHubリポジトリをPagesプロジェクトへ接続し、次の値を設定します。

| 項目 | 設定値 |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Production branch | `main` |

Pagesプロジェクトの「Settings > Variables and Secrets」には、次のシークレットを登録します。

- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`

Cloudflare Pages上では環境変数が不足している場合、安全のためビルドが失敗するようになっています。

### D1といいねAPI

いいねAPIは[`functions/api/likes/[articleId].js`](./functions/api/likes/%5BarticleId%5D.js)に実装されています。Cloudflare Pagesは`functions/`をPages Functionsとして自動的にデプロイします。

1. CloudflareでD1データベースを作成します。
2. [`schema.sql`](./schema.sql)をD1へ適用します。
3. Pagesプロジェクトの「Settings > Bindings」で、D1 bindingを追加します。
4. Variable nameを`LIKES_DB`にし、作成したD1データベースを選択します。
5. Pagesを再デプロイします。

APIのエンドポイントは次のとおりです。

| Method | Path | 内容 |
| --- | --- | --- |
| `GET` | `/api/likes/:articleId` | いいね数と現在の訪問者の状態を取得 |
| `POST` | `/api/likes/:articleId` | いいねを登録または解除 |

訪問者はHttpOnly Cookieの匿名IDで識別し、D1の複合主キーによって同じ訪問者からの記事ごとの重複登録を防ぎます。

`public/_redirects`にはSPA用のフォールバックが設定されているため、記事詳細URLへ直接アクセスしてもReact Routerがページを表示できます。

## Notion記事の自動同期

`.github/workflows/fetch-notion.yml`は5分間隔および手動実行でNotionを確認します。記事や画像に変更があれば自動コミットして`main`へpushし、そのpushを起点にCloudflare Pagesが再デプロイされます。

GitHubリポジトリのActions secretsにも以下を登録してください。

- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`

```text
Notionを更新
  -> GitHub Actionsが記事JSON・画像を更新
  -> mainへ自動push
  -> Cloudflare Pagesが自動ビルド・デプロイ
```

## ディレクトリ構成

```text
.
├── fetch-articles.js             # Notion APIから記事と画像を取得
├── functions/api/likes/          # Cloudflare Pages FunctionsのいいねAPI
├── public/
│   ├── _redirects                  # SPAルーティング設定
│   └── images/                     # Notionから取得した画像
├── src/
│   ├── data/articles.json          # 生成された記事データ
│   ├── pages/                      # 記事詳細・About・Privacyページ
│   └── App.tsx                     # 一覧とルーティング
├── schema.sql                    # D1のテーブル定義
└── .github/workflows/
    └── fetch-notion.yml           # Notion定期同期ワークフロー
```

## 運用時の注意

- `NOTION_TOKEN`は公開ファイルやクライアント側コードへ記載しないでください。
- Notionの変更は、記事取得とCloudflare Pagesの再デプロイが完了した後に公開サイトへ反映されます。
- `Published`がオフの記事は取得されません。
- ローカルのVite開発サーバーだけではPages FunctionsとD1は動作しないため、いいね機能の確認にはCloudflare環境またはWranglerによるローカルPages環境が必要です。
