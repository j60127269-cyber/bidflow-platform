/**
 * Cron Job Configuration for BidFlow Platform
 * 
 * This file contains cron job configurations for various automated tasks
 * including daily digest emails, deadline reminders, and contract matching.
 */

export interface CronJob {
  name: string;
  schedule: string;
  description: string;
  endpoint: string;
  enabled: boolean;
}

/**
 * Daily Digest Email Cron Job
 * Runs every day at 8:00 AM UTC
 */
export const DAILY_DIGEST_CRON: CronJob = {
  name: 'daily-digest',
  schedule: '0 8 * * *', // Every day at 8:00 AM UTC
  description: 'Send daily digest emails with matched opportunities to all users',
  endpoint: '/api/daily-digest/process',
  enabled: true
};

/**
 * Deadline Reminder Cron Job
 * Runs every day at 9:00 AM UTC
 */
export const DEADLINE_REMINDER_CRON: CronJob = {
  name: 'deadline-reminders',
  schedule: '0 9 * * *', // Every day at 9:00 AM UTC
  description: 'Send deadline reminder emails for contracts due within 3 days',
  endpoint: '/api/notifications/process',
  enabled: true
};

/**
 * Contract Matching Cron Job
 * Runs every 6 hours
 */
export const CONTRACT_MATCHING_CRON: CronJob = {
  name: 'contract-matching',
  schedule: '0 */6 * * *', // Every 6 hours
  description: 'Process new contracts and send immediate match notifications',
  endpoint: '/api/contracts/match',
  enabled: true
};

/**
 * All configured cron jobs
 */
export const CRON_JOBS: CronJob[] = [
  DAILY_DIGEST_CRON,
  DEADLINE_REMINDER_CRON,
  CONTRACT_MATCHING_CRON
];

/**
 * Get cron job by name
 */
export function getCronJob(name: string): CronJob | undefined {
  return CRON_JOBS.find(job => job.name === name);
}

/**
 * Get all enabled cron jobs
 */
export function getEnabledCronJobs(): CronJob[] {
  return CRON_JOBS.filter(job => job.enabled);
}

/**
 * Cron job configuration for different deployment environments
 */
export const CRON_CONFIG = {
  development: {
    dailyDigest: '0 8 * * *', // 8:00 AM UTC
    deadlineReminders: '0 9 * * *', // 9:00 AM UTC
    contractMatching: '0 */6 * * *' // Every 6 hours
  },
  production: {
    dailyDigest: '0 8 * * *', // 8:00 AM UTC
    deadlineReminders: '0 9 * * *', // 9:00 AM UTC
    contractMatching: '0 */6 * * *' // Every 6 hours
  },
  staging: {
    dailyDigest: '0 8 * * *', // 8:00 AM UTC
    deadlineReminders: '0 9 * * *', // 9:00 AM UTC
    contractMatching: '0 */6 * * *' // Every 6 hours
  }
};

/**
 * Instructions for setting up cron jobs
 */
export const CRON_SETUP_INSTRUCTIONS = `
# Cron Job Setup Instructions

## 1. Using Vercel Cron Jobs (Recommended)
Add to your vercel.json:

{
  "crons": [
    {
      "path": "/api/daily-digest/process",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/notifications/process", 
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/contracts/match",
      "schedule": "0 */6 * * *"
    }
  ]
}

## 2. Using External Cron Service (cron-job.org, etc.)
Set up these URLs to be called at the specified times:

- Daily Digest: https://your-domain.com/api/daily-digest/process (8:00 AM UTC)
- Deadline Reminders: https://your-domain.com/api/notifications/process (9:00 AM UTC)  
- Contract Matching: https://your-domain.com/api/contracts/match (Every 6 hours)

## 3. Using Server Cron (if self-hosting)
Add to your server's crontab:

0 8 * * * curl -X POST https://your-domain.com/api/daily-digest/process
0 9 * * * curl -X POST https://your-domain.com/api/notifications/process
0 */6 * * * curl -X POST https://your-domain.com/api/contracts/match

## 4. Testing Cron Jobs
You can test the endpoints manually:

- GET /api/daily-digest/process (test daily digest)
- GET /api/notifications/process (test notifications)
- GET /api/contracts/match (test contract matching)
`;
