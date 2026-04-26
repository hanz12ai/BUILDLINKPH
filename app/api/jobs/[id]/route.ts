import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const supabase = await createRouteClient();
    
    const jobId = params.id;
    const jobIdNum = parseInt(jobId, 10);
    if (!jobId || isNaN(jobIdNum)) return NextResponse.json({ error: "Job ID is required" }, { status: 400 });

    // Parallel fetch job_posts and job_attachments targeting the specific route param
    const [jobResult, attachmentsResult] = await Promise.all([
       supabase.from('job_posts').select('*, users!client_id(full_name)').eq('id', jobIdNum).single(),
       supabase.from('job_attachments').select('*').eq('job_id', jobId)  // job_attachments.job_id is string | null
    ]);

    if (jobResult.error) {
       return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Attempt unblocking RPC view count if implemented
    void supabase.rpc('increment_job_views', { p_job_id: jobId }).then(
       () => {},
       (err: any) => { console.error("Background job view metric failed (ignoring):", err?.message); }
    );

    return NextResponse.json({
       job: jobResult.data,
       attachments: attachmentsResult.data || []
    }, { status: 200 });

  } catch (error: any) {
     console.error("GET /api/jobs/[id] Error:", error.message);
     return NextResponse.json({ error: "Failed to fetch isolated job content." }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
     const supabase = await createRouteClient();
     const jobId = params.id;
     const jobIdNum = parseInt(jobId, 10);
     if (isNaN(jobIdNum)) return NextResponse.json({ error: "Invalid Job ID" }, { status: 400 });
     
     // Auth block
     const { data: { session } } = await supabase.auth.getSession();
     if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

     const { data: checkJob, error: checkJobError } = await supabase.from('job_posts').select('client_id').eq('id', jobIdNum).single();
     
     if (checkJobError || !checkJob) return NextResponse.json({ error: "Job not found" }, { status: 404 });
     if (checkJob.client_id !== session.user.id) return NextResponse.json({ error: "Forbidden. You can only update jobs you own." }, { status: 403 });

     const updates = await req.json();

     const { data: updatedJob, error: updateError } = await supabase
       .from('job_posts')
       .update(updates)
       .eq('id', jobIdNum)
       .select()
       .single();

     if (updateError) throw updateError;
     
     return NextResponse.json(updatedJob, { status: 200 });

  } catch(error: any) {
     console.error("PATCH /api/jobs/[id] Error:", error.message);
     return NextResponse.json({ error: "Failed to update job post." }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
     const supabase = await createRouteClient();
     const jobId = params.id;
     const jobIdNum = parseInt(jobId, 10);
     if (isNaN(jobIdNum)) return NextResponse.json({ error: "Invalid Job ID" }, { status: 400 });

     // Auth Guard
     const { data: { session } } = await supabase.auth.getSession();
     if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

     // Client Integrity Guard
     const { data: checkJob, error: checkJobError } = await supabase.from('job_posts').select('client_id').eq('id', jobIdNum).single();
     if (checkJobError || !checkJob) return NextResponse.json({ error: "Job not found" }, { status: 404 });
     if (checkJob.client_id !== session.user.id) return NextResponse.json({ error: "Forbidden. You can only delete jobs you own." }, { status: 403 });

     // 1. Check isolation dependencies — check applications with "hired" status implicitly tied
     const { data: hiredApps, error: hiredError } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobIdNum)
        .eq('status', 'hired');

     if (hiredError) throw hiredError;
     
     if (hiredApps && hiredApps.length > 0) {
        return NextResponse.json({ error: "Cannot delete a job with a hired engineer." }, { status: 400 });
     }

     // 2. Erase the job 
     const { error: deleteError } = await supabase.from('job_posts').delete().eq('id', jobIdNum);
     if (deleteError) throw deleteError;

     return NextResponse.json({ success: true }, { status: 200 });

  } catch(error: any) {
     console.error("DELETE /api/jobs/[id] Error:", error.message);
     return NextResponse.json({ error: "Execution blocked failing cascade isolation." }, { status: 500 });
  }
}
