# AutoServe - Multi-Role E-Commerce & Service Marketplace

A comprehensive full-stack web application that connects customers, vendors, and mechanics in an intelligent auto service ecosystem.

## Features

### For Customers
- **Browse & Purchase Parts**: Search and filter from thousands of auto parts
- **Request Service**: Submit vehicle repair requests with location
- **Smart Mechanic Matching**: Automatically assigns nearest available mechanic
- **Service Tracking**: Real-time updates on service status
- **Parts Recommendations**: View mechanic-recommended parts from nearby vendors
- **Order Management**: Track orders from purchase to delivery
- **Secure Payments**: Stripe integration for safe transactions

### For Vendors
- **Inventory Management**: Add, edit, and delete products
- **Dashboard Analytics**: Track sales, revenue, and popular products
- **Order Fulfillment**: Manage incoming orders
- **Stock Tracking**: Monitor inventory levels with low-stock alerts
- **Location-Based Visibility**: Get matched with nearby customers

### For Mechanics
- **Service Queue**: View and manage assigned service requests
- **Portfolio Management**: Showcase skills, experience, and certifications
- **Parts Recommendation**: Browse vendor inventory and recommend parts
- **Availability Toggle**: Control when you receive new assignments
- **Earnings Tracking**: Monitor completed services and payments
- **Service Radius**: Define your coverage area

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **React Router v7** for routing
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Query** for server state
- **React Hook Form + Zod** for form validation
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend & Database
- **Supabase** (PostgreSQL) for database
- **Row Level Security (RLS)** for data protection
- **Supabase Storage** for image uploads
- **Supabase Auth** for authentication
- **Database Functions** for business logic

### Payment Processing
- **Stripe** for secure payment processing
- **Stripe Connect** ready for marketplace payments

## Database Schema

### Core Tables
- `users` - User accounts with role-based access
- `vendors` - Vendor profiles and shop information
- `mechanics` - Mechanic profiles with service areas
- `products` - Product catalog with inventory
- `product_categories` - Hierarchical category system
- `orders` & `order_items` - Order management
- `service_requests` - Customer service requests
- `service_parts` - Mechanic-recommended parts
- `cart` & `wishlist` - Shopping features
- `reviews` - Product and mechanic ratings
- `notifications` - Real-time notifications
- `payments` - Payment transaction records

### Smart Features
- **Automatic Mechanic Assignment**: Uses Haversine formula to calculate distance and assigns nearest available mechanic
- **Vendor Proximity Ranking**: Sorts vendors by distance and stock availability
- **Real-time Notifications**: Triggers on key events (service assigned, parts recommended, order updates)
- **Automatic Rating Updates**: Aggregates reviews to update product/mechanic ratings

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (database is pre-configured)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables are pre-configured**
   - `VITE_SUPABASE_URL` - Already set
   - `VITE_SUPABASE_ANON_KEY` - Already set

3. **Database is ready**
   - All tables and functions are already created
   - RLS policies are configured
   - Storage buckets are set up

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Application Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components (Navbar, Footer)
│   └── shared/          # Shared feature components
├── contexts/            # React contexts (Auth)
├── hooks/               # Custom React hooks
├── lib/                 # Third-party integrations (Supabase)
├── pages/
│   ├── auth/            # Login, Register
│   ├── customer/        # Customer pages
│   ├── vendor/          # Vendor pages
│   ├── mechanic/        # Mechanic pages
│   └── public/          # Public pages
├── services/            # API service layer
├── stores/              # Zustand stores
├── types/               # TypeScript types
└── utils/               # Utility functions
```

## User Roles

### Customer
- Browse and purchase products
- Request vehicle services
- Track orders and service requests
- Rate products and mechanics

### Vendor
- Manage product inventory
- Fulfill orders
- Track sales and revenue
- Get matched with nearby customers

### Mechanic
- Receive service requests automatically
- Inspect vehicles and recommend parts
- Complete repairs and services
- Manage availability and service area

## Key Features Implementation

### Authentication
- Email/password authentication via Supabase Auth
- Role-based registration (Customer, Vendor, Mechanic)
- Protected routes based on user role
- Session management with automatic refresh

### Product Catalog
- Category filtering
- Search functionality
- Stock management
- Vendor information
- Ratings and reviews

### Service Request Flow
1. Customer submits request with location
2. System calculates distances to all available mechanics
3. Nearest mechanic within service radius is auto-assigned
4. Mechanic inspects and recommends parts
5. Customer views recommended parts from nearby vendors
6. Customer can add parts to cart and checkout
7. Mechanic completes service

### Smart Matching Algorithm
- Haversine formula for accurate distance calculation
- Considers mechanic availability and service radius
- Real-time notification system
- Automatic status updates

## Security

### Database Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Role-based access control
- Secure password hashing

### Data Protection
- Input validation on frontend and backend
- SQL injection prevention via parameterized queries
- XSS protection
- CSRF protection via Supabase

## Performance Optimizations

- Code splitting and lazy loading
- Image optimization
- Database indexes on frequently queried columns
- Caching with React Query
- Optimistic UI updates

## Future Enhancements

- [ ] Google Maps integration for location services
- [ ] Stripe Connect for split payments
- [ ] Real-time chat between users
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Composition over inheritance
- Single Responsibility Principle
- Clean, readable code with proper naming

## Contributing

This is a demonstration project showcasing enterprise-grade e-commerce and service marketplace architecture.

## License

MIT License - This is a demonstration project.

---

Built with ❤️ using React, TypeScript, and Supabase
