-- Increase statement timeout for this session to let it finish
SET statement_timeout = 300000; -- 5 minutes
SELECT refresh_all_insights();
