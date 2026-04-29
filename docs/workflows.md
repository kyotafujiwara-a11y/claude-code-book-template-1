# GitHub Actions ワークフロー設定ドキュメント

このドキュメントでは、`.github/workflows/` ディレクトリ配下にある GitHub Actions ワークフローの設定内容を説明します。

---

## ワークフロー一覧

| ファイル名 | ワークフロー名 | 概要 |
|---|---|---|
| `claude.yml` | Claude Code | `@claude` メンションに応じて Claude が自動応答・実装を行う |
| `claude-code-review.yml` | Claude Code Review | PR 作成・更新時に Claude が自動コードレビューを行う |

---

## claude.yml — Claude Code

### トリガー

以下のイベントで起動します。ただし、実際にジョブが実行されるのは本文やタイトルに `@claude` が含まれている場合のみです。

| イベント | タイプ |
|---|---|
| `issue_comment` | `created` |
| `pull_request_review_comment` | `created` |
| `pull_request_review` | `submitted` |
| `issues` | `opened`, `assigned` |

### 実行条件（if）

次の条件のいずれかが真の場合のみジョブが実行されます。

- Issue コメントの本文に `@claude` が含まれる
- PR レビューコメントの本文に `@claude` が含まれる
- PR レビューの本文に `@claude` が含まれる
- Issue の本文またはタイトルに `@claude` が含まれる

### 権限（permissions）

| 権限 | レベル |
|---|---|
| `contents` | `read` |
| `pull-requests` | `read` |
| `issues` | `read` |
| `id-token` | `write` |
| `actions` | `read` |

> `actions: read` は Claude が PR 上の CI 結果を読み取るために必要です。

### ステップ

1. **Checkout repository** — `actions/checkout@v4` でリポジトリをチェックアウト（`fetch-depth: 1`）
2. **Run Claude Code** — `anthropics/claude-code-action@v1` を実行

### 設定パラメータ

| パラメータ | 説明 |
|---|---|
| `claude_code_oauth_token` | OAuth トークン。シークレット `CLAUDE_CODE_OAUTH_TOKEN` を使用 |
| `additional_permissions` | CI 結果読み取りのため `actions: read` を追加で付与 |

### カスタマイズ（コメントアウト済みオプション）

- `prompt` — Claude に与えるカスタムプロンプト。指定しない場合はコメント内の指示に従う
- `claude_args` — Claude の動作オプション（例：`--allowed-tools Bash(gh pr *)`）

---

## claude-code-review.yml — Claude Code Review

### トリガー

PR に関する以下のイベントで起動します。

| イベント | タイプ |
|---|---|
| `pull_request` | `opened`, `synchronize`, `ready_for_review`, `reopened` |

> `paths` オプションをコメントアウト解除することで、特定のファイル変更（例: `src/**/*.ts`）がある場合のみ実行するよう絞り込めます。

### 実行条件（if）

デフォルトでは全 PR に対して実行されます。コメントアウトされた `if` 条件を有効化することで、特定の PR 作者（外部コントリビューター、新規開発者など）に絞り込むことができます。

### 権限（permissions）

| 権限 | レベル |
|---|---|
| `contents` | `read` |
| `pull-requests` | `read` |
| `issues` | `read` |
| `id-token` | `write` |

### ステップ

1. **Checkout repository** — `actions/checkout@v4` でリポジトリをチェックアウト（`fetch-depth: 1`）
2. **Run Claude Code Review** — `anthropics/claude-code-action@v1` を実行

### 設定パラメータ

| パラメータ | 説明 |
|---|---|
| `claude_code_oauth_token` | OAuth トークン。シークレット `CLAUDE_CODE_OAUTH_TOKEN` を使用 |
| `plugin_marketplaces` | プラグインのマーケットプレイス URL |
| `plugins` | 使用するプラグイン（`code-review@claude-code-plugins`） |
| `prompt` | コードレビュー用プロンプト（PR 番号を自動的に埋め込む） |

---

## 必要なシークレット

両ワークフローとも、リポジトリのシークレットに以下の設定が必要です。

| シークレット名 | 説明 |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | Claude Code の OAuth トークン |

シークレットの設定方法：**Settings > Secrets and variables > Actions > New repository secret**

---

## 参考リンク

- [claude-code-action 使用方法](https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md)
- [Claude Code CLI リファレンス](https://code.claude.com/docs/en/cli-reference)
