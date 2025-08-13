import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsappService';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Test WhatsApp message without requiring Supabase
    const testMessage = `🧪 Test WhatsApp from BidFlow!

This is a test message to verify that Twilio WhatsApp is working correctly.

Time: ${new Date().toLocaleString()}

If you receive this message, the WhatsApp notification system is working! 🎉

---
This is an automated test from your BidFlow notification system.`;

    await whatsappService.send(phone, testMessage);

    return NextResponse.json({ 
      success: true, 
      message: 'Test WhatsApp message sent successfully!' 
    });
  } catch (error) {
    console.error('Error sending test WhatsApp:', error);
    return NextResponse.json(
      { error: 'Failed to send test WhatsApp', details: error },
      { status: 500 }
    );
  }
}
