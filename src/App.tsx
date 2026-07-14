import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import initialArticles from './data/articles.json';
import ArticleDetail from './pages/ArticleDetail';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags?: string[]; // ★ 型定義に「tags」を追加（Notionから配列で取得する想定）
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

  // 1. 全記事から重複のない「ユニークなタグ一覧」を自動抽出
  const allTags = Array.from(
    new Set(articles.flatMap(article => article.tags || []))
  );

  // 2. 検索ロジックに「タグ（tags）」の判定を追加
  const filteredArticles = articles.filter(article => {
    const searchLower = searchTerm.toLowerCase();

    // タイトル、カテゴリー、またはタグ配列のいずれかに検索ワードが含まれているか判定
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

      {/* 3. ★ タグ一覧のフィルターボタンを設置 */}
      {allTags.length > 0 && (
        <div className="tags-filter-container" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem', justifyContent: 'flex-end' }}>
          {allTags.map(tag => {
            const isSelected = searchTerm.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => setSearchTerm(isSelected ? "" : tag)} // 選択中なら解除、そうでないならそのタグで検索
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

                {/* 4. ★ カード内にタグ一覧を表示（クリックでそのタグに絞り込み可能） */}
                {article.tags && article.tags.length > 0 && (
                  <div className="card-tags" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                    {article.tags.map(tag => (
                      <span
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation(); // 詳細ページへの遷移（親のonClick）を防止
                          setSearchTerm(tag);  // タグ検索を実行
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
        <header className="header">
          <div className="header-inner">
            <Link to="/" className="logo" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
              𝄇MEDIUM
            </Link>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ArticleList articles={ARTICLES} />} />
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