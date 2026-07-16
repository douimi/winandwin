-- ─────────────────────────────────────────────────────────────────────
-- Cleanup: delete anonymous / unregistered players across ALL merchants
-- ─────────────────────────────────────────────────────────────────────
--
-- Run this manually in the Neon SQL editor. It is NOT wired into any
-- application code because it's a destructive, cross-tenant operation.
--
-- What "anonymous" means here
--   A players row where BOTH name and email are NULL. These are
--   device fingerprints that spun once and never registered — they
--   also never received a coupon (post-refactor, coupons only exist
--   after /register). They're the rows the merchant sees as
--   "Anonymous" cluttering the Players list.
--
-- What gets deleted
--   1. Every anonymous players row (players.name IS NULL AND
--      players.email IS NULL).
--   2. As a side effect of the FK cascade
--      (game_plays.player_id → players.id ON DELETE CASCADE):
--      every game_plays row belonging to those players is also
--      deleted. Their play counts vanish from analytics.
--
-- What does NOT get deleted
--   - coupons.player_id has no FK constraint, so any orphan coupons
--     from before the recent refactor stay in place. That's actually
--     fine because coupons.prizeName / prizeDescription /
--     redemptionConditions are snapshotted on the row, so the
--     coupon UI still works even with a dangling playerId.
--   - No merchant / game / prize rows are touched.
--
-- Analytics impact to expect
--   - Dashboard "Total Games Played" and "Total Actions" will drop
--     by the amount attributable to anonymous plays. That is
--     accurate — those plays are gone from the DB.
--   - Analytics % vs previous period will reflect only the
--     registered plays.
--
-- If you don't want to lose the play history, DON'T RUN this — the
-- Players list already filters out anonymous rows visually. This
-- script exists for merchants who want the DB itself pruned.
--
-- Recommended flow
--   1. Run the "PREVIEW" query below to see exactly what would go.
--   2. If you're comfortable with the numbers, run the "DELETE" query.
--   3. If in doubt, take a Neon database snapshot / branch first.
-- ─────────────────────────────────────────────────────────────────────

-- ──────────────
-- 1. PREVIEW: counts what would be deleted, per merchant
--    Run this FIRST. It doesn't modify anything.
-- ──────────────
SELECT
  m.name                             AS merchant_name,
  m.slug                             AS merchant_slug,
  COUNT(DISTINCT p.id)               AS anonymous_players,
  COUNT(gp.id)                       AS anonymous_plays,
  SUM(CASE WHEN gp.result = 'win' THEN 1 ELSE 0 END) AS anonymous_wins_recorded
FROM players p
JOIN merchants m ON m.id = p.merchant_id
LEFT JOIN game_plays gp ON gp.player_id = p.id
WHERE p.name IS NULL
  AND p.email IS NULL
GROUP BY m.id, m.name, m.slug
ORDER BY anonymous_players DESC;

-- Summary row across all merchants (uncomment to run separately):
-- SELECT
--   COUNT(DISTINCT p.id)             AS total_anonymous_players,
--   COUNT(gp.id)                     AS total_anonymous_plays
-- FROM players p
-- LEFT JOIN game_plays gp ON gp.player_id = p.id
-- WHERE p.name IS NULL AND p.email IS NULL;


-- ──────────────
-- 2. DELETE: actually removes the rows.
--    Wrapped in a transaction so a mistake can be rolled back.
--    Uncomment the whole block to run.
-- ──────────────
-- BEGIN;
--   -- Explicitly delete game_plays first — Postgres would do this via
--   -- the FK cascade anyway, but doing it manually makes the row count
--   -- observable.
--   DELETE FROM game_plays
--   WHERE player_id IN (
--     SELECT id FROM players WHERE name IS NULL AND email IS NULL
--   );
--
--   DELETE FROM players
--   WHERE name IS NULL AND email IS NULL;
--
--   -- Sanity check — after the DELETE this should return 0 rows.
--   SELECT COUNT(*) AS remaining_anon
--   FROM players
--   WHERE name IS NULL AND email IS NULL;
--
--   -- If everything looks right:
--   COMMIT;
--   -- If something's off:
--   -- ROLLBACK;


-- ──────────────
-- 3. VERIFY: post-delete sanity checks (safe to run any time).
-- ──────────────
-- SELECT
--   COUNT(*) AS total_players,
--   COUNT(*) FILTER (WHERE name IS NOT NULL OR email IS NOT NULL) AS identified_players,
--   COUNT(*) FILTER (WHERE name IS NULL AND email IS NULL) AS anonymous_players
-- FROM players;
