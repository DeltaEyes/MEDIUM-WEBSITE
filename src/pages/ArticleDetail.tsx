// src/pages/ArticleDetail.tsx
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

export default function ArticleDetail() {
    // URLの「/article/:id」の部分からIDを自動で取得する
    const { id } = useParams<{ id: string }>();

    const ARTICLES = initialArticles as Article[];
    const article = ARTICLES.find(a => a.id === id);

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
            {/* 以前はステートを戻していましたが、今度は「/」へのリンクに変わります */}
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

            <div
                className="post-body"
                dangerouslySetInnerHTML={{ __html: article.content || '<p>本文がありません。</p>' }}
            />
        </article>
    );
}