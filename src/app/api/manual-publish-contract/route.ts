import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Manually publishing contract ab8ae3f6-18ab-4322-91d4-5dc457e1b252...');
    
    // Update the contract to published status
    const { data: contract, error } = await supabase
      .from('contracts')
      .update({
        publish_status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', 'ab8ae3f6-18ab-4322-91d4-5dc457e1b252')
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to publish contract',
        error: error.message
      });
    }

    console.log('✅ Contract published successfully:', contract);

    // Now trigger the notification system
    console.log('🚀 Triggering notifications...');
    const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/contracts/notify-on-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contractId: 'ab8ae3f6-18ab-4322-91d4-5dc457e1b252' })
    });

    let notificationResult = null;
    if (notificationResponse.ok) {
      notificationResult = await notificationResponse.json();
      console.log('✅ Notifications triggered successfully:', notificationResult);
    } else {
      const errorText = await notificationResponse.text();
      console.error('❌ Failed to trigger notifications:', errorText);
    }

    return NextResponse.json({
      success: true,
      message: 'Contract manually published and notifications triggered',
      contract: {
        id: contract.id,
        title: contract.title,
        publish_status: contract.publish_status,
        published_at: contract.published_at
      },
      notification_result: notificationResult
    });

  } catch (error) {
    console.error('❌ Manual publish contract error:', error);
    return NextResponse.json({
      success: false,
      message: 'Manual publish contract failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
