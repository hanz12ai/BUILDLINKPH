import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();

    // 1. Auth Guard
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized. Authentication is required to upload files." }, { status: 401 });
    
    const userId = session.user.id;
    const formData = await req.formData();
    
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;
    const jobId = formData.get('job_id') as string | null;

    // 2. Validate Presence
    if (!file) {
       return NextResponse.json({ error: "File not provided." }, { status: 400 });
    }
    
    if (!type || !["avatar", "prc_doc", "portfolio", "job_attachment"].includes(type)) {
       return NextResponse.json({ error: "Invalid upload type specified." }, { status: 400 });
    }

    if (type === "job_attachment" && !jobId) {
       return NextResponse.json({ error: "job_id is required when uploading job attachments." }, { status: 400 });
    }

    // 3. File Size Validation
    const FIVE_MB = 5 * 1024 * 1024;
    const TEN_MB = 10 * 1024 * 1024;
    
    if (type === "avatar" && file.size > FIVE_MB) {
       return NextResponse.json({ error: "File too large. Max size is 5MB." }, { status: 413 });
    } else if (type !== "avatar" && file.size > TEN_MB) {
       return NextResponse.json({ error: "File too large. Max size is 10MB." }, { status: 413 });
    }

    // 4. MIME Type Validation
    const mimeMap: Record<string, string[]> = {
       "avatar": ["image/jpeg", "image/png", "image/webp"],
       "prc_doc": ["image/jpeg", "image/png", "application/pdf"],
       "portfolio": ["image/jpeg", "image/png", "image/webp"],
       "job_attachment": ["image/jpeg", "image/png", "application/pdf"]
    };

    if (!mimeMap[type].includes(file.type)) {
       return NextResponse.json({ error: "File type not allowed." }, { status: 415 });
    }

    // Prepare variables for insertion/mapping
    const extMatch = file.name.match(/\.([^.]+)$/);
    const ext = extMatch ? extMatch[1] : '';
    const timestamp = Date.now();
    let bucket = '';
    let filePath = '';
    let isPublic = false;

    // 5. & 6. Setup Path Mapping and Bucket targeting
    switch (type) {
       case "avatar":
          bucket = 'avatars';
          filePath = `${userId}/avatar.${ext}`;
          isPublic = true;
          break;
       case "prc_doc":
          bucket = 'documents';
          filePath = `${userId}/prc/${timestamp}.${ext}`;
          break;
       case "portfolio":
          bucket = 'portfolio';
          filePath = `${userId}/portfolio/${timestamp}.${ext}`;
          isPublic = true;
          break;
       case "job_attachment":
          bucket = 'job-attachments';
          // Sanitize original name bypassing weird spacial chars breaking URLs
          const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          filePath = `${jobId}/${timestamp}-${safeName}`;
          break;
    }

    // Ensure array buffer explicitly casting
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6b. Storage Insertion
    const { data: uploadData, error: uploadError } = await supabase
       .storage
       .from(bucket)
       .upload(filePath, buffer, {
          contentType: file.type,
          upsert: type === 'avatar' // Upsert true replacing previous avatar cleanly
       });

    if (uploadError) {
       console.error("Storage upload block: ", uploadError);
       return NextResponse.json({ error: "Upload failed.", details: uploadError.message }, { status: 500 });
    }

    // Determine URL format securely (Public vs Private paths)
    let url = '';
    if (isPublic) {
       const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
       url = publicUrlData.publicUrl;
    } else {
       // Returning path for private boundaries (PRC/Job attachments handles downloading via secure APIs later if needed)
       url = uploadData.path; 
    }

    // 7. Success Hooks updating internal Databases natively
    if (type === "avatar") {
       await supabase.from('users').update({ avatar_url: url }).eq('id', userId);
    } 
    else if (type === "prc_doc") {
       await supabase.from('engineer_profiles')
          .update({ 
             prc_doc_url: uploadData.path, 
             prc_verified: false, 
             prc_verified_at: null 
          })
          .eq('user_id', userId);
    }
    else if (type === "job_attachment") {
       // Insert mapping directly isolating File mapping to Job explicitly
       await supabase.from('job_attachments').insert({
          job_id: jobId,
          file_url: uploadData.path, // We store the bare path for secure extraction in private buckets
          file_name: file.name,
          file_type: file.type
       });
    }

    // 8. Output Map
    return NextResponse.json({ 
       url, 
       path: uploadData.path, 
       type 
    }, { status: 200 });

  } catch (error: any) {
    console.error("POST /api/upload error: ", error.message);
    return NextResponse.json({ error: "Upload failed.", details: error.message }, { status: 500 });
  }
}
