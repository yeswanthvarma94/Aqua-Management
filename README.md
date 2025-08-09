# Aqua Data Manager - Mobile App

A comprehensive aquaculture management system with secure authentication, role-based permissions, and subscription management. Available as web and mobile applications for Android and iOS.

## Features

### 🔐 **Authentication & Security**
- **Multi-Method Login**: Email/password, phone/OTP, and Google OAuth
- **Role-Based Access**: Owner, Manager, and Partner roles with granular permissions
- **Secure JWT**: Token-based authentication with automatic refresh
- **User Management**: Owners can invite and manage team members
- **Data Encryption**: All sensitive data encrypted at rest and in transit

### 💳 **Subscription Management**
- **Flexible Pricing**: Free, Pro, and Enterprise tiers
- **Usage Limits**: Location and tank limits based on subscription
- **Auto-Activation**: Instant activation upon successful payment
- **365-Day Plans**: Annual billing with automatic renewal
- **Stripe Integration**: Secure payment processing

- 📱 **Native Mobile Experience**: Optimized for mobile devices with touch-friendly interfaces
- 🔄 **Offline-First**: Works completely offline with automatic sync when online
- 🌍 **Multi-Platform**: Web, Android, and iOS support
- 📊 **Comprehensive Management**: Locations, tanks, feeding, materials, expenses, and accounting

## Subscription Tiers

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| **Price** | ₹0/year | ₹2,999/year | ₹9,999/year |
| **Locations** | 1 | 2 | Unlimited |
| **Tanks** | 2 | 4 | Unlimited |
| **Users** | Owner only | Up to 5 | Unlimited |
| **Analytics** | Basic | Advanced | Custom |
| **Support** | Community | Email | Priority |
| **Integrations** | - | Weather API | Custom APIs |

## User Roles & Permissions

### 👑 **Owner**
- Full system access
- User management and invitations
- Subscription management
- All data operations
- Organization settings

### 👨‍💼 **Manager**
- Tank management
- Feeding schedules
- Expense tracking
- Material usage
- View reports

### 🤝 **Partner**
- View tank information
- Manage feeding schedules
- View basic reports
- Limited data access

## Mobile-Specific Features

- **Haptic Feedback**: Native touch feedback on supported devices
- **Safe Area Support**: Proper handling of device notches and home indicators
- **Keyboard Management**: Smart keyboard handling and resizing
- **Network Status**: Real-time network connectivity monitoring
- **Mobile-Optimized UI**: Touch-friendly buttons and responsive design

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for authentication and database)
- Stripe account (for payments)
- For Android: Android Studio and Android SDK
- For iOS: Xcode (macOS only)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd aqua-data-manager
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your Supabase and Stripe credentials
```

4. Set up Supabase
```bash
# Run the database migrations in your Supabase dashboard
# Or use the Supabase CLI:
supabase db push
```

3. Build the web application
```bash
npm run build
```

### Mobile Development

#### Android Setup

1. Add Android platform
```bash
npm run cap:add:android
```

2. Sync the project
```bash
npm run cap:sync
```

3. Open in Android Studio
```bash
npm run cap:open:android
```

4. Run on device/emulator
```bash
npm run cap:run:android
```

#### iOS Setup (macOS only)

1. Add iOS platform
```bash
npm run cap:add:ios
```

2. Sync the project
```bash
npm run cap:sync
```

3. Open in Xcode
```bash
npm run cap:open:ios
```

## Authentication Setup

### Supabase Configuration

1. Create a new Supabase project
2. Run the migration file `supabase/migrations/001_initial_auth_schema.sql`
3. Configure authentication providers in Supabase dashboard:
   - Enable Email/Password authentication
   - Enable Phone authentication (optional)
   - Configure Google OAuth (optional)
4. Set up your environment variables in `.env`

### Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
6. Add client ID to Supabase Auth settings

### Stripe Setup

1. Create a [Stripe account](https://stripe.com)
2. Get your publishable and secret keys
3. Set up webhook endpoints for subscription events
4. Configure products and prices in Stripe dashboard
5. Add Stripe keys to environment variables

4. Run on device/simulator
```bash
npm run cap:run:ios
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:mobile` - Build and sync for mobile
- `npm run cap:sync` - Sync web assets to native projects
- `npm run cap:run:android` - Run on Android
- `npm run cap:run:ios` - Run on iOS
- `npm run cap:open:android` - Open Android project in Android Studio
- `npm run cap:open:ios` - Open iOS project in Xcode

## Authentication Flow

1. **User Registration**: Creates user account and organization
2. **Email Verification**: Optional email confirmation
3. **Profile Setup**: Complete user profile information
4. **Team Invitations**: Owners can invite team members
5. **Role Assignment**: Assign appropriate roles and permissions
6. **Subscription**: Choose and activate subscription plan

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/invite` - Invite team member

### Subscription
- `GET /subscription/plans` - Get available plans
- `POST /subscription/checkout` - Create checkout session
- `POST /subscription/webhook` - Handle Stripe webhooks
- `PUT /subscription/cancel` - Cancel subscription

