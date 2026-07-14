import { useEffect } from 'react'; // ★ useEffect を追加インポート
import { useParams, Link } from 'react-router-dom';
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

// TypeScriptで window.twttr や window.instgrm のエラーを防ぐための型定義
declare global {
    interface Window {
        twttr?: {
            widgets?: {
                load: (el?: HTMLElement) => void;
            };
        };
        instgrm?: {
            Embeds?: {
                process: () => void;
            };
        };
    }
}

export default function ArticleDetail() {
    // URLの「/article/:id」の部分からIDを自動で取得する
    const { id } = useParams<{ id: string }>();

    const ARTICLES = initialArticles as Article[];
    const article = ARTICLES.find(a => a.id === id);

    // ★ 記事が読み込まれたタイミングで、タブ名変更とSNS埋め込みの再描画を行う
    useEffect(() => {
        if (article) {
            // 1. ブラウザのタブ名を「記事のタイトル | サイト名」に変更
            document.title = `${article.title} | 𝄇MEDIUM`;

            // 2. dangerouslySetInnerHTML で入ってきたX (Twitter) のコードをウィジェット化
            if (window.twttr && window.twttr.widgets) {
                window.twttr.widgets.load();
            }

            // 3. dangerouslySetInnerHTML で入ってきた Instagram のコードをウィジェット化
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
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
            {/* 一覧に戻るリンク */}
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

            {/* 本文（HTML文字列）の流し込みセクション */}
            <div
                className="post-body"
                dangerouslySetInnerHTML={{ __html: article.content || '<p>本文がありません。</p>' }}
            />
        </article>
    );
}