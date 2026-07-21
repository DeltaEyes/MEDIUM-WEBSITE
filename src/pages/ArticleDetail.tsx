import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
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

interface LikeStatus {
    likeCount: number;
    isLiked: boolean;
}

// スクロールバー専用コンポーネント（チラつき防止）
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
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(true);
    const [isLikedAnimate, setIsLikedAnimate] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const ARTICLES = initialArticles as Article[];
    const article = ARTICLES.find(a => a.id === id);
    const currentUrl = window.location.href;

    // Cloudflare Pages Function経由でD1から共有の件数を取得
    useEffect(() => {
        if (!article) return;
        document.title = `${article.title} | 𝄇MEDIUM`;

        let cancelled = false;
        const loadLikes = async () => {
            try {
                const result = await fetch(`/api/likes/${encodeURIComponent(article.id)}`);
                if (!result.ok) throw new Error('Failed to load likes');
                const status = await result.json() as LikeStatus;
                if (!cancelled) {
                    setLikeCount(status.likeCount);
                    setIsLiked(status.isLiked);
                }
            } catch {
                // API未接続時に、ローカルの偽の件数へフォールバックしない
            } finally {
                if (!cancelled) setIsLikeLoading(false);
            }
        };

        setIsLikeLoading(true);
        void loadLikes();
        return () => { cancelled = true; };
    }, [article]);

    // 本文のHTML変換をuseMemoでメモ化（Amazon自動カード化 & チラつき防止）
    const processedContentHtml = useMemo(() => {
        if (!article) return { __html: '<p>本文がありません。</p>' };

        let processed = article.content || '<p>本文がありません。</p>';

        // 1. Apple Music と Instagram の埋め込み最適化
        processed = processed
            .replace(/src="https:\/\/music\.apple\.com/g, 'src="https://embed.music.apple.com')
            .replace(/src="https:\/\/www\.instagram\.com\/(p|reel)\/([^/?"#]+)[^"]*"/g, 'src="https://www.instagram.com/$1/$2/embed/"')
            .replace(/src="https:\/\/www\.instagram\.com\/(?!p|reel|reels|explore|direct|accounts|stories)([^/?"#]+)\/?[^"]*"/g, 'src="https://www.instagram.com/$1/embed/"');

        // 2. Amazon自動リンクカード化ロジック
        processed = processed.replace(
            /<a\s+[^>]*href="(https:\/\/(?:amzn\.to|www\.amazon\.co\.jp)[^"]*)"[^>]*>(.*?)<\/a>/gi,
            (_match, url, text) => {
                const displayTitle = url === text ? "Recommended Product" : text;
                return `
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="amazon-link-card">
            <div class="amazon-card-info">
              <span class="amazon-card-label">SHOP ON AMAZON</span>
              <span class="amazon-card-title">${displayTitle}</span>
              <span class="amazon-card-domain">amazon.co.jp</span>
            </div>
          </a>
        `;
            }
        );

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

    const pureText = (article.content || '').replace(/<[^>]*>/g, '');
    const calculatedReadTime = Math.max(1, Math.ceil(pureText.length / 400));

    // DB側でユーザーと記事の組み合わせを一意にし、競合なく切り替える
    const handleLike = async () => {
        if (isLikeLoading) return;
        setIsLikeLoading(true);
        try {
            const result = await fetch(`/api/likes/${encodeURIComponent(article.id)}`, {
                method: 'POST',
            });
            if (!result.ok) throw new Error('Failed to update like');
            const status = await result.json() as LikeStatus;
            setLikeCount(status.likeCount);
            setIsLiked(status.isLiked);
            if (status.isLiked) {
                setIsLikedAnimate(true);
                setTimeout(() => setIsLikedAnimate(false), 300);
            }
        } catch {
            showToast('いいねを更新できませんでした。時間をおいてお試しください。');
        } finally {
            setIsLikeLoading(false);
        }
    };

    // コピー処理
    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentUrl);
        showToast("リンクをクリップボードにコピーしました！");
    };

    // OSネイティブの共有メニュー
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${article.title} | 𝄇MEDIUM`,
                    url: currentUrl,
                });
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 2500);
    };

    const lineShareText = `${article.title} | 𝄇MEDIUM\n${currentUrl}`;

    return (
        <article className="single-article blog-post-container">
            <ScrollProgressBar />

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
                <div className="post-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '0.5rem' }}>
                    <span className="date">{article.date}</span>
                    <span className="read-time">{calculatedReadTime} min read</span>
                </div>
            </header>

            <div className="post-hero-image-wrapper">
                <img src={article.image} alt={article.title} className="post-hero-image article-hero-image" />
            </div>

            {/* 🚀 【変更点①】いいね ＆ 共有セクション（サムネイルのすぐ下へ配置） */}
            <div className="article-actions-section" style={{ margin: '1.5rem 0' }}>
                <div className="actions-inner" style={{ padding: '0.5rem 0' }}>
                    {/* 左側：いいね */}
                    <div className="like-section">
                        <button
                            onClick={handleLike}
                            className={`like-action-btn ${isLiked ? 'is-liked' : ''} ${isLikedAnimate ? 'animate-pop' : ''}`}
                            aria-label={isLiked ? 'いいねを取り消す' : 'この記事にいいねする'}
                            aria-pressed={isLiked}
                            disabled={isLikeLoading}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="heart-icon">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="like-count">{isLikeLoading ? '…' : likeCount}</span>
                        </button>
                    </div>

                    {/* 右側：シェアボタン一式 */}
                    <div className="share-section">
                        <span className="share-label">SHARE</span>
                        <div className="share-buttons-group">

                            {/* X */}
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

                            {/* LINE (アプリ直通スキーム) */}
                            <a
                                href={`https://line.me/R/share?text=${encodeURIComponent(lineShareText)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="share-btn btn-line"
                                aria-label="LINEで送る"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.185 1.039.646 1.28-.54 6.89-4.056 9.4-6.942 2.127-2.37 2.6-4.59 2.6-6.916z" />
                                </svg>
                            </a>

                            {/* OS共有 */}
                            <button
                                onClick={handleNativeShare}
                                className="share-btn btn-native-share"
                                aria-label="他の方法で共有"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                                    <polyline points="16 6 12 2 8 6"></polyline>
                                    <line x1="12" y1="2" x2="12" y2="15"></line>
                                </svg>
                            </button>

                        </div>
                    </div>
                </div>
                <div className="actions-divider" style={{ margin: '1rem 0 0 0' }}></div>
            </div>

            {/* 🚀 【変更点②】著者の卵（丸型アバター ＋ 著者プロフィール欄） */}
            {article.excerpt && (
                <div className="author-profile-card" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.2rem 0',
                    borderBottom: '1px solid var(--color-border, #e5e7eb)',
                    marginBottom: '2.5rem'
                }}>
                    {/* 著者の「丸（卵型）」アイコン。ブランドロゴである「𝄇」を配置 */}
                    <div className="author-avatar" style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: '#111111',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: '800',
                        flexShrink: 0,
                        border: '1px solid #111111'
                    }}>
                        𝄇
                    </div>
                    <div className="author-info">
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            color: 'var(--color-text-muted, #6b7280)',
                            letterSpacing: '0.08em',
                            display: 'block',
                            marginBottom: '0.15rem'
                        }}>
                            WRITER
                        </span>
                        <p style={{
                            fontSize: '0.88rem',
                            margin: 0,
                            color: '#333333',
                            lineHeight: '1.4',
                            fontWeight: '500'
                        }}>
                            {article.excerpt}
                        </p>
                    </div>
                </div>
            )}

            {/* 記事本文 */}
            <div
                className="post-body"
                dangerouslySetInnerHTML={processedContentHtml}
            />
        </article>
    );
}
