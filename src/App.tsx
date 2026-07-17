import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import initialArticles from './data/articles.json';
import ArticleDetail from './pages/ArticleDetail';
import About from './pages/About'; // ABOUT US ページ
import PrivacyPolicy from './pages/PrivacyPolicy'; // ★ プライバシーポリシーページをインポート

interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags?: string[];
  readTime: string;
  image: string;
  content: string;
}

// 一覧画面専用のコンポーネント
function ArticleList({ articles }: { articles: Article[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "𝄇MEDIUM | 最新記事一覧";
  }, []);

  // 全記事から重複のない「ユニークなタグ一覧」を自動抽出
  const allTags = Array.from(
    new Set(articles.flatMap(article => article.tags || []))
  );

  // 検索ロジックに「タグ（tags）」の判定を追加
  const filteredArticles = articles.filter(article => {
    const searchLower = searchTerm.toLowerCase();
    const matchesTitle = article.title.toLowerCase().includes(searchLower);
    const matchesCategory = article.category.toLowerCase().includes(searchLower);
    const matchesTags = article.tags?.some(tag => tag.toLowerCase().includes(searchLower));

    return matchesTitle || matchesCategory || matchesTags;
  });

  return (
    <>
      <div className="search-wrapper" style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
        <input
          type="text"
          placeholder="記事、カテゴリ、#タグで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* タグ一覧のフィルターボタンを設置 */}
      {allTags.length > 0 && (
        <div className="tags-filter-container" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem', justifyContent: 'flex-end' }}>
          {allTags.map(tag => {
            const isSelected = searchTerm.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => setSearchTerm(isSelected ? "" : tag)}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.8rem',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '16px',
                  backgroundColor: isSelected ? 'var(--color-primary, #000)' : 'transparent',
                  color: isSelected ? '#fff' : 'var(--color-text-muted, #6b7280)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: isSelected ? 'bold' : 'normal'
                }}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}

      <div className="section-header">
        <h2>Latest Articles</h2>
        <p>{searchTerm ? `「${searchTerm}」の検索結果` : "最新の記事一覧"}</p>
      </div>

      <div className="article-grid">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <article
              key={article.id}
              className="article-card"
              onClick={() => navigate(`/article/${article.id}`)}
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

                {/* カード内にタグ一覧を表示（クリックでそのタグに絞り込み可能） */}
                {article.tags && article.tags.length > 0 && (
                  <div className="card-tags" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                    {article.tags.map(tag => (
                      <span
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation(); // 詳細ページへの遷移を防ぎ、検索だけを走らせる
                          setSearchTerm(tag);
                        }}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.5rem',
                          backgroundColor: '#f3f4f6',
                          color: '#4b5563',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="card-footer" style={{ marginTop: '1rem' }}>
                  <span className="read-more">Read article &rarr;</span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="no-results" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
            「{searchTerm}」に一致する記事は見つかりませんでした。
          </p>
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
            {/* 左側：ロゴ画像 */}
            <Link to="/" className="logo-container">
              <img src="/logo.png" alt="𝄇MEDIUM" className="logo-image" />
            </Link>

            {/* 右側：ABOUT US へのナビゲーションリンク */}
            <nav className="header-nav">
              <Link to="/about" className="nav-link">ABOUT US</Link>
            </nav>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ArticleList articles={ARTICLES} />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} /> {/* ★ ルーティングを追加 */}
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-inner-bottom">
            <p className="copyright">&copy; 2026 𝄇MEDIUM All rights reserved.</p>

            {/* ★ プライバシーポリシーリンクとInstagramリンクを綺麗に並べるグループ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Link
                to="/privacy"
                className="footer-privacy-link"
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted, #6b7280)',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s ease'
                }}
              >
                Privacy Policy
              </Link>

              {/* 常に表示されるフッターのInstagramリンク */}
              <a
                href="https://www.instagram.com/medium_2026"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>Instagram</span>
              </a>
            </div>

          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;