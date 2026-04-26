import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function GET(req: Request) {
  try {
    const supabase = await createRouteClient();
    const { searchParams } = new URL(req.url);

    // Auth Guard
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = session.user.id;

    // Required Params
    const other_user_id = searchParams.get('other_user_id');
    if (!other_user_id) return NextResponse.json({ error: "other_user_id query param is required." }, { status: 400 });

    const job_id = searchParams.get('job_id');

    // 1. Fetch mutually locked messages matching the direct communication flow
    let query = supabase
      .from('messages')
      .select('*')
      .in('sender_id', [me, other_user_id])
      .in('receiver_id', [me, other_user_id]);

    // Optional Filter bounds
    if (job_id) {
       query = query.eq('job_id', job_id);
    }

    const { data: messages, error } = await query.order('sent_at', { ascending: true });
    
    if (error) throw error;

    // 2. Clear out unread status mapping for all messages where the logged in user is the receiver natively
    const unreadIds = (messages || [])
       .filter((m: any) => m.receiver_id === me && m.is_read === false)
       .map((m: any) => m.id);

    if (unreadIds.length > 0) {
       // Fire non-blocking edge boundary update marking the entire unread array explicitly
       supabase
         .from('messages')
         .update({ is_read: true })
         .in('id', unreadIds)
         .then(({ error: updateErr }) => {
            if(updateErr) console.error("Message Sync Marking Error: ", updateErr.message);
         });
    }

    return NextResponse.json({ messages: messages || [] }, { status: 200 });

  } catch (error: any) {
    console.error("GET /api/messages error: ", error.message);
    return NextResponse.json({ error: "Failed to fetch interaction logs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();

    // Auth Guard
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = session.user.id;

    const body = await req.json();
    const { receiver_id, content, job_id } = body;

    // Validations
    if (!receiver_id) return NextResponse.json({ error: "receiver_id is required." }, { status: 400 });
    if (!content || typeof content !== 'string') return NextResponse.json({ error: "Message content cannot be blank." }, { status: 400 });
    if (content.length > 5000) return NextResponse.json({ error: "Message exceeds 5000 character limits." }, { status: 400 });

    // Ensure users actually have a relational job pipeline tie before spamming random profiles
    
    // Check 1: Did ME apply to THEM?
    const { data: route1 } = await supabase
       .from('applications')
       .select('id, job_posts!inner(client_id)')
       .eq('engineer_id', me)
       .eq('job_posts.client_id', receiver_id)
       .limit(1);

    // Check 2: Did THEM apply to ME?
    const { data: route2 } = await supabase
       .from('applications')
       .select('id, job_posts!inner(client_id)')
       .eq('engineer_id', receiver_id)
       .eq('job_posts.client_id', me)
       .limit(1);

    const hasConnection = (route1 && route1.length > 0) || (route2 && route2.length > 0);
    
    if (!hasConnection) {
       return NextResponse.json({ error: "You can only message someone you have a job connection with." }, { status: 403 });
    }

    // Pipeline Execution Native
    const { data: insertedMsg, error: insertError } = await supabase
       .from('messages')
       .insert({
         sender_id: me,
         receiver_id,
         content,
         job_id: job_id || null
       })
       .select()
       .single();

    if (insertError) throw insertError;

    return NextResponse.json(insertedMsg, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/messages error: ", error.message);
    return NextResponse.json({ error: "Failed to dispatch message mapping." }, { status: 500 });
  }
}
