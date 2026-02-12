-- ============================================
-- Argoth Views and Ranking Functions
-- ============================================

-- ============================================
-- VOTE AGGREGATION VIEW
-- ============================================
CREATE OR REPLACE VIEW debate_scores AS
SELECT
  d.id AS debate_id,
  COALESCE(SUM(v.value), 0) AS score,
  COUNT(CASE WHEN v.value = 1 THEN 1 END) AS agree_count,
  COUNT(CASE WHEN v.value = -1 THEN 1 END) AS disagree_count,
  COUNT(v.id) AS total_votes
FROM debates d
LEFT JOIN votes v ON v.target_id = d.id AND v.target_type = 'debate'
WHERE d.is_hidden = false
GROUP BY d.id;

CREATE OR REPLACE VIEW comment_scores AS
SELECT
  c.id AS comment_id,
  COALESCE(SUM(v.value), 0) AS score,
  COUNT(CASE WHEN v.value = 1 THEN 1 END) AS upvote_count,
  COUNT(CASE WHEN v.value = -1 THEN 1 END) AS downvote_count,
  COUNT(v.id) AS total_votes
FROM comments c
LEFT JOIN votes v ON v.target_id = c.id AND v.target_type = 'comment'
WHERE c.is_hidden = false
GROUP BY c.id;

-- ============================================
-- REDDIT-STYLE HOT SCORE FUNCTION
-- ============================================
-- Based on Reddit's hot ranking algorithm
-- score = log10(max(|score|, 1)) * sign(score) + (age_in_hours / 45000)
-- This gives newer posts with positive scores a boost

CREATE OR REPLACE FUNCTION calculate_hot_score(
  score INTEGER,
  created_at TIMESTAMPTZ
)
RETURNS NUMERIC AS $$
DECLARE
  order_val NUMERIC;
  sign_val INTEGER;
  age_seconds NUMERIC;
  age_hours NUMERIC;
BEGIN
  -- Calculate the order (log of absolute score)
  IF score > 0 THEN
    order_val := LOG(GREATEST(ABS(score), 1));
    sign_val := 1;
  ELSIF score < 0 THEN
    order_val := LOG(GREATEST(ABS(score), 1));
    sign_val := -1;
  ELSE
    order_val := 0;
    sign_val := 0;
  END IF;

  -- Calculate age in hours
  age_seconds := EXTRACT(EPOCH FROM (NOW() - created_at));
  age_hours := age_seconds / 3600;

  -- Return hot score (sign * log(score) + time_component)
  -- We subtract age to make newer content rank higher
  RETURN (sign_val * order_val) - (age_hours / 45000);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- TOGGLE VOTE FUNCTION (ATOMIC)
-- ============================================
-- This function handles the complex vote toggling logic atomically
-- Returns the new vote value (1, -1, or 0 for removed)

CREATE OR REPLACE FUNCTION toggle_vote(
  p_user_id UUID,
  p_target_type TEXT,
  p_target_id UUID,
  p_new_value SMALLINT
)
RETURNS TABLE(action TEXT, new_value SMALLINT) AS $$
DECLARE
  existing_vote RECORD;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT * INTO existing_vote
  FROM votes
  WHERE user_id = p_user_id
    AND target_type = p_target_type
    AND target_id = p_target_id
  FOR UPDATE;

  -- Case 1: No existing vote -> Insert new vote
  IF NOT FOUND THEN
    INSERT INTO votes (user_id, target_type, target_id, value)
    VALUES (p_user_id, p_target_type, p_target_id, p_new_value);
    
    RETURN QUERY SELECT 'inserted'::TEXT, p_new_value;
    RETURN;
  END IF;

  -- Case 2: Clicking same vote -> Remove vote
  IF existing_vote.value = p_new_value THEN
    DELETE FROM votes
    WHERE user_id = p_user_id
      AND target_type = p_target_type
      AND target_id = p_target_id;
    
    RETURN QUERY SELECT 'removed'::TEXT, 0::SMALLINT;
    RETURN;
  END IF;

  -- Case 3: Clicking opposite vote -> Update to new value
  UPDATE votes
  SET value = p_new_value, updated_at = NOW()
  WHERE user_id = p_user_id
    AND target_type = p_target_type
    AND target_id = p_target_id;
  
  RETURN QUERY SELECT 'updated'::TEXT, p_new_value;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MATERIALIZED DEBATE FEED VIEWS
-- ============================================

