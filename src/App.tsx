import { useState } from 'react';
import './App.css';
import initialArticles from './data/articles.json';

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  // Notionから取得したデータ、または空の配列をセット
  const ARTICLES = initialArticles || [];

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