## Mobile App Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx           # Login interface
│   │   ├── SignupForm.tsx          # Registration interface
│   │   ├── UserManagement.tsx      # Team management
│   │   ├── AuthGuard.tsx           # Permission wrapper
│   │   └── AuthCallback.tsx        # OAuth callback handler
│   ├── subscription/
│   │   └── SubscriptionManager.tsx # Subscription management
│   ├── MobileDataManager.tsx    # Mobile-optimized main component
│   ├── MobileLayout.tsx         # Mobile layout wrapper
│   └── ...                      # Other components
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── hooks/
│   └── useMobile.ts            # Mobile-specific hooks
├── lib/
│   └── supabase.ts             # Supabase client and types
└── ...

android/                        # Android native project
ios/                            # iOS native project
capacitor.config.ts             # Capacitor configuration
supabase/
└── migrations/                 # Database migrations
```

## Key Mobile Components

### MobileDataManager
- Mobile-optimized navigation with collapsible menu
- Touch-friendly interface
- Network status indicators
- Safe area handling

### useMobile Hook
- Detects native platform
- Provides haptic feedback
- Manages keyboard events
- Monitors network status

### AuthContext
- Manages authentication state
- Handles login/logout
- Provides user and organization data
- Manages permissions and roles

### SubscriptionManager
- Displays pricing plans
- Handles plan upgrades
- Manages billing information
- Shows usage limits

### MobileLayout
- Handles safe areas
- Manages keyboard resizing
- Shows offline indicators

## Database Schema

### Core Tables
- **organizations**: Company/organization data
- **users**: User profiles and roles
- **user_invitations**: Team member invitations
- **locations**: Physical locations
- **tanks**: Tank information
- **feeds**: Feeding schedules and records
- **expenses**: Expense tracking
- **materials**: Material usage
- **stock**: Inventory management

### Security Features
- Row Level Security (RLS) enabled
- Organization-based data isolation
- Role-based access control
- Encrypted sensitive fields

## Data Sync & Storage

The app uses a hybrid approach:
- **Supabase**: Primary database with real-time sync
- **PouchDB**: Local offline storage with encryption
- **Offline-First**: All operations work offline
- **Automatic Sync**: Syncs with Supabase when online
- **Encrypted**: All local data is encrypted
- **IST Timezone**: All timestamps in Indian Standard Time

## Permissions

### Android
- Internet access
- Network state monitoring
- Location services (for weather)
- Storage access

### iOS
- Location services (for weather)
- Network access

## Security Considerations

### Data Protection
- All API communications use HTTPS
- JWT tokens with short expiration
- Sensitive data encrypted at rest
- Regular security audits

### Access Control
- Role-based permissions
- Organization data isolation
- API rate limiting
- Input validation and sanitization

### Compliance
- GDPR compliant data handling
- Data retention policies
- User consent management
- Audit logging

## Building for Production

### Android APK
1. Build the web app: `npm run build:mobile`
2. Open Android Studio: `npm run cap:open:android`
3. Build → Generate Signed Bundle/APK

### iOS App Store
1. Build the web app: `npm run build:mobile`
2. Open Xcode: `npm run cap:open:ios`
3. Archive and upload to App Store Connect

## Deployment

### Web Application
1. Build: `npm run build`
2. Deploy to your hosting provider
3. Set up environment variables
4. Configure domain and SSL

### Database Setup
1. Set up Supabase project
2. Run database migrations
3. Configure authentication providers
4. Set up Row Level Security policies

### Payment Integration
1. Configure Stripe webhooks
2. Set up subscription products
3. Test payment flows
4. Monitor subscription events

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Add your Supabase and Stripe credentials
   ```

3. **Database Setup**:
   - Run the migration files in your Supabase dashboard:
     - `supabase/migrations/001_initial_auth_schema.sql`
     - `supabase/migrations/002_data_tables_with_rls.sql`
   - Configure authentication providers
   - Set up Stripe webhooks

4. **Test the System**:
   - Sign up creates organization automatically
   - Owners can invite team members
   - Subscription limits are enforced
   - Role-based permissions work correctly
   - All data is isolated per organization
   - Real-time sync with Supabase database

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check Supabase configuration and API keys
2. **Permission Denied**: Verify user roles and RLS policies
3. **Payment Issues**: Check Stripe configuration and webhook endpoints
4. **Sync Problems**: Verify network connectivity and Supabase status
1. **Build Errors**: Ensure all dependencies are installed and platforms are added
2. **Sync Issues**: Run `npm run cap:sync` after any web changes
3. **Android Studio Issues**: Make sure Android SDK is properly configured
4. **iOS Issues**: Ensure Xcode command line tools are installed

### Debug Mode

For authentication debugging:
```typescript
// Enable Supabase debug mode
const supabase = createClient(url, key, {
  auth: {
    debug: true
  }
});
```

Enable debug mode in `capacitor.config.ts`:
```typescript
server: {
  url: 'http://localhost:5173', // Your dev server
  cleartext: true
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

- 📧 Email: support@aquadatamanager.com
- 📚 Documentation: [docs.aquadatamanager.com](https://docs.aquadatamanager.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Community: [Discord Server](https://discord.gg/your-server)

## License

MIT License - see LICENSE file for details.