// src/pages/PrivacyPolicy.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
    useEffect(() => {
        document.title = 'PRIVACY POLICY | 𝄇MEDIUM';
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="blog-post-container" style={{ padding: '2rem 1.5rem', maxWidth: '700px', margin: '0 auto' }}>
            <Link to="/" className="back-button" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                &larr; ホームに戻る
            </Link>

            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 0.5rem 0' }}>PRIVACY POLICY</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>制定日: 2026年7月17日</p>
            </header>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', fontSize: '0.95rem' }}>

                {/* Amazonアソシエイト・プログラムに関する表示 (規約必須) */}
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        1. Amazonアソシエイト・プログラムについて
                    </h2>
                    <p>
                        𝄇MEDIUMは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
                    </p>
                    <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#4b5563' }}>
                        ※Amazonのアソシエイトとして、𝄇MEDIUMは適格販売により収入を得ています。
                    </p>
                </div>

                {/* 個人情報の取り扱い（標準的な記載） */}
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        2. 個人情報の利用目的について
                    </h2>
                    <p>
                        当サイトでは、お問い合わせやコメントの際にご提供いただいた名前やメールアドレス等の個人情報は、必要な情報を電子メールなどでご連絡する場合にのみ利用し、これらの目的以外では利用いたしません。
                    </p>
                </div>

                {/* 免責事項 */}
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        3. 免責事項
                    </h2>
                    <p>
                        当サイトからのリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。また、当サイトのコンテンツ・情報について、できる限り正確な情報を提供するよう努めておりますが、正確性や安全性を保証するものではありません。
                        誤情報などに気づかれた方はInstagramのDMなどからご連絡ください。
                    </p>
                </div>

            </section>
        </div>
    );
}