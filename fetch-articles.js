import fs from 'fs';
import path from 'path';

const databaseId = process.env.NOTION_DATABASE_ID;
const token = process.env.NOTION_TOKEN;

// 画像を自動ダウンロードするヘルパー関数
async function downloadImage(url, destPath) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`画像のダウンロードに失敗: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
}

// Notionのブロックデータを簡易的なHTML文字列に変換するヘルパー関数
async function getPageContent(pageId) {
    try {
        const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28'
            }
        });
        if (!response.ok) return '';

        const data = await response.json();
        let html = '';

        for (const block of data.results) {
            switch (block.type) {
                case 'paragraph':
                    const pText = block.paragraph.rich_text.map(t => t.plain_text).join('');
                    html += `<p class="notion-p">${pText}</p>`;
                    break;
                case 'heading_1':
                    const h1Text = block.heading_1.rich_text.map(t => t.plain_text).join('');
                    html += `<h1 class="notion-h1">${h1Text}</h1>`;
                    break;
                case 'heading_2':
                    const h2Text = block.heading_2.rich_text.map(t => t.plain_text).join('');
                    html += `<h2 class="notion-h2">${h2Text}</h2>`;
                    break;
                case 'heading_3':
                    const h3Text = block.heading_3.rich_text.map(t => t.plain_text).join('');
                    html += `<h3 class="notion-h3">${h3Text}</h3>`;
                    break;
                case 'bulleted_list_item':
                    const bText = block.bulleted_list_item.rich_text.map(t => t.plain_text).join('');
                    html += `<li class="notion-bullet">${bText}</li>`;
                    break;
                case 'numbered_list_item':
                    const nText = block.numbered_list_item.rich_text.map(t => t.plain_text).join('');
                    html += `<li class="notion-number">${nText}</li>`;
                    break;
                case 'code':
                    const codeText = block.code.rich_text.map(t => t.plain_text).join('');
                    html += `<pre class="notion-code"><code>${codeText}</code></pre>`;
                    break;
                default:
                    break;
            }
        }
        return html;
    } catch (error) {
        console.error(`ページ内コンテンツの取得に失敗 (PageID: ${pageId}):`, error);
        return '';
    }
}

async function fetchArticles() {
    const dirPath = path.resolve('src/data');
    const filePath = path.join(dirPath, 'articles.json');
    const imagesDir = path.resolve('public/images');

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    if (!token || !databaseId) {
        console.log("Notionの環境変数が設定されていません。");
        if (process.env.CF_PAGES === '1') {
            console.error("【致命的エラー】環境変数が読み込めないため、ビルドを安全に停止します。");
            process.exit(1);
        }
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
        return;
    }

    // public/images フォルダがなければ自動作成
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }

    try {
        const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filter: { property: 'Published', checkbox: { equals: true } },
                sorts: [{ property: 'Date', direction: 'descending' }],
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Notion API HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json();

        const articles = await Promise.all(data.results.map(async (page) => {
            const props = page.properties;

            // カテゴリー・タグ列の自動探索
            let categoryProp = null;
            for (const key of Object.keys(props)) {
                const lowerKey = key.toLowerCase().trim();
                if (['category', 'カテゴリー', 'カテゴリ', 'タグ', 'tags', 'tag'].includes(lowerKey)) {
                    categoryProp = props[key];
                    break;
                }
            }

            let categoryName = 'General';
            if (categoryProp) {
                if (categoryProp.type === 'select' && categoryProp.select?.name) {
                    categoryName = categoryProp.select.name;
                } else if (categoryProp.type === 'multi_select' && categoryProp.multi_select?.[0]?.name) {
                    categoryName = categoryProp.multi_select[0].name;
                }
            }

            // 画像列の自動探索
            let imageProp = null;
            for (const key of Object.keys(props)) {
                const lowerKey = key.toLowerCase().trim();
                if (['image', 'images', '画像', 'カバー画像', 'アイキャッチ'].includes(lowerKey)) {
                    imageProp = props[key];
                    break;
                }
            }

            const titleObj = props.名前 || props.Name || props.name;
            const excerptObj = props.Excerpt || props.excerpt;
            const dateObj = props.Date || props.date;

            const contentHtml = await getPageContent(page.id);

            const fullTitle = titleObj?.title ? titleObj.title.map(t => t.plain_text).join('') : 'Untitled';
            const fullExcerpt = excerptObj?.rich_text ? excerptObj.rich_text.map(t => t.plain_text).join('') : '';

            // ★ 画像の全自動ダウンロード＆パス置換処理
            let finalImageUrl = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600';

            if (imageProp) {
                // Notionに直接アップロードされたファイル（Files & media型）の処理
                if (imageProp.type === 'files' && imageProp.files?.length > 0) {
                    const fileObj = imageProp.files[0];
                    const notionImageUrl = fileObj.file?.url || fileObj.external?.url;

                    if (notionImageUrl) {
                        try {
                            // URLから拡張子を特定（なければ.jpg）
                            const urlWithoutQuery = notionImageUrl.split('?')[0];
                            let ext = path.extname(urlWithoutQuery) || '.jpg';
                            if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext.toLowerCase())) {
                                ext = '.jpg';
                            }

                            // 重複しないファイル名（NotionのページID）で保存先を決定
                            const fileName = `${page.id}${ext}`;
                            const destPath = path.join(imagesDir, fileName);

                            // ビルド環境に画像を自動ダウンロード
                            await downloadImage(notionImageUrl, destPath);
                            finalImageUrl = `/images/${fileName}`; // サイト用のパスに置換
                            console.log(`画像を自動保存しました: ${fileName}`);
                        } catch (err) {
                            console.error(`画像の自動取得に失敗しました:`, err);
                        }
                    }
                }
                // 従来のURL直貼り（テキスト型やURL型）だった場合の互換性フォールバック
                else if (imageProp.type === 'rich_text' && imageProp.rich_text?.length > 0) {
                    finalImageUrl = imageProp.rich_text.map(t => t.plain_text).join('');
                } else if (imageProp.type === 'url' && imageProp.url) {
                    finalImageUrl = imageProp.url;
                }
            }

            const plainTextLength = contentHtml.replace(/<[^>]*>/g, '').length;
            const minutes = Math.max(1, Math.ceil(plainTextLength / 400));
            const finalReadTime = `${minutes} min read`;

            return {
                id: page.id,
                title: fullTitle,
                excerpt: fullExcerpt,
                date: dateObj?.date?.start?.replace(/-/g, '.') || '',
                category: categoryName,
                readTime: finalReadTime,
                image: finalImageUrl,
                content: contentHtml
            };
        }));

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
        console.log(`Notionから ${articles.length} 件の記事を正常に取得しました。`);
    } catch (error) {
        console.error('Notionからのデータ取得に失敗しました:', error);
        process.exit(1);
    }
}

fetchArticles();