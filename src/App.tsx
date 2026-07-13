import { useState } from 'react';
import './App.css';

// 記事のダミーデータ
const ARTICLES = [
  {
    id: 1,
    title: "モダンWebフロントエンドの現在地",
    excerpt: "ReactやViteなど、進化を続けるフロントエンド環境の最新トレンドと、開発者が知っておくべきベストプラクティスを探ります。",
    date: "2026.07.12",
    category: "Technology",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 2,
    title: "ミニマルデザインがもたらすユーザー体験",
    excerpt: "「Less is more」の哲学はWebデザインにおいてどう機能するのか。余白の美学とアクセシビリティの両立について。",
    date: "2026.06.28",
    category: "Design",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 3,
    title: "リモートワーク環境を最適化するガジェット10選",
    excerpt: "生産性を劇的に向上させる、2026年最新のデスク周辺機器と、快適な作業空間を作るためのヒントをご紹介します。",
    date: "2026.06.15",
    category: "Lifestyle",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 4,
    title: "次世代のUI/UX：AIが変えるインターフェース",
    excerpt: "ジェネレーティブAIが標準搭載される時代において、画面設計はどのように変わるのか。対話型UIの可能性を考察。",
    date: "2026.05.30",
    category: "UI/UX",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=600"
  }
];

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  // 検索ワードで記事を絞り込む
  const filteredArticles = ARTICLES.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* ヘッダーセクション */}
      <header className="header">
        <div className="header-inner">
          <h1 className="logo">𝄇MEDIUM</h1>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="記事やカテゴリを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="main-content">
        <div className="section-header">
          <h2>Latest Articles</h2>
          <p>最新の記事一覧</p>
        </div>

        {/* 記事グリッド */}
        <div className="article-grid">
          {filteredArticles.length > 0 ? (
            filteredArticles.map(article => (
              <article key={article.id} className="article-card">
                <div className="card-image-wrapper">
                  <img src={article.image} alt={article.title} className="card-image" />
                  <span className="category-badge">{article.category}</span>
                </div>
                <div className="card-content">
                  <div className="card-meta">
                    <span className="date">{article.date}</span>
                    <span className="read-time">{article.readTime}</span>
                  </div>
                  <h3 className="card-title">{article.title}</h3>
                  <p className="card-excerpt">{article.excerpt}</p>
                  <div className="card-footer">
                    <span className="read-more">Read article &rarr;</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="no-results">「{searchTerm}」に一致する記事は見つかりませんでした。</p>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="footer">
        <p>&copy; 2026 𝄇MEDIUM. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;