import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function GET(req: Request) {
  try {
    const supabase = await createRouteClient();

    // 1. Authentication Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const me = session.user.id;

    // 2. Fetch all messages the user is involved in directly joining User context models
    const { data: messages, error } = await supabase
       .from('messages')
       .select('*, sender:users!sender_id(id, full_name, avatar_url), receiver:users!receiver_id(id, full_name, avatar_url)')
       .or(`sender_id.eq.${me},receiver_id.eq.${me}`)
       .order('sent_at', { ascending: false }); // Highest value first to instantly isolate generic overlaps

    if (error) throw error;

    if (!messages || messages.length === 0) {
       return NextResponse.json({ conversations: [] }, { status: 200 });
    }

    // 3. Map memory reducing the dataset resolving "unique conversations"
    const conversationMap = new Map();

    messages.forEach((msg: any) => {
       // Isolate the interaction boundary identifying who the user is talking to natively
       const otherUserId = msg.sender_id === me ? msg.receiver_id : msg.sender_id;
       const otherUserObj = msg.sender_id === me ? msg.receiver : msg.sender;

       // If not registered natively, establish the root object state tracking
       if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
             id: otherUserObj?.id || otherUserId,
             full_name: otherUserObj?.full_name || 'Unknown User',
             avatar_url: otherUserObj?.avatar_url || null,
             last_message: {
                content: msg.content,
                sent_at: msg.sent_at,
                job_id: msg.job_id
             },
             unread_count: 0 // Initialize at zero dynamically establishing counting constraints below
          });
       }

       // Irrespective of whether this represents the *first* iteration or not, 
       // increment the state block unread_count natively if it matches failure boundaries
       if (msg.receiver_id === me && msg.is_read === false) {
          const block = conversationMap.get(otherUserId);
          block.unread_count += 1;
       }
    });

    // Extract mapping back into iterable generic sorted arrays
    const conversations = Array.from(conversationMap.values());
    
    // Sort array by highest latest message sent_at internally (already pre-sorted effectively by the mapping but explicitly reinforcing)
    conversations.sort((a, b) => new Date(b.last_message.sent_at).getTime() - new Date(a.last_message.sent_at).getTime());

    return NextResponse.json({ conversations }, { status: 200 });

  } catch (error: any) {
    console.error("GET /api/messages/conversations error: ", error.message);
    return NextResponse.json({ error: "Failed to isolate conversational histories." }, { status: 500 });
  }
}
