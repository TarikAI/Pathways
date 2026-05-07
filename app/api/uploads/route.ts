import { put } from '@vercel/blob';
import { requireSession } from '@/lib/auth-guards';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    const session = await requireSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!request.body) {
      return NextResponse.json({ error: 'No body provided' }, { status: 400 });
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json({ error: 'Blob storage not configured' }, { status: 500 });
    }

    const blob = await put(filename, request.body, {
      access: 'public',
      token: blobToken,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error uploading blob:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
