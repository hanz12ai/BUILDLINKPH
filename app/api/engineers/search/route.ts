import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Parse and validate optional parameters
    const specializationParam = searchParams.get('specialization');
    const specializations = specializationParam ? specializationParam.split(',').map(s => s.trim()).filter(Boolean) : null;

    const province = searchParams.get('province') || null;
    const city = searchParams.get('city') || null;
    const sort = searchParams.get('sort') || 'rating';

    const min_experience = parseInt(searchParams.get('min_experience') || '') || null;
    const min_rate = parseInt(searchParams.get('min_rate') || '') || null;
    const max_rate = parseInt(searchParams.get('max_rate') || '') || null;

    const prc_verified_raw = searchParams.get('prc_verified');
    const prc_verified = prc_verified_raw === 'true' ? true : null;

    let page = parseInt(searchParams.get('page') || '1');
    if (isNaN(page) || page < 1) page = 1;

    let limit = parseInt(searchParams.get('limit') || '12');
    if (isNaN(limit) || limit < 1) limit = 12;
    if (limit > 50) limit = 50;

    const offset = (page - 1) * limit;

    const supabase = await createRouteClient();

    // 2. Build query against engineer_profiles joined with users
    let query = supabase
      .from('engineer_profiles')
      .select(`
        *,
        users!user_id ( full_name, avatar_url )
      `, { count: 'exact' });

    // Filter by specializations (overlaps)
    if (specializations && specializations.length > 0) {
      query = query.overlaps('specializations', specializations);
    }

    // Filter by province
    if (province) {
      query = query.ilike('province', `%${province}%`);
    }

    // Filter by city
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    // Filter by min experience
    if (min_experience !== null) {
      query = query.gte('years_experience', min_experience);
    }

    // Filter by hourly rate range
    if (min_rate !== null) {
      query = query.gte('hourly_rate', min_rate);
    }
    if (max_rate !== null) {
      query = query.lte('hourly_rate', max_rate);
    }

    // Filter by PRC verified
    if (prc_verified) {
      query = query.eq('prc_verified', true);
    }

    // Sort
    switch (sort) {
      case 'highest_rated':
        query = query.order('years_experience', { ascending: false });
        break;
      case 'most_experienced':
        query = query.order('years_experience', { ascending: false });
        break;
      case 'newest':
        query = query.order('id', { ascending: false });
        break;
      default: // 'relevant' or 'rating'
        query = query.order('years_experience', { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error('Engineer search query error:', error.message);
      throw new Error(error.message);
    }

    // 3. Flatten the joined data for the frontend
    const engineers = (profiles || []).map((profile: any) => ({
      ...profile,
      full_name: profile.users?.full_name || null,
      avatar_url: profile.users?.avatar_url || profile.avatar_url || null,
      // Provide fallback fields that the card expects
      average_rating: profile.average_rating || 0,
      total_reviews: profile.total_reviews || 0,
    }));

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        engineers,
        total_count: totalCount,
        page,
        total_pages: totalPages,
        limit
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120'
        }
      }
    );

  } catch (error: any) {
    console.error('API Error /engineers/search:', error.message);
    return NextResponse.json(
      { error: 'Internal server error while searching engineers.' },
      { status: 500 }
    );
  }
}
