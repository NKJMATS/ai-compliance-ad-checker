import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI広告コンプライアンスチェッカー",
  description: "薬機法・景表法・SNSプラットフォーム規約の観点から広告原稿のリスクを診断します",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
