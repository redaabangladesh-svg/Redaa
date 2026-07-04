import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { createClient } from '@/lib/supabase-server';
import { uploadToR2 } from '@/lib/r2';

export async function POST(request: Request) {
  // Only allowlisted admins may upload product images
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!user?.email || !adminEmails.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // Resize/compress to a sane max width and convert to webp for smaller file size
  const optimized = await sharp(inputBuffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const key = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const publicUrl = await uploadToR2(key, optimized, 'image/webp');

  return NextResponse.json({ url: publicUrl });
}
