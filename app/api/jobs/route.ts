import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const supabase = await createRouteClient();

    const project_type = searchParams.get('project_type');
    const discipline = searchParams.get('discipline');
    const work_type = searchParams.get('work_type');
    const province = searchParams.get('province');
    const city = searchParams.get('city');
    const budget_min = parseInt(searchParams.get('budget_min') || '', 10) || null;
    const budget_max = parseInt(searchParams.get('budget_max') || '', 10) || null;
    const prc_required = searchParams.get('prc_required') === 'true';
    const keyword = searchParams.get('keyword');
    const days_posted = parseInt(searchParams.get('days_posted') || '', 10) || null;
    
    const sort = searchParams.get('sort') || 'newest';
    let page = parseInt(searchParams.get('page') || '1', 10);
    if (isNaN(page) || page < 1) page = 1;
    let limit = parseInt(searchParams.get('limit') || '10', 10);
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('job_posts')
      .select('*, users!client_id ( full_name )', { count: 'exact' })
      .eq('status', 'active');

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }
    if (project_type) query = query.overlaps('project_type', project_type.split(','));
    if (discipline) query = query.overlaps('discipline', discipline.split(','));
    if (work_type) query = query.overlaps('work_type', work_type.split(','));

    if (province) query = query.eq('province', province);
    if (city) query = query.eq('city', city);
    
    // Check if limits map appropriately across existing constraints
    if (budget_min) query = query.gte('budget_max', budget_min);
    if (budget_max) query = query.lte('budget_min', budget_max);
    
    // Assuming you have prc_required attached to job posts based on rule: "prc_required"
    // I will safely assume it exists if passed
    if (prc_required) query = query.eq('prc_required', true);

    if (days_posted) {
      const date = new Date();
      date.setDate(date.getDate() - days_posted);
      query = query.gte('created_at', date.toISOString());
    }

    switch (sort) {
      case 'budget_high':
        query = query.order('budget_max', { ascending: false });
        break;
      case 'budget_low':
        query = query.order('budget_max', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    query = query.range(offset, offset + limit - 1);

    const { data: jobs, error, count } = await query;
    if (error) throw error;

    return NextResponse.json(
      {
        jobs: jobs || [],
        total_count: count || 0,
        page,
        total_pages: Math.ceil((count || 0) / limit)
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/jobs error: ", error.message);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();
    
    // Authenticate and block explicitly
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userRecord } = await supabase.from('users').select('role').eq('id', session.user.id).single();
    if (userRecord?.role !== 'client') return NextResponse.json({ error: "Forbidden: Clients only" }, { status: 403 });

    const body = await req.json();
    const { 
      title, 
      project_type, 
      discipline, 
      work_type, 
      location_province, 
      location_city, 
      description,
      budget_min,
      budget_max,
      target_date,
      deadline,
      duration
    } = body;

    // Validate requirements natively
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    if (!Array.isArray(project_type) || project_type.length < 1) return NextResponse.json({ error: 'At least one project type is required' }, { status: 400 });
    if (!Array.isArray(discipline) || discipline.length < 1) return NextResponse.json({ error: 'At least one discipline is required' }, { status: 400 });
    if (!Array.isArray(work_type) || work_type.length < 1) return NextResponse.json({ error: 'At least one work type is required' }, { status: 400 });
    if (!location_province) return NextResponse.json({ error: 'Province is required' }, { status: 400 });
    if (!location_city) return NextResponse.json({ error: 'City is required' }, { status: 400 });
    if (!description || description.length < 80) return NextResponse.json({ error: 'Description must be at least 80 characters' }, { status: 400 });

    const { data: newJob, error: insertError } = await supabase
       .from('job_posts')
       .insert({
         client_id: session.user.id,
         title,
         description,
         project_type,
         discipline,
         work_type,
         province: location_province,
         city: location_city,
         budget_min: budget_min ? parseInt(budget_min) : null,
         budget_max: budget_max ? parseInt(budget_max) : null,
         target_date: target_date || null,
         deadline: deadline || null,
         duration: duration || null,
         status: 'active'
       })
       .select()
       .single();

    if (insertError) throw insertError;

    return NextResponse.json(newJob, { status: 201 });

  } catch (err: any) {
    console.error("POST /api/jobs error: ", err.message);
    return NextResponse.json({ error: "Failed to create job post." }, { status: 500 });
  }
}
