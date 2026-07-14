// src/components/Embeds.tsx
import { useEffect } from 'react';

// TypeScriptで「window.twttr」や「window.instgrm」のビルドエラーを防ぐための型定義
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

interface EmbedProps {
    url: string;
}

// ==========================================
// 1. X (Twitter) 埋め込みコンポーネント
// ==========================================
export function XEmbed({ url }: EmbedProps) {
    useEffect(() => {
        // ページ遷移や更新時に、Xの読み込みスクリプトを再実行する
        if (window.twttr && window.twttr.widgets) {
            window.twttr.widgets.load();
        }
    }, [url]);

    // x.com のURLは公式スクリプトが認識しづらいため、内部的に twitter.com に置換
    const twitterUrl = url.replace('x.com', 'twitter.com');

    return (
        <div className="notion-embed-x">
            <blockquote className="twitter-tweet" data-align="center">
                <a href={twitterUrl}></a>
            </blockquote>
        </div>
    );
}

// ==========================================
// 2. Instagram 埋め込みコンポーネント
// ==========================================
export function InstagramEmbed({ url }: EmbedProps) {
    useEffect(() => {
        // ページ遷移や更新時に、Instagramの読み込みスクリプトを再実行する
        if (window.instgrm && window.instgrm.Embeds) {
            window.instgrm.Embeds.process();
        }
    }, [url]);

    return (
        <div className="notion-embed-instagram">
            <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14">
                <a href={url}></a>
            </blockquote>
        </div>
    );
}

// ==========================================
// 3. Amazon 埋め込みコンポーネント
// ==========================================
export function AmazonEmbed({ url }: EmbedProps) {
    return (
        <div className="notion-embed-amazon">
            <iframe
                src={url}
                scrolling="no"
                frameBorder="0"
                title="Amazon Product"
            />
        </div>
    );
}