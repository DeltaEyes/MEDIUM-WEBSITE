import fs from 'fs';
import path from 'path';

const databaseId = process.env.NOTION_DATABASE_ID;
const token = process.env.NOTION_TOKEN;

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
    if (!token || !databaseId) {
        console.log("Notionの環境変数が設定されていないため、データ取得をスキップします。");
        return;
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

            const titleObj = props.名前 || props.Name || props.name;
            const excerptObj = props.Excerpt || props.excerpt;
            const dateObj = props.Date || props.date;
            const imageObj = props.Image || props.image;

            // 本文HTMLの取得
            const contentHtml = await getPageContent(page.id);

            // 分裂した文字列を1つに合体
            const fullTitle = titleObj?.title ? titleObj.title.map(t => t.plain_text).join('') : 'Untitled';
            const fullExcerpt = excerptObj?.rich_text ? excerptObj.rich_text.map(t => t.plain_text).join('') : '';
            const fullImage = imageObj?.rich_text ? imageObj.rich_text.map(t => t.plain_text).join('') : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600';

            // ★ 本文の文字数から読了時間を全自動計算（1分あたり400文字換算・最低1分）
            const plainTextLength = contentHtml.replace(/<[^>]*>/g, '').length; // HTMLタグをすべて除外した純粋な文字数
            const minutes = Math.max(1, Math.ceil(plainTextLength / 400));
            const finalReadTime = `${minutes} min read`;

            return {
                id: page.id,
                title: fullTitle,
                excerpt: fullExcerpt,
                date: dateObj?.date?.start?.replace(/-/g, '.') || '',
                category: categoryName,
                readTime: finalReadTime, // 計算された時間をセット
                image: fullImage,
                content: contentHtml
            };
        }));

        const dirPath = path.resolve('src/data');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(
            path.join(dirPath, 'articles.json'),
            JSON.stringify(articles, null, 2)
        );
        console.log(`Notionから ${articles.length} 件の記事を正常に取得しました。`);
    } catch (error) {
        console.error('Notionからのデータ取得に失敗しました:', error);
        process.exit(1);
    }
}

fetchArticles();