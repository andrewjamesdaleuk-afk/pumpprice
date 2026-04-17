
GRANT EXECUTE ON FUNCTION public.get_one_mile_winners(text) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
