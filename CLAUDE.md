# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

このリポジトリは書籍「Claude Code」のサンプルコード用テンプレートです。現在はブロック崩しゲーム（`index.html` + `main.js`）が実装されています。

## Development Environment

Dev Containers（Debian bookworm ベース）で動作します。Node.js と GitHub CLI がプリインストールされ、Playwright（Chromium）の依存関係がコンテナ起動時に自動セットアップされます。

## Local Server

静的ファイルの確認には `npx http-server` を使います：

```bash
npx http-server . -p 8080 --cors
```

## Architecture

- `index.html` — ゲームの UI（Canvas、スコア・残機表示、再スタートボタン）
- `main.js` — ゲームロジック全体。`startGame()` で初期化し、`requestAnimationFrame` による `loop()` が `update()`（物理・衝突）と `draw()`（描画）を毎フレーム呼び出す構造
