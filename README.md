# BidFlow - Contract Intelligence Platform

BidFlow is Uganda's premier contract intelligence and bid management platform. It helps businesses discover, track, and win government and private sector contracts through data-driven insights and comprehensive bid management tools.

## 🚀 Features

### Core Functionality
- **Smart Contract Search**: Advanced filtering by industry, location, value, and deadline
- **Bid Tracking**: Monitor bid progress, deadlines, and status updates
- **Analytics Dashboard**: Track performance metrics, win rates, and market insights
- **Competition Analysis**: Historical bid data and competitor insights
- **Real-time Notifications**: Contract alerts and deadline reminders

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

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

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
```

## 🎯 Key Pages

### Landing Page (`/`)
- Modern, professional design
- Feature highlights and pricing
- Call-to-action for registration

### Dashboard (`/dashboard`)
- Overview metrics and recent activity
- Quick access to key features
- Recent contracts and notifications

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

The platform uses mock data for demonstration, including:
- **Contracts**: Title, client, value, deadline, requirements
- **Bids**: Status, progress, notes, priority
- **Analytics**: Performance metrics, trends, insights
- **Users**: Company information and preferences

## 🔮 Future Enhancements

- **Database Integration**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers
- **Payment Integration**: Flutterwave API implementation
- **Real-time Updates**: WebSocket connections
- **Advanced Analytics**: Chart.js or D3.js visualizations
- **API Development**: RESTful API for mobile apps
- **Email Notifications**: Nodemailer integration
- **File Upload**: Contract document management

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
