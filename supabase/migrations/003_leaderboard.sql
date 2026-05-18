-- Enable the function to be called via supabase.rpc()
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(take_count INT DEFAULT 20)
RETURNS TABLE(
  full_name  TEXT,
  school     TEXT,
  weekly_xp  BIGINT,
  cur_streak INT,
  is_me      BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT
    up.full_name,
    up.school,
    COALESCE(SUM(xl.amount), 0)::BIGINT AS weekly_xp,
    COALESCE(s.current_streak, 0)       AS cur_streak,
    up.id = auth.uid()                  AS is_me
  FROM user_profiles up
  LEFT JOIN xp_logs xl
    ON xl.user_id = up.id
   AND xl.created_at >= date_trunc('week', NOW())
  LEFT JOIN streaks s ON s.user_id = up.id
  GROUP BY up.id, up.full_name, up.school, s.current_streak
  ORDER BY weekly_xp DESC
  LIMIT take_count;
$$;
