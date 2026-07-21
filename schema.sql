CREATE TABLE IF NOT EXISTS article_likes (
  article_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (article_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS article_likes_article_id_idx
  ON article_likes (article_id);
