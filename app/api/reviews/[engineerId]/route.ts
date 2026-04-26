import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function GET(req: Request, context: { params: Promise<{ engineerId: string }> }) {
  const params = await context.params;
  try {
    const supabase = await createRouteClient();
    const { engineerId } = params;
    const { searchParams } = new URL(req.url);

    let page = parseInt(searchParams.get('page') || '1', 10);
    if (isNaN(page) || page < 1) page = 1;

    let limit = parseInt(searchParams.get('limit') || '10', 10);
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const offset = (page - 1) * limit;

    // 1. Fetch raw distributions computing global statistics rapidly natively without needing paginations
    const { data: rawRatings, error: statsError } = await supabase
       .from('reviews')
       .select('rating, rating_communication, rating_professionalism, rating_quality, rating_timeliness')
       .eq('reviewee_id', engineerId);

    if (statsError) throw statsError;

    // 2. Initialize constraints natively
    const total_count = rawRatings?.length || 0;
    let average_rating = 0;
    let average_per_category = { communication: 0, professionalism: 0, quality: 0, timeliness: 0 };
    const rating_distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (total_count > 0) {
       let sumRating = 0;
       
       // Track internal categories strictly scaling mathematically across non-null limits
       let counts = { comm: 0, prof: 0, qual: 0, time: 0 };
       let sums = { comm: 0, prof: 0, qual: 0, time: 0 };

       rawRatings.forEach((r: any) => {
          sumRating += r.rating;
          
          if (r.rating >= 1 && r.rating <= 5) {
             rating_distribution[r.rating as keyof typeof rating_distribution] += 1;
          }

          if (r.rating_communication) { sums.comm += r.rating_communication; counts.comm++; }
          if (r.rating_professionalism) { sums.prof += r.rating_professionalism; counts.prof++; }
          if (r.rating_quality) { sums.qual += r.rating_quality; counts.qual++; }
          if (r.rating_timeliness) { sums.time += r.rating_timeliness; counts.time++; }
       });

       average_rating = Number((sumRating / total_count).toFixed(1));
       average_per_category.communication = counts.comm > 0 ? Number((sums.comm / counts.comm).toFixed(1)) : 0;
       average_per_category.professionalism = counts.prof > 0 ? Number((sums.prof / counts.prof).toFixed(1)) : 0;
       average_per_category.quality = counts.qual > 0 ? Number((sums.qual / counts.qual).toFixed(1)) : 0;
       average_per_category.timeliness = counts.time > 0 ? Number((sums.time / counts.time).toFixed(1)) : 0;
    }

    // 3. Fetch exact paginated subset mapped natively traversing relationship bounds
    const { data: reviews, error: fetchError } = await supabase
       .from('reviews')
       .select('*, reviewer:users!reviewer_id(full_name, avatar_url)')
       .eq('reviewee_id', engineerId)
       .order('created_at', { ascending: false })
       .range(offset, offset + limit - 1);

    if (fetchError) throw fetchError;

    return NextResponse.json({
       reviews: reviews || [],
       stats: {
          average_rating,
          total_count,
          rating_distribution,
          average_per_category
       },
       page,
       total_pages: Math.ceil(total_count / limit)
    }, { status: 200 });

  } catch (error: any) {
    console.error(`GET /api/reviews/${params.engineerId} error: `, error.message);
    return NextResponse.json({ error: "Failed to fetch aggregated review states." }, { status: 500 });
  }
}
