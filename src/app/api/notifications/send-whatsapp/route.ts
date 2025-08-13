import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsappService';

export async function POST(request: NextRequest) {
  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, message' },
        { status: 400 }
      );
    }

    // Get user phone from Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', userId)
      .single();

    if (error || !profile?.phone) {
      console.error('User phone not found for userId:', userId, 'Error:', error);
      return NextResponse.json(
        { error: 'User phone number not found' },
        { status: 404 }
      );
    }

    // Send WhatsApp message
    await whatsappService.send(profile.phone, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp notification' },
      { status: 500 }
    );
  }
}
