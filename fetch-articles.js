import pkg from '@notionhq/client';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';

// 環境変数からトークンとIDを取得（ローカルテスト用、またはCloudflare用）
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

async function fetchArticles() {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
        console.log("Notionの環境変数が設定されていないため、データ取得をスキップします。");
        return;
    }

    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: 'Published',
                checkbox: { equals: true }, // 公開にチェックが入っているものだけ取得
            },
            sorts: [
                { property: 'Date', direction: 'descending' }, // 日付が新しい順
            ],
        });

        const articles = response.results.map((page) => {
            const props = page.properties;
            return {
                id: page.id,
                title: props.名前?.title[0]?.plain_text || 'Untitled',
                excerpt: props.Excerpt?.rich_text[0]?.plain_text || '',
                date: props.Date?.date?.start?.replace(/-/g, '.') || '',
                category: props.Category?.select?.name || 'General',
                readTime: '3 min read',
                image: props.Image?.rich_text[0]?.plain_text || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
            };
        });

        // srcフォルダ内に json として保存
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