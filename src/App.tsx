// src/App.tsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import initialArticles from './data/articles.json';
import ArticleDetail from './pages/ArticleDetail'; // ★ さっき作った詳細ページをインポート

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

// 一覧画面専用のコンポーネント
function ArticleList({ articles }: { articles: Article[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // ページ移動のためのフック

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="search-wrapper" style={{ marginBottom: '2rem', textAlign: 'right' }}>
        <input
          type="text"
          placeholder="記事やカテゴリーを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

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
              onClick={() => navigate(`/article/${article.id}`)} // ★ クリックしたらURLを移動させる！
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
  );
}

// アプリ全体のルート定義
function App() {
  const ARTICLES: Article[] = (initialArticles as Article[]) || [];

  return (
    <Router>
      <div className="app-container">
        {/* ヘッダーセクション */}
        <header className="header">
          <div className="header-inner">
            {/* ロゴをクリックしたらトップページ「/」に遷移するリンクにする */}
            <Link to="/" className="logo" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
              𝄇MEDIUM
            </Link>
          </div>
        </header>

        {/* メインコンテンツ（ここでURLに応じて中身が切り替わる） */}
        <main className="main-content">
          <Routes>
            {/* ルートURL（/）のときは一覧を表示 */}
            <Route path="/" element={<ArticleList articles={ARTICLES} />} />
            {/* /article/任意のID のときはさっき作った詳細JSXを表示 */}
            <Route path="/article/:id" element={<ArticleDetail />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2026 𝄇MEDIUM All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;