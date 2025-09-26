import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text } = await req.json()

    // For now, we'll use a simple email service
    // You can replace this with SendGrid, AWS SES, Resend, or any other email service
    
    // Example using Resend (you'll need to install the Resend package)
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    // const { data, error } = await resend.emails.send({
    //   from: 'notifications@yourdomain.com',
    //   to: [to],
    //   subject,
    //   html,
    //   text
    // })

    // For now, we'll just log the email (replace with actual email sending)
    console.log('Email to send:', {
      to,
      subject,
      html: html.substring(0, 100) + '...',
      text: text.substring(0, 100) + '...'
    })

    // Simulate email sending
    // In production, replace this with actual email service
    const emailResult = {
      id: 'email_' + Date.now(),
      to,
      subject,
      status: 'sent'
    }

    return new Response(
      JSON.stringify({ success: true, data: emailResult }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
