import { useState } from 'react';
import './App.css';
import initialArticles from './data/articles.json';

// 記事データの型定義
interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  content: string;
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  // 現在表示している詳細記事のID（null のときは一覧表示）
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const ARTICLES: Article[] = (initialArticles as Article[]) || [];

  // 選択されたIDに一致する記事を特定
  const currentArticle = ARTICLES.find(article => article.id === selectedArticleId);

  const filteredArticles = ARTICLES.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* ヘッダーセクション */}
      <header className="header">
        <div className="header-inner">
          <h1 className="logo" onClick={() => setSelectedArticleId(null)} style={{ cursor: 'pointer' }}>
            𝄇MEDIUM
          </h1>
          {/* 詳細表示中は検索バーを隠す */}
          {!selectedArticleId && (
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="記事やカテゴリを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="main-content">
        {currentArticle ? (
          /* ================= 詳細画面 ================= */
          <article className="single-article">
            <button className="back-button" onClick={() => setSelectedArticleId(null)}>
              &larr; 一覧に戻る
            </button>

            <header className="post-header">
              <span className="post-category">{currentArticle.category}</span>
              <h1 className="post-title">{currentArticle.title}</h1>
              <div className="post-meta">
                <span className="date">{currentArticle.date}</span>
                <span className="separator">•</span>
                <span className="read-time">{currentArticle.readTime}</span>
              </div>
            </header>

            <div className="post-hero-image-wrapper">
              <img src={currentArticle.image} alt={currentArticle.title} className="post-hero-image" />
            </div>

            {/* NotionからパースされたHTML本文を安全に注入 */}
            <div
              className="post-body"
              dangerouslySetInnerHTML={{ __html: currentArticle.content || '<p>本文がありません。</p>' }}
            />
          </article>
        ) : (
          /* ================= 一覧画面 ================= */
          <>
            <div className="section-header">
              <h2>Latest Articles</h2>
              <p>最新の記事一覧</p>
            </div>

            <div className="article-grid">
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <article
                    key={article.id}
                    className="article-card"
                    onClick={() => setSelectedArticleId(article.id)} // クリックで詳細へ
                    style={{ cursor: 'pointer' }}
                  >
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
          </>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2026 𝄇MEDIUM All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;