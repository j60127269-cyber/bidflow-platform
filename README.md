# BidFlow - Contract Intelligence Platform

BidFlow is Uganda's premier contract intelligence and bid management platform. It helps businesses discover, track, and win government and private sector contracts through data-driven insights and comprehensive bid management tools.

## 🚀 Features

### Core Functionality
- **Smart Contract Search**: Advanced filtering by industry, location, value, and deadline
- **Bid Tracking**: Monitor bid progress, deadlines, and status updates
- **Analytics Dashboard**: Track performance metrics, win rates, and market insights
- **Competition Analysis**: Historical bid data and competitor insights
- **Real-time Notifications**: Contract alerts and deadline reminders
- **User Authentication**: Secure login and registration with Supabase

### Key Capabilities
- **Contract Discovery**: Find relevant contracts with advanced search filters
- **Progress Tracking**: Monitor bid status with visual progress indicators
- **Performance Analytics**: Win rate analysis and market trend insights
- **Team Collaboration**: Share contracts and coordinate bid preparation
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication & Database**: Supabase
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bidflow-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings > API
   - Copy `env.example` to `.env.local`
   - Add your Supabase credentials to `.env.local`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: bidflow-platform
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to Uganda
5. Click "Create new project"

### 2. Get API Keys
1. Go to Settings > API in your Supabase dashboard
2. Copy the **Project URL** and **anon public** key
3. Add them to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Schema
The platform uses the following tables:

#### `profiles` table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `contracts` table
```sql
CREATE TABLE contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  location TEXT NOT NULL,
  value NUMERIC NOT NULL,
  deadline DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'awarded')),
  posted_date DATE DEFAULT CURRENT_DATE,
  requirements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `bids` table
```sql
CREATE TABLE bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  contract_id UUID REFERENCES contracts(id) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'submitted', 'won', 'lost')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  submitted_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `notifications` table
```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Row Level Security (RLS)
Enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Contracts: Everyone can view contracts
CREATE POLICY "Anyone can view contracts" ON contracts
  FOR SELECT USING (true);

-- Bids: Users can only see their own bids
CREATE POLICY "Users can view own bids" ON bids
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bids" ON bids
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bids" ON bids
  FOR UPDATE USING (auth.uid() = user_id);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── analytics/      # Analytics and insights
│   │   ├── contracts/      # Contract search and listing
│   │   ├── tracking/       # Bid tracking functionality
│   │   └── layout.tsx      # Dashboard layout
│   ├── login/              # Authentication pages
│   ├── register/
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/              # Reusable components
│   └── ProtectedRoute.tsx  # Authentication protection
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication state
├── lib/                    # Utility libraries
│   └── supabase.ts         # Supabase client
└── types/                  # TypeScript types
    └── database.ts         # Database schema types
```

## 🎯 Key Pages

### Landing Page (`/`)
- Modern, professional design
- Feature highlights and pricing
- Call-to-action for registration

### Authentication (`/login`, `/register`)
- Secure user registration and login
- Form validation and error handling
- Supabase authentication integration

### Dashboard (`/dashboard`)
- Overview metrics and recent activity
- Quick access to key features
- Recent contracts and notifications
- Protected by authentication

### Contracts (`/dashboard/contracts`)
- Advanced search and filtering
- Contract cards with detailed information
- Save and share functionality

### Analytics (`/dashboard/analytics`)
- Performance metrics and trends
- Category-wise analysis
- Market insights and recommendations

### Tracking (`/dashboard/tracking`)
- Bid progress monitoring
- Status updates and deadlines
- Priority management

## 💰 Pricing

- **Professional Plan**: 30,000 UGX/month
- **Features**: Unlimited contract searches, advanced analytics, real-time notifications, team collaboration
- **Payment**: Mobile money and card payments via Flutterwave

## 🎨 Design System

The platform uses a modern, professional design with:
- **Color Scheme**: Blue primary with slate grays
- **Typography**: Clean, readable fonts
- **Components**: Consistent card layouts and interactive elements
- **Responsive**: Mobile-first design approach

## 🚀 Deployment

The project is configured for easy deployment on Vercel:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Add environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features
1. Create new pages in `src/app/`
2. Add navigation links in dashboard layout
3. Update types and interfaces as needed
4. Test responsive design on different screen sizes

## 📊 Data Structure

The platform uses Supabase for data storage:
- **Users**: Authentication and profile information
- **Contracts**: Government and private sector contracts
- **Bids**: User bid tracking and status
- **Notifications**: Real-time alerts and updates

## 🔮 Future Enhancements

- **Payment Integration**: Flutterwave API implementation
- **Real-time Updates**: WebSocket connections
- **Advanced Analytics**: Chart.js or D3.js visualizations
- **API Development**: RESTful API for mobile apps
- **Email Notifications**: Nodemailer integration
- **File Upload**: Contract document management
- **Mobile App**: React Native application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for BidFlow platform.

## 📞 Support

For support and questions, contact the development team.

---

**BidFlow** - Empowering businesses to win more contracts through intelligent bid management.
