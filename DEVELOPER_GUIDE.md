# BidFlow Platform - Developer Guide

## 🚀 Quick Start for Developers

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Supabase account
- VS Code (recommended)

### Initial Setup
```bash
# Clone and setup
git clone <repository-url>
cd bidflow-platform
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development
npm run dev
```

## 🏗 Architecture Overview

### Project Structure
```
bidflow-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities and configs
│   ├── types/                 # TypeScript definitions
│   └── utils/                 # Helper functions
├── public/                    # Static assets
├── scripts/                   # Database scripts
└── docs/                      # Documentation
```

### Technology Stack
- **Frontend**: Next.js 15.4.5, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth
- **State Management**: React hooks + localStorage
- **Forms**: React Hook Form
- **Icons**: Lucide React

## 🔧 Development Workflow

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb config with custom rules
- **Prettier**: Code formatting
- **Conventional Commits**: Git commit messages

### Branch Strategy
```bash
main          # Production branch
develop       # Development branch
feature/*     # Feature branches
hotfix/*      # Hotfix branches
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run tests (when implemented)
```

## 🗄 Database Design

### Core Tables

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  business_type TEXT NOT NULL DEFAULT 'IT Consulting',
  experience_years INTEGER DEFAULT 0,
  preferred_categories TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  max_contract_value BIGINT DEFAULT 10000000,
  min_contract_value BIGINT DEFAULT 1000000,
  certifications TEXT[] DEFAULT '{}',
  team_size INTEGER DEFAULT 0,
  subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'trial', 'active', 'expired', 'cancelled')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_id UUID,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Contracts Table
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  procuring_entity TEXT,
  estimated_value_min BIGINT,
  estimated_value_max BIGINT,
  deadline TIMESTAMP WITH TIME ZONE,
  procurement_method TEXT,
  bid_security TEXT,
  bid_fee NUMERIC,
  awarded_value BIGINT,
  awarded_to TEXT,
  publish_status TEXT DEFAULT 'draft' CHECK (publish_status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)
```sql
-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Contracts policies
CREATE POLICY "Published contracts are viewable by all" ON contracts
  FOR SELECT USING (publish_status = 'published');

CREATE POLICY "Admins can manage all contracts" ON contracts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 🔌 API Development

### API Route Structure
```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Your logic here
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Your logic here
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Service Role vs Anon Key
```typescript
// For admin operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// For user operations (respects RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## 🎨 Component Development

### Component Structure
```typescript
// src/components/ExampleComponent.tsx
'use client';

import { useState, useEffect } from 'react';
import { ExampleIcon } from 'lucide-react';

interface ExampleComponentProps {
  title: string;
  data?: any[];
  onAction?: (id: string) => void;
}

export default function ExampleComponent({ 
  title, 
  data = [], 
  onAction 
}: ExampleComponentProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (id: string) => {
    setLoading(true);
    try {
      await onAction?.(id);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {/* Component content */}
    </div>
  );
}
```

### Form Components
```typescript
// Using React Hook Form
import { useForm } from 'react-hook-form';

interface FormData {
  title: string;
  description: string;
  category: string;
}

export default function ContractForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to create contract');
      
      // Handle success
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('title', { required: 'Title is required' })}
        className="form-input"
      />
      {errors.title && <span className="text-red-500">{errors.title.message}</span>}
      {/* More form fields */}
    </form>
  );
}
```

## 🔐 Authentication & Authorization

### User Authentication
```typescript
// src/lib/auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
```

### Role-Based Access Control
```typescript
// src/utils/auth.ts
export const isAdmin = (user: any) => {
  return user?.role === 'admin';
};

export const requireAuth = (Component: React.ComponentType) => {
  return function AuthenticatedComponent(props: any) {
    const { user, loading } = useUser();
    
    if (loading) return <LoadingSpinner />;
    if (!user) return <Redirect to="/login" />;
    
    return <Component {...props} />;
  };
};

export const requireAdmin = (Component: React.ComponentType) => {
  return function AdminComponent(props: any) {
    const { user, loading } = useUser();
    
    if (loading) return <LoadingSpinner />;
    if (!user || !isAdmin(user)) return <Redirect to="/dashboard" />;
    
    return <Component {...props} />;
  };
};
```

## 📊 State Management

### Local Storage Persistence
```typescript
// src/utils/storage.ts
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};
```

### Form State Persistence
```typescript
// Custom hook for form persistence
export const useFormPersistence = (key: string, initialData: any) => {
  const [data, setData] = useState(() => {
    const saved = storage.get(key);
    return saved || initialData;
  });

  const updateData = useCallback((newData: any) => {
    setData(newData);
    storage.set(key, newData);
  }, [key]);

  const clearData = useCallback(() => {
    setData(initialData);
    storage.remove(key);
  }, [key, initialData]);

  return { data, updateData, clearData };
};
```

## 🧪 Testing Strategy

### Unit Testing Setup
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
```

### Component Testing Example
```typescript
// src/components/__tests__/ExampleComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ExampleComponent from '../ExampleComponent';

describe('ExampleComponent', () => {
  it('renders with title', () => {
    render(<ExampleComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', () => {
    const mockAction = jest.fn();
    render(<ExampleComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Dynamic imports for code splitting
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});
```

### Image Optimization
```typescript
import Image from 'next/image';

export function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      {...props}
    />
  );
}
```

### Database Query Optimization
```typescript
// Efficient queries with proper indexing
const getContracts = async (filters: ContractFilters) => {
  let query = supabase
    .from('contracts')
    .select('*')
    .eq('publish_status', 'published');

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.minValue) {
    query = query.gte('estimated_value_min', filters.minValue);
  }

  // Add pagination
  query = query.range(filters.offset, filters.offset + filters.limit - 1);

  const { data, error } = await query;
  return { data, error };
};
```

## 🔍 Debugging & Monitoring

### Error Handling
```typescript
// Global error boundary
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### Logging
```typescript
// src/utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error reporting service
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

## 📦 Deployment

### Environment Configuration
```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NODE_ENV=production
```

### Build Process
```bash
# Install dependencies
npm ci

# Build application
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    
    - name: Deploy to server
      run: |
        # Your deployment commands here
```

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools & Extensions
- **VS Code Extensions**:
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com)
- [TypeScript Community](https://discord.gg/typescript)

---

This developer guide provides the essential information needed to contribute to and maintain the BidFlow platform. For specific implementation details, refer to the inline code comments and the main README documentation.
