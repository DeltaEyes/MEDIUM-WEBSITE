import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react'; // ★ useEffect を追加
import initialArticles from '../data/articles.json';

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

export default function ArticleDetail() {
    const { id } = useParams<{ id: string }>();

    const ARTICLES = initialArticles as Article[];
    const article = ARTICLES.find(a => a.id === id);

    // ★ 記事詳細が開かれたら、ブラウザのタブ名（タイトル）を記事のタイトルにする
    useEffect(() => {
        if (article) {
            document.title = `${article.title} | 𝄇MEDIUM`;
        }
    }, [article]);

    if (!article) {
        return (
            <div className="blog-post-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h2>記事が見つかりませんでした</h2>
                <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>&larr; ホームに戻る</Link>
            </div>
        );
    }

    return (
        <article className="single-article blog-post-container">
            <Link to="/" className="back-button" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                &larr; 一覧に戻る
            </Link>

            <header className="post-header">
                <span className="post-category">{article.category}</span>
                <h1 className="post-title">{article.title}</h1>
                <div className="post-meta">
                    <span className="date">{article.date}</span>
                    <span className="separator">•</span>
                    <span className="read-time">{article.readTime}</span>
                </div>
            </header>

            <div className="post-hero-image-wrapper">
                <img
                    src={article.image}
                    alt={article.title}
                    className="post-hero-image article-hero-image"
                />
            </div>

            {/* ★ ここを修正：NotionのHTML内のApple MusicのURLを、埋め込み専用URL（embed.）に自動置換して注入 */}
            <div
                className="post-body"
                dangerouslySetInnerHTML={{
                    __html: (article.content || '<p>本文がありません。</p>')
                        .replace(/src="https:\/\/music\.apple\.com/g, 'src="https://embed.music.apple.com')
                }}
            />
        </article>
    );
}