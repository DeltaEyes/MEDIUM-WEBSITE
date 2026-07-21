const cookieName = 'medium_visitor_id';

function getVisitorId(request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
  return match?.[1] || null;
}

function response(body, visitorId, status = 200) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  if (visitorId) {
    headers['Set-Cookie'] = `${cookieName}=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`;
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function validArticleId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 200;
}

async function getStatus(db, articleId, visitorId) {
  const [countRow, likedRow] = await db.batch([
    db.prepare('SELECT COUNT(*) AS count FROM article_likes WHERE article_id = ?1').bind(articleId),
    db.prepare('SELECT 1 AS liked FROM article_likes WHERE article_id = ?1 AND visitor_id = ?2 LIMIT 1').bind(articleId, visitorId),
  ]);

  return {
    likeCount: Number(countRow.results[0]?.count || 0),
    isLiked: Boolean(likedRow.results.length),
  };
}

export async function onRequestGet({ env, params, request }) {
  const articleId = params.articleId;
  if (!validArticleId(articleId)) return response({ error: 'Invalid article ID' }, null, 400);

  const existingVisitorId = getVisitorId(request);
  const visitorId = existingVisitorId || crypto.randomUUID();
  const status = await getStatus(env.LIKES_DB, articleId, visitorId);
  return response(status, existingVisitorId ? null : visitorId);
}

export async function onRequestPost({ env, params, request }) {
  const articleId = params.articleId;
  if (!validArticleId(articleId)) return response({ error: 'Invalid article ID' }, null, 400);

  const existingVisitorId = getVisitorId(request);
  const visitorId = existingVisitorId || crypto.randomUUID();
  const current = await getStatus(env.LIKES_DB, articleId, visitorId);

  if (current.isLiked) {
    await env.LIKES_DB.prepare(
      'DELETE FROM article_likes WHERE article_id = ?1 AND visitor_id = ?2'
    ).bind(articleId, visitorId).run();
  } else {
    await env.LIKES_DB.prepare(
      'INSERT OR IGNORE INTO article_likes (article_id, visitor_id) VALUES (?1, ?2)'
    ).bind(articleId, visitorId).run();
  }

  const status = await getStatus(env.LIKES_DB, articleId, visitorId);
  return response(status, existingVisitorId ? null : visitorId);
}
