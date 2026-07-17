import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react'; // ★ useMemo を追加
import initialArticles from '../data/articles.json';

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

// ========================================================
// ★ 対策①: スクロールバー専用の軽量コンポーネントを分離
// これによりスクロール中の再レンダリングがここに閉じ込められ、記事本文に影響しなくなります
// ========================================================
function ScrollProgressBar() {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(scrollPercent);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: `${scrollProgress}%`,
                height: '4px',
                backgroundColor: '#000000',
                zIndex: 9999,
                transition: 'width 0.1s ease-out',
            }}
        />
    );
}

export default function ArticleDetail() {
    const { id } = useParams<{ id: string }>();

    // いいね・共有用ステート
    const [likeCount, setLikeCount] = useState(0);
    const [isLikedAnimate, setIsLikedAnimate] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const ARTICLES = initialArticles as Article[];
    const article = ARTICLES.find(a => a.id === id);
    const currentUrl = window.location.href;

    // いいね数の初期化（ローカルストレージから取得して0スタートにする）
    useEffect(() => {
        if (article) {
            document.title = `${article.title} | 𝄇MEDIUM`;

            const savedLikes = localStorage.getItem(`likes_${article.id}`);
            const myLikes = savedLikes ? parseInt(savedLikes, 10) : 0;
            setLikeCount(myLikes);
        }
    }, [article]);

    // ========================================================
    // ★ 対策②: 本文のHTML変換をuseMemoでメモ化
    // これにより、いいねボタンやトーストで画面が更新されても、本文のiframeは絶対にリロードされません
    // ========================================================
    const processedContentHtml = useMemo(() => {
        if (!article) return { __html: '<p>本文がありません。</p>' };

        const rawHtml = article.content || '<p>本文がありません。</p>';
        const processed = rawHtml
            .replace(/src="https:\/\/music\.apple\.com/g, 'src="https://embed.music.apple.com')
            .replace(/src="https:\/\/www\.instagram\.com\/(p|reel)\/([^/?"#]+)[^"]*"/g, 'src="https://www.instagram.com/$1/$2/embed/"')
            .replace(/src="https:\/\/www\.instagram\.com\/(?!p|reel|reels|explore|direct|accounts|stories)([^/?"#]+)\/?[^"]*"/g, 'src="https://www.instagram.com/$1/embed/"');

        return { __html: processed };
    }, [article]);

    if (!article) {
        return (
            <div className="blog-post-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h2>記事が見つかりませんでした</h2>
                <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>&larr; ホームに戻る</Link>
            </div>
        );
    }

    // 読了時間の自動計算
    const pureText = (article.content || '').replace(/<[^>]*>/g, '');
    const calculatedReadTime = Math.max(1, Math.ceil(pureText.length / 400));

    // いいねクリック処理
    const handleLike = () => {
        const savedLikes = localStorage.getItem(`likes_${article.id}`);
        const myLikes = savedLikes ? parseInt(savedLikes, 10) : 0;

        localStorage.setItem(`likes_${article.id}`, (myLikes + 1).toString());
        setLikeCount(prev => prev + 1);
        setIsLikedAnimate(true);
        setTimeout(() => setIsLikedAnimate(false), 300);
    };

    // URLコピー処理
    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentUrl);
        showToast("リンクをクリップボードにコピーしました！");
    };

    // Instagram共有処理
    const handleInstagramShare = () => {
        navigator.clipboard.writeText(currentUrl);
        showToast("URLをコピーしました。Instagramを開きます...");
        setTimeout(() => {
            window.open('https://www.instagram.com/', '_blank');
        }, 1500);
    };

    // トーストメッセージ表示用ヘルパー
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 2500);
    };

    return (
        <article className="single-article blog-post-container">
            {/* ★ 最上部スクロールプログレスバー（分離したコンポーネントを配置） */}
            <ScrollProgressBar />

            {/* 通知トースト */}
            {toastMessage && (
                <div className="action-toast">
                    {toastMessage}
                </div>
            )}

            <Link to="/" className="back-button" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                &larr; 一覧に戻る
            </Link>

            <header className="post-header">
                <span className="post-category">{article.category}</span>
                <h1 className="post-title">{article.title}</h1>
                {/* 日付と4 min readの左右端寄せスタイルはそのまま維持 */}
                <div className="post-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '0.5rem' }}>
                    <span className="date">{article.date}</span>
                    <span className="read-time">{calculatedReadTime} min read</span>
                </div>
            </header>

            <div className="post-hero-image-wrapper">
                <img src={article.image} alt={article.title} className="post-hero-image article-hero-image" />
            </div>

            {/* ★ メモ化したHTMLを適用 */}
            <div
                className="post-body"
                dangerouslySetInnerHTML={processedContentHtml}
            />

            {/* いいね ＆ 共有ボタンセクション */}
            <footer className="article-actions-section">
                <div className="actions-divider"></div>

                <div className="actions-inner">
                    {/* 左側：いいねボタン */}
                    <div className="like-section">
                        <button
                            onClick={handleLike}
                            className={`like-action-btn ${isLikedAnimate ? 'animate-pop' : ''}`}
                            aria-label="いいね！"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="heart-icon">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="like-count">{likeCount}</span>
                        </button>
                    </div>

                    {/* 右側：共有SNSボタン群 */}
                    <div className="share-section">
                        <span className="share-label">SHARE</span>
                        <div className="share-buttons-group">

                            {/* X (Twitter) */}
                            <a
                                href={`https://x.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(article.title + " | 𝄇MEDIUM")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="share-btn btn-x"
                                aria-label="Xでシェア"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>

                            {/* LINE */}
                            <a
                                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="share-btn btn-line"
                                aria-label="LINEで送る"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.185 1.039.646 1.28-.54 6.89-4.056 9.4-6.942 2.127-2.37 2.6-4.59 2.6-6.916z" />
                                </svg>
                            </a>

                            {/* Instagram */}
                            <button
                                onClick={handleInstagramShare}
                                className="share-btn btn-instagram"
                                aria-label="Instagram用のURLコピー"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </button>

                            {/* URL コピー */}
                            <button
                                onClick={handleCopyLink}
                                className="share-btn btn-copy"
                                aria-label="URLをコピー"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                            </button>

                        </div>
                    </div>
                </div>
            </footer>
        </article>
    );
}