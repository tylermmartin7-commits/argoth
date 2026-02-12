-- ============================================
-- Argoth Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TOPICS POLICIES
-- ============================================

-- Everyone can view topics
CREATE POLICY "Topics are publicly readable"
  ON topics FOR SELECT
  USING (true);

-- Only admins can insert/update/delete topics
CREATE POLICY "Admins can manage topics"
  ON topics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Everyone can view profiles
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile (except is_admin)
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Allow updating everything except is_admin unless they're already an admin
      (NEW.is_admin = OLD.is_admin)
      OR
      (OLD.is_admin = true)
    )
  );

-- ============================================
-- DEBATES POLICIES
-- ============================================

-- Public can view non-hidden debates
CREATE POLICY "Non-hidden debates are publicly readable"
  ON debates FOR SELECT
  USING (is_hidden = false OR auth.uid() = author_id);

-- Authenticated users can create debates
CREATE POLICY "Authenticated users can create debates"
  ON debates FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own debates
CREATE POLICY "Authors can update their own debates"
  ON debates FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (
    auth.uid() = author_id
    AND is_hidden = OLD.is_hidden -- Cannot change is_hidden
  );

-- Admins can hide/unhide debates
CREATE POLICY "Admins can moderate debates"
  ON debates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- COMMENTS POLICIES
-- ============================================

-- Public can view non-hidden comments on non-hidden debates
CREATE POLICY "Non-hidden comments are publicly readable"
  ON comments FOR SELECT
  USING (
    is_hidden = false
    OR auth.uid() = author_id
  );

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own comments
CREATE POLICY "Authors can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (
    auth.uid() = author_id
    AND is_hidden = OLD.is_hidden -- Cannot change is_hidden
  );

-- Admins can hide/unhide comments
CREATE POLICY "Admins can moderate comments"
  ON comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- VOTES POLICIES
-- ============================================

-- Users can view all votes
CREATE POLICY "Votes are publicly readable"
  ON votes FOR SELECT
  USING (true);

-- Authenticated users can insert their own votes
CREATE POLICY "Authenticated users can create votes"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update their own votes"
  ON votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes"
  ON votes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- REPORTS POLICIES
-- ============================================

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Authenticated users can create reports
CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admins can update report status
CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