-- New debates (simple - just ordered by created_at)
CREATE OR REPLACE VIEW debates_feed_new AS
SELECT
  d.id,
  d.topic_id,
  d.author_id,
  d.title,
  d.claim,
  d.description,
  d.side_a_label,
  d.side_b_label,
  d.created_at,
  d.updated_at,
  p.username AS author_username,
  p.display_name AS author_display_name,
  t.name AS topic_name,
  t.slug AS topic_slug,
  COALESCE(ds.score, 0) AS score,
  COALESCE(ds.agree_count, 0) AS agree_count,
  COALESCE(ds.disagree_count, 0) AS disagree_count,
  COALESCE(ds.total_votes, 0) AS total_votes,
  (SELECT COUNT(*) FROM comments WHERE debate_id = d.id AND is_hidden = false) AS comment_count
FROM debates d
LEFT JOIN profiles p ON p.id = d.author_id
LEFT JOIN topics t ON t.id = d.topic_id
LEFT JOIN debate_scores ds ON ds.debate_id = d.id
WHERE d.is_hidden = false
ORDER BY d.created_at DESC;

-- Top 24h debates
CREATE OR REPLACE VIEW debates_feed_top_24h AS
SELECT
  d.id,
  d.topic_id,
  d.author_id,
  d.title,
  d.claim,
  d.description,
  d.side_a_label,
  d.side_b_label,
  d.created_at,
  d.updated_at,
  p.username AS author_username,
  p.display_name AS author_display_name,
  t.name AS topic_name,
  t.slug AS topic_slug,
  COALESCE(ds.score, 0) AS score,
  COALESCE(ds.agree_count, 0) AS agree_count,
  COALESCE(ds.disagree_count, 0) AS disagree_count,
  COALESCE(ds.total_votes, 0) AS total_votes,
  (SELECT COUNT(*) FROM comments WHERE debate_id = d.id AND is_hidden = false) AS comment_count
FROM debates d
LEFT JOIN profiles p ON p.id = d.author_id
LEFT JOIN topics t ON t.id = d.topic_id
LEFT JOIN debate_scores ds ON ds.debate_id = d.id
WHERE d.is_hidden = false
  AND d.created_at > NOW() - INTERVAL '24 hours'
ORDER BY COALESCE(ds.score, 0) DESC, d.created_at DESC;

-- Top 7d debates
CREATE OR REPLACE VIEW debates_feed_top_7d AS
SELECT
  d.id,
  d.topic_id,
  d.author_id,
  d.title,
  d.claim,
  d.description,
  d.side_a_label,
  d.side_b_label,
  d.created_at,
  d.updated_at,
  p.username AS author_username,
  p.display_name AS author_display_name,
  t.name AS topic_name,
  t.slug AS topic_slug,
  COALESCE(ds.score, 0) AS score,
  COALESCE(ds.agree_count, 0) AS agree_count,
  COALESCE(ds.disagree_count, 0) AS disagree_count,
  COALESCE(ds.total_votes, 0) AS total_votes,
  (SELECT COUNT(*) FROM comments WHERE debate_id = d.id AND is_hidden = false) AS comment_count
FROM debates d
LEFT JOIN profiles p ON p.id = d.author_id
LEFT JOIN topics t ON t.id = d.topic_id
LEFT JOIN debate_scores ds ON ds.debate_id = d.id
WHERE d.is_hidden = false
  AND d.created_at > NOW() - INTERVAL '7 days'
ORDER BY COALESCE(ds.score, 0) DESC, d.created_at DESC;

-- Trending debates (hot score)
CREATE OR REPLACE VIEW debates_feed_trending AS
SELECT
  d.id,
  d.topic_id,
  d.author_id,
  d.title,
  d.claim,
  d.description,
  d.side_a_label,
  d.side_b_label,
  d.created_at,
  d.updated_at,
  p.username AS author_username,
  p.display_name AS author_display_name,
  t.name AS topic_name,
  t.slug AS topic_slug,
  COALESCE(ds.score, 0) AS score,
  COALESCE(ds.agree_count, 0) AS agree_count,
  COALESCE(ds.disagree_count, 0) AS disagree_count,
  COALESCE(ds.total_votes, 0) AS total_votes,
  (SELECT COUNT(*) FROM comments WHERE debate_id = d.id AND is_hidden = false) AS comment_count,
  calculate_hot_score(COALESCE(ds.score, 0)::INTEGER, d.created_at) AS hot_score
FROM debates d
LEFT JOIN profiles p ON p.id = d.author_id
LEFT JOIN topics t ON t.id = d.topic_id
LEFT JOIN debate_scores ds ON ds.debate_id = d.id
WHERE d.is_hidden = false
ORDER BY calculate_hot_score(COALESCE(ds.score, 0)::INTEGER, d.created_at) DESC;
