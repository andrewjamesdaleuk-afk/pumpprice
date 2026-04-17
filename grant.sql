GRANT EXECUTE ON FUNCTION public.get_motorway_penalty(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_motorway_averages(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_cheapest_cities(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_most_expensive_cities(text) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
