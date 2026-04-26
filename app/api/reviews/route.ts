import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();

    // 1. Auth Guard
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = session.user.id;

    const body = await req.json();
    const { 
      reviewee_id, 
      job_id, 
      rating, 
      comment, 
      tags,
      rating_communication, 
      rating_professionalism, 
      rating_quality, 
      rating_timeliness 
    } = body;

    // 2. Validation Constraints
    if (me === reviewee_id) {
       return NextResponse.json({ error: "You cannot review yourself." }, { status: 400 });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
       return NextResponse.json({ error: "Rating must be an integer between 1 and 5." }, { status: 400 });
    }
    
    if (!comment || comment.length < 30) {
       return NextResponse.json({ error: "Comment must be at least 30 characters long." }, { status: 400 });
    }

    // Explicit checking if categorical arrays are injected natively
    [rating_communication, rating_professionalism, rating_quality, rating_timeliness].forEach((val) => {
       if (val !== undefined && (!Number.isInteger(val) || val < 1 || val > 5)) {
          throw new Error("Category ratings must be integers between 1 and 5.");
       }
    });

    // 3. Prevent Duplicates (409)
    const { data: existingReview, error: existingErr } = await supabase
       .from('reviews')
       .select('id')
       .eq('reviewer_id', me)
       .eq('reviewee_id', reviewee_id)
       .eq('job_id', job_id)
       .single();

    if (existingReview) {
       return NextResponse.json({ error: "You have already reviewed this person for this job." }, { status: 409 });
    }

    // 4. Job Context Validation
    const { data: job, error: jobErr } = await supabase
       .from('job_posts')
       .select('client_id, status')
       .eq('id', job_id)
       .single();
       
    if (jobErr || !job) return NextResponse.json({ error: "Job does not exist." }, { status: 404 });
    
    if (job.status !== "closed") {
       return NextResponse.json({ error: "Reviews can only be submitted for closed jobs." }, { status: 400 });
    }

    // 5. Verification Mapping - ensure reviewer / reviewee are actually tied functionally as client/hired engineer
    // Fetch hired application connected to this job
    const { data: hiredApp, error: hiredAppErr } = await supabase
       .from('applications')
       .select('engineer_id')
       .eq('job_id', job_id)
       .eq('status', 'hired')
       .single();

    if (hiredAppErr || !hiredApp) {
       return NextResponse.json({ error: "No hired engineer found attached to this job entity." }, { status: 403 });
    }

    const { client_id } = job;
    const hired_engineer_id = hiredApp.engineer_id;

    const isClientReviewingEngineer = me === client_id && reviewee_id === hired_engineer_id;
    const isEngineerReviewingClient = me === hired_engineer_id && reviewee_id === client_id;

    if (!isClientReviewingEngineer && !isEngineerReviewingClient) {
       return NextResponse.json({ error: "You must be either the client or the explicit hired engineer of this job to submit a review." }, { status: 403 });
    }

    // 6. DB Insertion mapped to Database Triggers automatically updating aggregate profiles
    const { data: insertedReview, error: insertError } = await supabase
       .from('reviews')
       .insert({
          reviewer_id: me,
          reviewee_id,
          job_id,
          rating,
          comment,
          tags: tags || [],
          rating_communication: rating_communication !== undefined ? rating_communication : null,
          rating_professionalism: rating_professionalism !== undefined ? rating_professionalism : null,
          rating_quality: rating_quality !== undefined ? rating_quality : null,
          rating_timeliness: rating_timeliness !== undefined ? rating_timeliness : null
       })
       .select()
       .single();

    if (insertError) throw insertError;

    return NextResponse.json(insertedReview, { status: 201 });

  } catch (error: any) {
    if (error.message.includes("Category ratings must be")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/reviews error: ", error.message);
    return NextResponse.json({ error: "Failed to construct application review safely." }, { status: 500 });
  }
}
