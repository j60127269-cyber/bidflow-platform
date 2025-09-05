import { NextRequest, NextResponse } from 'next/server';
import { PreferenceNotificationService } from '@/lib/preferenceNotificationService';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { contractId } = await request.json();

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Get the contract details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Check and send preference-based notifications
    await PreferenceNotificationService.checkAndNotifyNewContract(contract);

    return NextResponse.json({
      success: true,
      message: 'Preference notifications processed'
    });

  } catch (error) {
    console.error('Error processing preference notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Endpoint to send deadline reminders based on preferences
export async function PUT(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'deadline-reminders') {
      await PreferenceNotificationService.sendPreferenceBasedDeadlineReminders();
      
      return NextResponse.json({
        success: true,
        message: 'Deadline reminders sent'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error sending deadline reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
