import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function About() {
    useEffect(() => {
        document.title = "ABOUT US | 𝄇MEDIUM";
    }, []);

    return (
        <div className="blog-post-container" style={{ padding: '3rem 1.25rem' }}>
            <Link to="/" className="back-button" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '2rem', color: 'var(--color-text-muted, #6b7280)' }}>
                &larr; ホームに戻る
            </Link>

            <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '-0.02em' }}>ABOUT US</h1>
                <p style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '1.1rem' }}>𝄇MEDIUM について</p>
            </section>

            <div className="about-content" style={{ lineHeight: '1.8', color: '#2d3748' }}>
                <p style={{ marginBottom: '1.5rem' }}>
                    𝄇MEDIUM（メディウム）へようこそ。
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                    日々アップデートされる無数の情報の中から、私たちのアンテナに触れた「熱量のあるカルチャー」をアーカイブします。
                    クラブフロアの熱気から、日々の学習ノートに綴られた思考、日常を豊かにするプロダクトまで、ジャンルの境界に囚われないコンテンツを発信していきます。
                </p>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '2.5rem 0' }} />

                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Profile</h2>
                <p style={{ marginBottom: '0.5rem' }}>
                    <strong>野崎 (Nozaki)</strong>
                </p>
                <p>
                    deltaeyeとしてのビートメイク、DJのほか、CHACHA20という名義でラップをしている。
                </p>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '2rem 0' }} />

                {/* ★ 最下部にシンプルに配置する Instagram リンク */}
                <div className="footer-sns" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <a
                        href="https://www.instagram.com/medium_2026"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        style={{
                            color: '#1a1a1a',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#e1306c'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#1a1a1a'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        <span>Instagram</span>
                    </a>
                </div>
            </div>
        </div>
    );
}