# Email & WhatsApp Notification Setup Guide

## Overview

The tracking system now supports email and WhatsApp notifications for bid deadlines and important updates. This guide explains how to implement the actual notification services.

## Current Implementation

### ✅ What's Already Working:

1. **Database Integration** - Notifications are stored in Supabase
2. **User Preferences** - Email and WhatsApp preferences are tracked
3. **Notification Logic** - Deadline reminders at 7 days, 3 days, and 1 day
4. **In-App Notifications** - Real-time notifications in the web app

### 🔧 What Needs Implementation:

1. **Email Service Integration**
2. **WhatsApp Business API Integration**
3. **Scheduled Tasks/Cron Jobs**

## 🆓 Free API Services

### Free Email Services

#### 1. **Resend (Recommended - Most Generous)**
- **Free Tier**: 3,000 emails/month
- **Setup**: Very easy
- **Reliability**: Excellent

```bash
npm install resend
```

```typescript
// src/lib/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async send(to: string, subject: string, html: string) {
    return resend.emails.send({
      from: 'BidFlow <onboarding@resend.dev>', // Free verified domain
      to: [to],
      subject,
      html,
    });
  }
};
```

#### 2. **SendGrid**
- **Free Tier**: 100 emails/day (3,000/month)
- **Setup**: Moderate
- **Reliability**: Excellent

```bash
npm install @sendgrid/mail
```

```typescript
// src/lib/emailService.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const emailService = {
  async send(to: string, subject: string, html: string) {
    const msg = {
      to,
      from: 'noreply@yourdomain.com', // Need to verify domain
      subject,
      html,
    };
    
    return sgMail.send(msg);
  }
};
```

#### 3. **Mailgun**
- **Free Tier**: 5,000 emails/month for 3 months
- **Setup**: Moderate
- **Reliability**: Good

```bash
npm install mailgun.js
```

```typescript
// src/lib/emailService.ts
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
});

export const emailService = {
  async send(to: string, subject: string, html: string) {
    return client.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: 'BidFlow <noreply@yourdomain.com>',
      to: [to],
      subject,
      html,
    });
  }
};
```

#### 4. **Brevo (formerly Sendinblue)**
- **Free Tier**: 300 emails/day (9,000/month)
- **Setup**: Easy
- **Reliability**: Good

```bash
npm install @getbrevo/brevo
```

```typescript
// src/lib/emailService.ts
import * as SibApiV3Sdk from '@getbrevo/brevo';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

export const emailService = {
  async send(to: string, subject: string, html: string) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = { email: 'noreply@yourdomain.com', name: 'BidFlow' };
    
    return apiInstance.sendTransacEmail(sendSmtpEmail);
  }
};
```

### Free WhatsApp Services

#### 1. **Twilio WhatsApp (Free Trial)**
- **Free Tier**: $15-20 credit for trial
- **Setup**: Easy
- **Reliability**: Excellent

```bash
npm install twilio
```

```typescript
// src/lib/whatsappService.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const whatsappService = {
  async send(to: string, message: string) {
    return client.messages.create({
      from: 'whatsapp:+14155238886', // Twilio sandbox number
      to: `whatsapp:${to}`,
      body: message,
    });
  }
};
```

#### 2. **WhatsApp Business API (Free for Small Business)**
- **Free Tier**: 1,000 conversations/month
- **Setup**: Complex (requires business verification)
- **Reliability**: Excellent

```typescript
// src/lib/whatsappService.ts
export const whatsappService = {
  async send(to: string, message: string) {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message },
        }),
      }
    );
    
    return response.json();
  }
};
```

#### 3. **Alternative: SMS via Twilio (Free Trial)**
- **Free Tier**: $15-20 credit for trial
- **Setup**: Easy
- **Reliability**: Excellent

```typescript
// src/lib/smsService.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const smsService = {
  async send(to: string, message: string) {
    return client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: to,
      body: message,
    });
  }
};
```

## 🚀 Quick Start with Free Services

### Step 1: Choose Your Free Services

**Recommended Free Stack:**
- **Email**: Resend (3,000 emails/month free)
- **WhatsApp**: Twilio trial ($15-20 credit)

### Step 2: Set Up Resend (Email)

1. **Sign up**: https://resend.com
2. **Get API key**: Copy from dashboard
3. **Add to .env.local**:
```env
RESEND_API_KEY=re_1234567890abcdef
```

### Step 3: Set Up Twilio (WhatsApp)

1. **Sign up**: https://twilio.com
2. **Get credentials**: Account SID and Auth Token
3. **Add to .env.local**:
```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef
TWILIO_AUTH_TOKEN=1234567890abcdef
```

### Step 4: Create Service Files

```typescript
// src/lib/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async send(to: string, subject: string, html: string) {
    try {
      return await resend.emails.send({
        from: 'BidFlow <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }
};
```

```typescript
// src/lib/whatsappService.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const whatsappService = {
  async send(to: string, message: string) {
    try {
      return await client.messages.create({
        from: 'whatsapp:+14155238886', // Twilio sandbox
        to: `whatsapp:${to}`,
        body: message,
      });
    } catch (error) {
      console.error('WhatsApp sending failed:', error);
      throw error;
    }
  }
};
```

### Step 5: Update Notification Service

```typescript
// src/lib/notificationService.ts
import { emailService } from './emailService';
import { whatsappService } from './whatsappService';

// Replace console.log statements with:
await emailService.send(profile.email, subject, message);
await whatsappService.send(profile.phone, message);
```

## 📊 Free Tier Limits & Costs

### Email Services Comparison:

| Service | Free Emails/Month | Setup Difficulty | Reliability |
|---------|------------------|------------------|-------------|
| **Resend** | 3,000 | ⭐ Easy | ⭐⭐⭐⭐⭐ |
| **Brevo** | 9,000 | ⭐⭐ Easy | ⭐⭐⭐⭐ |
| **SendGrid** | 3,000 | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐⭐ |
| **Mailgun** | 5,000 (3 months) | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐ |

### WhatsApp Services Comparison:

| Service | Free Tier | Setup Difficulty | Reliability |
|---------|-----------|------------------|-------------|
| **Twilio** | $15-20 credit | ⭐ Easy | ⭐⭐⭐⭐⭐ |
| **WhatsApp Business** | 1,000 convos/month | ⭐⭐⭐⭐⭐ Complex | ⭐⭐⭐⭐⭐ |

## 💡 Cost Optimization Tips

### 1. **Smart Notification Scheduling**
- Only send critical reminders (1 day before deadline)
- Use in-app notifications for less urgent updates

### 2. **User Preference Management**
- Let users choose notification frequency
- Allow users to disable email/WhatsApp if needed

### 3. **Batch Notifications**
- Group multiple reminders in one email
- Send weekly digest instead of daily alerts

### 4. **Fallback Strategy**
- Use free tier for development/testing
- Upgrade only when approaching limits

## 🔄 Migration Path

### Phase 1: Development (Free)
- Use Resend + Twilio trial
- Test with small user base

### Phase 2: Growth (Paid)
- Upgrade when approaching limits
- Consider paid plans for reliability

### Phase 3: Scale (Enterprise)
- Multiple providers for redundancy
- Advanced features and analytics

## 🎯 Recommended Free Setup

**For MVP/Development:**
1. **Resend** for email (3,000/month free)
2. **Twilio trial** for WhatsApp ($15-20 credit)
3. **In-app notifications** for everything else

**Total Cost: $0-20/month for 100-500 users**

This setup will get you started completely free and can scale as your user base grows!
