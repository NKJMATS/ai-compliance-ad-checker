# Project: AI Compliance Ad-Checker (MVP)
## 1. 目的
ユーザーが入力した広告原稿に対し、Gemini APIを使用して「薬機法・景表法・SNSプラットフォーム規約」の観点からリスク判定を行うWebツール。

## 2. 開発原則（厳守事項）
- **Cost Zero Concept:** 初期開発は全てMockデータを使用し、外部API課金を発生させない。
- **No Database:** ユーザー情報は一切保存せず、ブラウザのメモリ内のみで処理する。
- **Privacy First:** ユーザーの入力内容をログに記録しない。
- **Simple UI:** Next.js + Tailwind CSS + shadcn/ui を使用し、1カラムの清潔感ある診断画面にする。

## 3. 技術スタック
- Framework: Next.js (App Router)
- UI: Tailwind CSS, shadcn/ui (Lucide-react icons)
- Logic: Gemini API (SDK: @google/generative-ai) ※開発時はMock
- Deploy: Vercel (Hobby Plan)

## 4. ディレクトリ構成案
(提示済みの構成をベースに、src/app/page.tsxをメインに実装)

## 5. 実装ステップ
1. **Scaffolding:** Next.js環境の構築。
2. **Mock Logic:** 入力に対して「リスクスコア：○点」と「ダミーのアドバイス」を返す関数の作成。
3. **Frontend:** 入力フォーム、診断ボタン、視認性の高いリスクメーター、免責事項の表示。
4. **Legal Guard:** フッターに「本結果は法的助言ではなく、AIによる推定です」という強い免責を配置。