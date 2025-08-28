# BidFlow Platform - Comprehensive Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation & Setup](#installation--setup)
5. [Database Schema](#database-schema)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Core Features](#core-features)
8. [Admin Features](#admin-features)
9. [API Endpoints](#api-endpoints)
10. [Data Import System](#data-import-system)
11. [Analytics & Reporting](#analytics--reporting)
12. [Security Features](#security-features)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)

## 🎯 Overview

BidFlow is a comprehensive procurement and bidding platform designed to connect businesses with government and private sector contract opportunities. The platform provides a modern, user-friendly interface for contract discovery, management, and analytics.

### Key Value Propositions
- **Centralized Contract Discovery**: Access to multiple procurement sources
- **Smart Matching**: AI-powered contract recommendations based on business profile
- **Analytics Dashboard**: Comprehensive insights for business growth
- **Subscription Management**: Flexible pricing tiers with trial options

## ✨ Features

### 🏢 For Businesses (Users)
- **User Registration & Onboarding**: Complete profile setup with business details
- **Contract Discovery**: Browse and search available contracts
- **Smart Recommendations**: AI-powered contract matching
- **Contract Details**: Comprehensive contract information with requirements
- **Recent Contract Awards**: Historical data for market insights
- **Subscription Management**: Trial and paid subscription options
- **Dashboard Analytics**: Personal business insights

### 👨‍💼 For Administrators
- **User Management**: Complete user oversight and management
- **Contract Management**: Add, edit, and manage contracts
- **Bulk Import System**: CSV-based contract import functionality
- **Analytics Dashboard**: Platform-wide insights and metrics
- **Publish Status Control**: Draft, published, and archived contract states
- **Data Export**: Export capabilities for reporting

## 🛠 Technology Stack

### Frontend
- **Next.js 15.4.5**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Modern icon library
- **React Hook Form**: Form management

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Supabase**: Database and authentication
- **PostgreSQL**: Primary database
- **Row Level Security (RLS)**: Database-level security

### External Integrations
- **Python Web Scrapers**: Data collection from procurement portals
- **CSV Processing**: Data import/export functionality

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Python 3.8+ (for scrapers)

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Installation Steps
```bash
# Clone the repository
git clone <repository-url>
cd bidflow-platform

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## 🗄 Database Schema

### Core Tables

#### `profiles` Table
```sql
- id (UUID, Primary Key)
- email (Text)
- first_name (Text, Nullable)
- last_name (Text, Nullable)
- company_name (Text, Nullable)
- business_type (Text)
- experience_years (Integer)
- preferred_categories (Text Array)
- preferred_locations (Text Array)
- max_contract_value (BigInt)
- min_contract_value (BigInt)
- certifications (Text Array)
- team_size (Integer)
- subscription_status (Text: 'none', 'trial', 'active', 'expired', 'cancelled')
- trial_ends_at (Timestamp, Nullable)
- subscription_id (UUID, Nullable)
- role (Text: 'user', 'admin')
- onboarding_completed (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### `contracts` Table
```sql
- id (UUID, Primary Key)
- reference_number (Text)
- title (Text)
- description (Text)
- category (Text)
- procuring_entity (Text)
- estimated_value_min (BigInt)
- estimated_value_max (BigInt)
- deadline (Timestamp)
- procurement_method (Text)
- bid_security (Text)
- bid_fee (Numeric)
- awarded_value (BigInt, Nullable)
- awarded_to (Text, Nullable)
- publish_status (Text: 'draft', 'published', 'archived')
- published_at (Timestamp, Nullable)
- published_by (UUID, Nullable)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## 👥 User Roles & Permissions

### User Role
- **Access**: Dashboard, contract browsing, recommendations
- **Features**: Profile management, subscription management
- **Limitations**: Cannot access admin features

### Admin Role
- **Access**: All user features plus admin panel
- **Features**: User management, contract management, analytics
- **Permissions**: Full platform control

## 🎯 Core Features

### 1. User Dashboard
**Location**: `/dashboard`

**Features**:
- Contract recommendations based on business profile
- Recent activity feed
- Subscription status and management
- Quick access to saved contracts
- Business insights and metrics

### 2. Contract Discovery
**Location**: `/dashboard/contracts`

**Features**:
- Browse all published contracts
- Advanced search and filtering
- Category-based navigation
- Value range filtering
- Location-based filtering

### 3. Contract Details
**Location**: `/dashboard/contracts/[id]`

**Features**:
- Complete contract information
- Requirements and specifications
- Deadlines and important dates
- Recent Contract Awards section
- Contact information for procuring entity

### 4. Smart Recommendations
**Location**: `/dashboard/recommended`

**Features**:
- AI-powered contract matching
- Based on business type, experience, and preferences
- Relevance scoring
- Category-based recommendations

### 5. User Profile Management
**Features**:
- Complete business profile setup
- Experience and certification tracking
- Preferred categories and locations
- Contract value preferences
- Team size and business type

## 🔧 Admin Features

### 1. Admin Dashboard
**Location**: `/admin`

**Features**:
- Platform overview
- Quick access to all admin functions
- System health monitoring

### 2. User Management
**Location**: `/admin/users`

**Features**:
- View all registered users
- Search and filter users
- Subscription status management
- User statistics and analytics
- Export user data

**Statistics Cards**:
- Total Users
- Active Subscriptions
- Trial Users
- No Subscription
- Expired Subscriptions

### 3. Contract Management
**Location**: `/admin/contracts`

**Features**:
- View all contracts
- Add new contracts
- Edit existing contracts
- Bulk operations (publish/unpublish)
- Status filtering (draft/published/archived)

### 4. Contract Editor
**Location**: `/admin/contracts/edit/[id]`

**Features**:
- Comprehensive contract editing
- Form state persistence (localStorage)
- Unsaved changes detection
- Awarded contract data (optional)
- Publish status control

### 5. Bulk Import System
**Location**: `/admin/contracts/import`

**Features**:
- CSV file upload and validation
- Data preview before import
- Error handling and validation
- Progress tracking
- Import history

### 6. Analytics Dashboard
**Location**: `/admin/analytics`

**Features**:
- Platform-wide metrics
- User growth analytics
- Contract value analysis
- Subscription conversion rates
- Category performance
- Recent activity tracking

**Key Metrics**:
- Total Users
- Total Contracts
- Total Contract Value
- Monthly Growth Rate
- Top Contract Categories
- Subscription Overview
- User Engagement Rate

## 🔌 API Endpoints

### Public Endpoints
- `GET /api/contracts` - Fetch all contracts
- `POST /api/contracts` - Create new contract

### Admin Endpoints
- `GET /api/admin/users` - Fetch all users (service role)
- `POST /api/contracts/bulk-import` - Bulk import contracts

### Authentication
- Supabase Auth integration
- Row Level Security (RLS) policies
- Service role key for admin operations

## 📊 Data Import System

### CSV Import Format
Required columns for contract import:
```csv
reference_number,title,description,category,procuring_entity,estimated_value_min,estimated_value_max,deadline,procurement_method,bid_security,bid_fee
```

### Import Process
1. **File Upload**: Drag & drop or file picker
2. **Validation**: Client-side data validation
3. **Preview**: Review data before import
4. **Import**: Server-side processing with error handling
5. **Confirmation**: Success/failure feedback

### Data Sources
- **eGP Uganda Portal**: Automated scraping via Python scripts
- **Manual Entry**: Admin interface for individual contracts
- **CSV Import**: Bulk data import functionality

## 📈 Analytics & Reporting

### User Analytics
- **Registration Trends**: Monthly user growth
- **Subscription Metrics**: Conversion rates and churn
- **Engagement Data**: User activity patterns
- **Geographic Distribution**: User location analysis

### Contract Analytics
- **Value Distribution**: Contract value ranges
- **Category Performance**: Most active categories
- **Procuring Entity Analysis**: Entity performance
- **Deadline Tracking**: Time-based contract analysis

### Business Intelligence
- **Market Trends**: Industry-specific insights
- **Competition Analysis**: Bidder behavior patterns
- **Revenue Projections**: Subscription revenue forecasting
- **Platform Health**: System performance metrics

## 🔒 Security Features

### Authentication & Authorization
- **Supabase Auth**: Secure user authentication
- **Role-Based Access**: User vs Admin permissions
- **Row Level Security**: Database-level access control
- **Service Role Key**: Secure admin operations

### Data Protection
- **Environment Variables**: Secure configuration management
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy

### Privacy Features
- **User Data Control**: Profile management
- **Subscription Privacy**: Secure payment processing
- **Data Export**: User data portability

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
1. **Supabase Project**: Configure production database
2. **Environment Variables**: Set production credentials
3. **Domain Configuration**: Set up custom domain
4. **SSL Certificate**: Enable HTTPS

### Monitoring
- **Error Tracking**: Implement error monitoring
- **Performance Monitoring**: Track page load times
- **User Analytics**: Monitor user behavior
- **Database Monitoring**: Track query performance

## 🛠 Troubleshooting

### Common Issues

#### 1. RLS (Row Level Security) Issues
**Problem**: Users can't see data they should have access to
**Solution**: Check RLS policies and ensure proper user authentication

#### 2. Import Failures
**Problem**: CSV import fails with validation errors
**Solution**: 
- Check CSV format and required columns
- Validate data types and formats
- Ensure all required fields are present

#### 3. Form State Loss
**Problem**: Form data disappears when navigating
**Solution**: Form state is persisted in localStorage, check browser storage

#### 4. Build Errors
**Problem**: Next.js build fails
**Solution**:
```bash
# Clear cache and rebuild
rm -rf .next
npm cache clean --force
npm run build
```

### Performance Optimization
- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Implement proper caching strategies
- **Database Indexing**: Optimize query performance

## 📞 Support

### Getting Help
- **Documentation**: This README file
- **Code Comments**: Inline code documentation
- **Error Logs**: Check browser console and server logs
- **Database Logs**: Supabase dashboard monitoring

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 🎉 Conclusion

BidFlow is a comprehensive procurement platform designed to streamline the bidding process for businesses while providing powerful analytics and management tools for administrators. The platform combines modern web technologies with robust data management to create a scalable, secure, and user-friendly solution for contract discovery and management.

For additional support or feature requests, please refer to the project documentation or contact the development team.
