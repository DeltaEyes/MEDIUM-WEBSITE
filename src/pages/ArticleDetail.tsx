import { useEffect } from 'react';
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
    const { id } = useParams<{ id: string }>();
    const ARTICLES = initialArticles as Article[];
    const article = ARTICLES.find(a => a.id === id);

    useEffect(() => {
        if (article) {
            document.title = `${article.title} | 𝄇MEDIUM`;
            if (window.twttr && window.twttr.widgets) {
                window.twttr.widgets.load();
            }
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        }
    }, [article]);

    // 💡 Instagramの拒否問題を解決するための置換関数
    const formatHtmlContent = (html: string) => {
        if (!html) return '<p>本文がありません。</p>';

        // iframeのsrcにある通常のInstagram URL (p/ や reel/) を検出して末尾に /embed/ を自動付与
        return html.replace(
            /src="https:\/\/(www\.)?instagram\.com\/(p|reel)\/([^"/]+)\/?([^"]*)"/g,
            (match, type, id, extra) => {
                // すでにURLの中に embed が含まれている場合は何もしない
                if (extra.includes('embed')) return match;
                // 埋め込み専用URLに変換して返す
                return `src="https://www.instagram.com/${type}/${id}/embed/"`;
            }
        );
    };

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

            {/* 💡 修正ポイント: formatHtmlContent関数を通してHTMLを流し込む */}
            <div
                className="post-body"
                dangerouslySetInnerHTML={{ __html: formatHtmlContent(article.content) }}
            />
        </article>
    );
}