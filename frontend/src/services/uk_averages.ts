export interface UKAverageRecord {
  date: string;
  petrol_avg: number;
  petrol_low: number;
  petrol_high: number;
  diesel_avg: number;
  diesel_low: number;
  diesel_high: number;
  sample_size: number;
  petrol_low_brand?: string;
  petrol_low_address?: string;
  petrol_high_brand?: string;
  petrol_high_address?: string;
  diesel_low_brand?: string;
  diesel_low_address?: string;
  diesel_high_brand?: string;
  diesel_high_address?: string;
}

export const fetchUKPriceHistory = async (): Promise<UKAverageRecord[]> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pvutijbggbbrobjlpwrp.supabase.co';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const safeUrl = supabaseUrl.includes('bdqmzhniwxsshxqorgnt') ? 'https://pvutijbggbbrobjlpwrp.supabase.co' : supabaseUrl;
    const safeKey = anonKey;

    const response = await fetch(`${safeUrl}/rest/v1/uk_price_history?select=*&order=date.desc&limit=7`, {
      method: 'GET',
      headers: {
        'apikey': safeKey,
        'Authorization': `Bearer ${safeKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch UK price history: ${response.statusText}`);
    }

    const data = await response.json();
    // Return sorted oldest to newest for the graph
    return data.sort((a: UKAverageRecord, b: UKAverageRecord) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching UK price history:', error);
    return [];
  }
};
