import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react'; // ★ useState も追加インポート
import initialArticles from '../data/articles.json';

interface Article {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    tags?: string[]; // ★ 前回のApp.tsxとの型ミスマッチ防止用
    readTime: string;
    image: string;
    content: string;
}

export default function ArticleDetail() {
    const { id } = useParams<{ id: string }>();
    const [scrollProgress, setScrollProgress] = useState(0); // ★ スクロールゲージ用のState

    const ARTICLES = initialArticles as Article[];
    const article = ARTICLES.find(a => a.id === id);

    // ★ 機能1：スクロール量を監視してプログレスバーの％を計算
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY; // 現在のスクロール位置（上からの距離）
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight; // スクロール可能な総高さ
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(scrollPercent);
        };

        // スクロールイベントを登録
        window.addEventListener('scroll', handleScroll);
        // コンポーネントが閉じたときはイベントを解除（メモリリーク防止）
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // タブ名（タイトル）変更
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

    // ★ 機能2：読了予想時間の自動計算 (400文字 = 1分)
    // NotionのHTMLデータから正規表現で <tags> を除外し、純粋な本文の文字数だけをカウントする
    const pureText = (article.content || '').replace(/<[^>]*>/g, '');
    const calculatedReadTime = Math.max(1, Math.ceil(pureText.length / 400));

    return (
        <article className="single-article blog-post-container">
            {/* ★ 画面最上部に固定されるスクロールプログレスバー */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: `${scrollProgress}%`, // 計算した％を横幅に適用
                    height: '4px', // ゲージの太さ
                    backgroundColor: 'var(--color-primary, #000)', // ブログのメインカラー（デフォルトは黒）
                    zIndex: 9999, // 一番手前に表示
                    transition: 'width 0.1s ease-out', // ゲージが滑らかに動くようにする
                }}
            />

            <Link to="/" className="back-button" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                &larr; 一覧に戻る
            </Link>

            <header className="post-header">
                <span className="post-category">{article.category}</span>
                <h1 className="post-title">{article.title}</h1>
                <div className="post-meta">
                    <span className="date">{article.date}</span>
                    <span className="separator">•</span>
                    {/* ★ 手動の article.readTime から、自動計算した値に差し替え */}
                    <span className="read-time">{calculatedReadTime} min read</span>
                </div>
            </header>

            <div className="post-hero-image-wrapper">
                <img
                    src={article.image}
                    alt={article.title}
                    className="post-hero-image article-hero-image"
                />
            </div>

            {/* NotionのHTML内のApple MusicやInstagramのURLを、埋め込み専用URLに自動置換して注入 */}
            <div
                className="post-body"
                dangerouslySetInnerHTML={{
                    __html: (article.content || '<p>本文がありません。</p>')
                        .replace(/src="https:\/\/music\.apple\.com/g, 'src="https://embed.music.apple.com')
                        .replace(/src="https:\/\/www\.instagram\.com\/(p|reel)\/([^/?"#]+)[^"]*"/g, 'src="https://www.instagram.com/$1/$2/embed/"')
                        .replace(/src="https:\/\/www\.instagram\.com\/(?!p|reel|reels|explore|direct|accounts|stories)([^/?"#]+)\/?[^"]*"/g, 'src="https://www.instagram.com/$1/embed/"')
                }}
            />
        </article>
    );
}