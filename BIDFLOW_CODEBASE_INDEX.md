# BidFlow Platform - Complete Codebase Index & Analysis

## 📋 **Project Overview**

**BidFlow** is a comprehensive procurement and bidding platform designed for Uganda's government and private sector contract opportunities. It's a modern web application built with Next.js 15, TypeScript, and Supabase, featuring AI-powered contract recommendations, subscription management, and automated data scraping.

---

## 🏗️ **Architecture Overview**

### **Technology Stack**
- **Frontend**: Next.js 15.4.5 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Payments**: Flutterwave integration
- **Data Processing**: Python web scrapers, CSV import/export
- **Notifications**: Email (Resend), WhatsApp (Twilio)
- **AI Processing**: N8N webhooks for contract analysis

### **Project Structure**
```
bidflow-platform/
├── src/                          # Main application source
│   ├── app/                      # Next.js App Router pages
│   ├── components/               # Reusable React components
│   ├── contexts/                 # React contexts (Auth)
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries and services
│   └── types/                    # TypeScript type definitions
├── scripts/                      # Database and utility scripts
├── egp_scraper/                  # Python web scraper for eGP Uganda
├── docs/                         # Documentation files
└── public/                       # Static assets
```

---

## 🗄️ **Database Schema & Relationships**

### **Core Tables**

#### **1. Profiles Table** (`profiles`)
- **Purpose**: User profiles and business information
- **Key Fields**: `id`, `email`, `company_name`, `business_type`, `subscription_status`, `role`
- **Relationships**: One-to-many with `subscriptions`, `bid_tracking`, `notifications`

#### **2. Contracts Table** (`contracts`)
- **Purpose**: Central contract repository
- **Key Fields**: `id`, `reference_number`, `title`, `category`, `procuring_entity`, `estimated_value_min/max`, `submission_deadline`, `publish_status`
- **Relationships**: Many-to-one with `procuring_entities`, `awardees`

#### **3. Procuring Entities Table** (`procuring_entities`)
- **Purpose**: Government agencies and departments
- **Key Fields**: `id`, `entity_name`, `entity_type`, `contact_person`, `contact_email`
- **Relationships**: One-to-many with `contracts`

#### **4. Awardees Table** (`awardees`)
- **Purpose**: Companies that win contracts
- **Key Fields**: `id`, `company_name`, `business_type`, `primary_categories`, `locations`
- **Relationships**: One-to-many with `contracts`

#### **5. Subscriptions Table** (`subscriptions`)
- **Purpose**: User subscription management
- **Key Fields**: `id`, `user_id`, `plan_id`, `status`, `current_period_end`
- **Relationships**: Many-to-one with `profiles`, `subscription_plans`

#### **6. Bid Tracking Table** (`bid_tracking`)
- **Purpose**: User contract tracking preferences
- **Key Fields**: `id`, `user_id`, `contract_id`, `email_alerts`, `whatsapp_alerts`, `tracking_active`
- **Relationships**: Many-to-one with `profiles`, `contracts`

---

## 🎯 **Core Features & Workflows**

### **1. User Authentication & Onboarding**
- **Flow**: Registration → Email Verification → Profile Setup → Subscription Selection
- **Components**: `AuthContext`, `ProtectedRoute`, onboarding pages
- **Features**: Google OAuth, email/password auth, role-based access

### **2. Contract Discovery & Management**
- **Flow**: Browse Contracts → Filter/Search → View Details → Track Contract
- **Components**: Dashboard, contract cards, filtering system
- **Features**: Advanced search, category filtering, value range filtering

### **3. Subscription & Payment System**
- **Flow**: Select Plan → Payment (Flutterwave) → Subscription Activation
- **Components**: Subscription service, payment integration
- **Features**: 50,000 UGX/month plan, trial options, automatic renewals

### **4. Contract Tracking & Notifications**
- **Flow**: Track Contract → Set Preferences → Receive Alerts
- **Components**: Tracking service, notification system
- **Features**: Email/WhatsApp alerts, deadline reminders, preference management

### **5. Admin Panel & Data Management**
- **Flow**: Admin Login → Manage Users/Contracts → Bulk Import → Analytics
- **Components**: Admin dashboard, bulk import system
- **Features**: User management, contract CRUD, CSV import/export

---

## 🔌 **API Endpoints**

### **Public Endpoints**
- `GET /api/contracts` - Fetch all published contracts
- `POST /api/contracts` - Create new contract (admin)

### **Admin Endpoints**
- `GET /api/admin/users` - Fetch all users
- `POST /api/contracts/bulk-import` - Bulk import contracts from CSV
- `POST /api/admin/setup-first-admin` - Initialize admin setup

### **Payment Endpoints**
- `POST /api/flutterwave/initialize-payment` - Initialize payment
- `POST /api/flutterwave/verify-payment` - Verify payment status
- `POST /api/webhooks/flutterwave` - Payment webhooks

### **Notification Endpoints**
- `POST /api/notifications/send-email` - Send email notifications
- `POST /api/notifications/send-whatsapp` - Send WhatsApp notifications
- `POST /api/notifications/preference-check` - Check user preferences

### **AI Processing Endpoints**
- `POST /api/ai/process/[contractId]` - Process contract with AI
- `POST /api/ai/update-contract` - Update contract with AI data

---

## 🕷️ **Data Scraping & Import System**

