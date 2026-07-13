import fs from 'fs';
import path from 'path';

const databaseId = process.env.NOTION_DATABASE_ID;

async function fetchArticles() {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
        console.log("Notionの環境変数が設定されていないため、データ取得をスキップします。");
        return;
    }

    try {
        // ライブラリを使わず、Node.js標準のfetchでNotion APIを直接叩く
        const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filter: {
                    property: 'Published',
                    checkbox: { equals: true }, // 公開にチェックが入っているもの
                },
                sorts: [
                    { property: 'Date', direction: 'descending' }, // 日付が新しい順
                ],
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Notion API HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const data = await response.json();

        const articles = data.results.map((page) => {
            const props = page.properties;
            return {
                id: page.id,
                title: props.名前?.title[0]?.plain_text || 'Untitled',
                excerpt: props.Excerpt?.rich_text[0]?.plain_text || '',
                date: props.Date?.date?.start?.replace(/-/g, '.') || '',
                category: props.Category?.multi_select?.[0]?.name || 'General',
                readTime: '3 min read',
                image: props.Image?.rich_text[0]?.plain_text || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
            };
        });

        // src/data/articles.json に保存
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