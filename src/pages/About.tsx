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
                    このサイトでは、ユースカルチャーからライフハックまで、私たちがかっこいいと思うものを共有します。
                </p>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '2.5rem 0' }} />

                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Profile</h2>
                <p style={{ marginBottom: '0.5rem' }}>
                    <strong>野崎 (Nozaki)</strong>
                </p>
                <p>
                    deltaeyeとしてのビートメイク、DJのほか、CHACHA20という名義でラップをしている。
                </p>
            </div>
        </div>
    );
}