import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { userId, subject, html } = await request.json();

    if (!userId || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, subject, html' },
        { status: 400 }
      );
    }

    // Get user email from Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (error || !profile?.email) {
      console.error('User email not found for userId:', userId, 'Error:', error);
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 404 }
      );
    }

    // Send email
    await emailService.send(profile.email, subject, html);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email notification:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}