### **EGP Scraper** (`egp_scraper/egp_scraper.py`)
- **Purpose**: Automated scraping of Uganda's eGP portal
- **Features**: Login automation, contract extraction, CSV export
- **Output**: Webapp-ready CSV files with processed contract data

### **Bulk Import System**
- **Flow**: Upload CSV → Validate Data → Process → Import to Database
- **Features**: Data validation, duplicate detection, error handling
- **Components**: File upload, data preview, progress tracking

### **Data Processing Pipeline**
1. **Scraping**: Python scripts extract raw data
2. **Validation**: Type checking and format validation
3. **Processing**: Data normalization and enrichment
4. **Import**: Batch insertion with error handling
5. **Notification**: Trigger user notifications for new contracts

---

## 🎨 **Frontend Architecture**

### **Page Structure**
- **Landing Page** (`/`): Marketing site with features and pricing
- **Dashboard** (`/dashboard`): Main user interface
- **Admin Panel** (`/admin`): Administrative functions
- **Auth Pages** (`/login`, `/register`): Authentication flows

### **Key Components**
- **ContractCard**: Displays contract information with tracking
- **FileUpload**: Handles CSV uploads with validation
- **TrackingSetupModal**: Contract tracking preferences
- **ProtectedRoute**: Route protection and authentication

### **State Management**
- **AuthContext**: Global authentication state
- **Local State**: React hooks for component state
- **Supabase**: Real-time data synchronization

---

## 🔧 **Services & Utilities**

### **Core Services**
- **SubscriptionService**: Handles subscription logic and Flutterwave integration
- **NotificationService**: Manages email/WhatsApp notifications
- **TrackingPreferencesService**: Contract tracking preferences
- **EmailService**: Email sending via Resend
- **WhatsAppService**: WhatsApp messaging via Twilio

### **Data Processing**
- **GovernmentCsvProcessor**: Processes government contract data
- **LocationService**: Handles location-based filtering
- **TextUtils**: Text formatting and display utilities

---

## 🔒 **Security & Authentication**

### **Authentication Flow**
1. User registers/logs in via Supabase Auth
2. Profile created with role assignment
3. Row Level Security (RLS) policies enforce access control
4. Admin routes protected with service role key

### **Security Features**
- **RLS Policies**: Database-level access control
- **Role-Based Access**: User vs Admin permissions
- **Input Validation**: Client and server-side validation
- **Environment Variables**: Secure configuration management

---

## 📊 **Analytics & Reporting**

### **User Analytics**
- Registration trends and user growth
- Subscription conversion rates
- Feature usage statistics
- Geographic distribution

### **Contract Analytics**
- Contract value distribution
- Category performance analysis
- Procuring entity statistics
- Deadline tracking metrics

---

## 🚀 **Deployment & Environment**

### **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_key
RESEND_API_KEY=your_resend_key
TWILIO_ACCOUNT_SID=your_twilio_sid
N8N_WEBHOOK_URL=your_n8n_webhook
```

### **Build & Deploy**
```bash
npm run build    # Production build
npm start        # Start production server
npm run dev      # Development server with Turbopack
```

---

## 🔄 **Data Flow Summary**

### **Contract Lifecycle**
1. **Data Collection**: Python scrapers extract from eGP portal
2. **Data Processing**: CSV validation and normalization
3. **Import**: Bulk import to database with triggers
4. **Publishing**: Admin publishes contracts for user visibility
5. **Discovery**: Users browse and filter contracts
6. **Tracking**: Users track contracts with preferences
7. **Notifications**: Automated alerts for deadlines and updates

### **User Journey**
1. **Registration**: Sign up with email or Google
2. **Onboarding**: Complete business profile
3. **Subscription**: Choose and pay for plan
4. **Discovery**: Browse and search contracts
5. **Tracking**: Track relevant contracts
6. **Notifications**: Receive deadline alerts
7. **Analytics**: View business insights

---

## 🛠️ **Development Workflow**

### **Key Scripts**
- `scripts/setup-database.sql`: Database schema setup
- `scripts/improve_data_relationships.sql`: Entity relationship management
- `scripts/process_existing_contracts.sql`: Contract processing
- `egp_scraper/run_egp_scraper.ps1`: Automated scraping

### **Testing & Quality**
- TypeScript for type safety
- ESLint for code quality
- Error handling and logging
- Database transaction management

---

## 📈 **Scalability Considerations**

### **Performance Optimizations**
- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching strategies for static data
- Optimized queries with proper joins

### **Monitoring & Maintenance**
- Error tracking and logging
- Performance monitoring
- Database health checks
- Automated backup strategies

---

## 🎯 **Key Business Logic**

### **Subscription Model**
- **Pricing**: 50,000 UGX/month
- **Features**: Unlimited contract access, premium analytics
- **Trial**: 7-day free trial available
- **Payment**: Flutterwave integration (mobile money, cards)

### **Contract Visibility**
- **Published**: Visible to all users
- **Draft**: Admin-only visibility
- **Archived**: Historical contracts
- **Filtering**: Category, value, location, deadline

### **Notification System**
- **Email**: HTML-formatted notifications via Resend
- **WhatsApp**: Text notifications via Twilio
- **Timing**: 7 days, 3 days, 1 day before deadlines
- **Preferences**: User-configurable notification types

---

This comprehensive index provides a complete understanding of the BidFlow platform's architecture, features, and implementation details. The platform is well-structured for scalability and maintainability, with clear separation of concerns and robust error handling throughout the application stack.
