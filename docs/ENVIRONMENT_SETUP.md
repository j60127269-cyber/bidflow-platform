# Environment Variables Setup Guide

## 🔧 **Required Environment Variables**

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# WhatsApp Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# n8n Webhook Configuration for AI Processing
N8N_WEBHOOK_URL=https://bidcloudd.app.n8n.cloud/webhook/ai-processing-webhook
N8N_WEBHOOK_AUTH=Bearer your_webhook_auth_token

# Groq API Configuration (for n8n workflow)
GROQ_API_KEY=your_groq_api_key
```

## 🆕 **New Variables for AI Processing**

### **N8N_WEBHOOK_URL**
- **Purpose**: URL of your n8n webhook for AI processing
- **Format**: `https://your-instance.n8n.cloud/webhook/ai-processing-webhook`
- **Example**: `https://mycompany.n8n.cloud/webhook/ai-processing-webhook`

### **N8N_WEBHOOK_AUTH**
- **Purpose**: Authentication token for the webhook
- **Format**: `Bearer your_token_here`
- **Example**: `Bearer abc123def456`

### **GROQ_API_KEY**
- **Purpose**: API key for Groq AI processing
- **Format**: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Get it from**: [Groq Console](https://console.groq.com/)

## 🔒 **Security Notes**

1. **Never commit `.env.local`** to version control
2. **Use strong, unique tokens** for webhook authentication
3. **Rotate API keys** regularly
4. **Limit webhook access** to specific IPs if possible

## 🧪 **Testing Configuration**

To test if your environment variables are set correctly:

```bash
# Check if webhook URL is set
echo $N8N_WEBHOOK_URL

# Test webhook connectivity
curl -X POST $N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: $N8N_WEBHOOK_AUTH" \
  -d '{"contractIds": ["test-id"]}'
```

## 🚀 **Production Setup**

For production deployment:

1. **Update URLs** to use your production domain
2. **Use production API keys** (not development keys)
3. **Set up monitoring** for webhook failures
4. **Configure rate limiting** to prevent abuse

## 📊 **Monitoring**

Monitor these metrics:
- Webhook response times
- AI processing success rates
- API key usage and limits
- Error rates and types
