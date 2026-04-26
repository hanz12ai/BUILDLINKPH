import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase';
import { createRouteClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, full_name, role } = body;

    // 1. Validate complete payload
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // 2. Validate Role formatting
    if (role !== 'client' && role !== 'engineer') {
      return NextResponse.json(
        { error: 'Invalid role. Must be either "client" or "engineer".' },
        { status: 400 }
      );
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // 3. If we have a service key, use the admin flow (bypasses RLS & auto-confirms)
    if (serviceKey) {
        const supabaseAdmin = createClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceKey,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authError) {
          if (authError.message.toLowerCase().includes('already registered') || authError.status === 422) {
             return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
          }
          throw authError; 
        }

        const userId = authData.user.id;

        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
             id: userId,
             email: email,
             full_name: full_name,
             role: role
          });

        if (insertError) {
           await supabaseAdmin.auth.admin.deleteUser(userId);
           throw insertError; 
        }

        return NextResponse.json({ success: true, userId: userId }, { status: 201 });
    } else {
        // 4. Fallback: Standard client signup (uses NEXT_PUBLIC_SUPABASE_ANON_KEY)
        const supabase = await createRouteClient();
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                    role
                }
            }
        });

        if (authError) {
          if (authError.message.toLowerCase().includes('already registered') || authError.status === 422) {
             return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
          }
          throw authError; 
        }

        if (!authData.user) {
            throw new Error("User registration failed (no user returned)");
        }

        const userId = authData.user.id;

        // Try to insert public user - if it fails it might be because of RLS or a Postgres trigger already did it
        const { error: insertError } = await supabase
          .from('users')
          .insert({
             id: userId,
             email: email,
             full_name: full_name,
             role: role
          });
          
        if (insertError) {
            console.warn("Public user insert warning (RLS or existing trigger):", insertError.message);
        }

        return NextResponse.json({ success: true, userId: userId }, { status: 201 });
    }

  } catch (error: any) {
    console.error('Registration Pipeline Error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

