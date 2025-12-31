# Mood Real Estate - UI/UX Documentation

## 📋 Project Overview

**Project Name:** Mood Real Estate  
**Type:** Full-Stack Real Estate Web Application  
**Purpose:** A modern property listing platform for the Kurdistan Region, Iraq (Erbil & Sulaymaniyah)  
**Target Users:** Property buyers, renters, real estate agents, and administrators

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | Core UI library for building component-based interfaces |
| **TypeScript** | Type-safe JavaScript for better code quality and maintainability |
| **Vite** | Fast build tool and development server |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development |
| **Shadcn/UI** | Pre-built accessible React components (Button, Select, Input, etc.) |
| **Lucide React** | Modern icon library with 1000+ SVG icons |
| **React Router DOM** | Client-side routing for single-page application navigation |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | Server-side JavaScript runtime and web framework |
| **Prisma ORM** | Database abstraction layer with type-safe queries |
| **MySQL** | Relational database for storing properties, users, agents |
| **Backblaze B2** | Cloud storage for property and agent images |
| **JWT + bcrypt** | Authentication with secure password hashing |

---

## 🎨 Design System

### Color Palette

| Color Variable | HSL Value | RGB Equivalent | Usage |
|----------------|-----------|----------------|-------|
| `--primary` | 140 79% 44% | RGB(23, 199, 81) | Primary buttons, links, active states |
| `--primary-foreground` | 0 0% 100% | White | Text on primary backgrounds |
| `--background` | 40 20% 98% | Warm off-white | Page backgrounds |
| `--foreground` | 220 20% 15% | Dark navy | Primary text color |
| `--secondary` | 40 30% 94% | Warm beige | Secondary backgrounds |
| `--muted` | 40 15% 92% | Light gray | Muted elements |
| `--accent` | 160 30% 94% | Light sage | Accent backgrounds |
| `--destructive` | 0 84% 60% | Red | Error states, delete buttons |

### Typography

| Font Family | Usage |
|-------------|-------|
| **DM Sans** | Body text, UI elements (400, 500, 600, 700 weights) |
| **Playfair Display** | Headings, display text (400, 600, 700 weights) |

### Spacing & Sizing

- **Border Radius:** `0.75rem` (12px) - rounded corners for cards and buttons
- **Container:** Maximum width with responsive padding
- **Grid System:** 12-column responsive grid using Tailwind

### Shadow System

| Shadow | Value | Usage |
|--------|-------|-------|
| `--shadow-soft` | Subtle 2px blur | Default card shadows |
| `--shadow-medium` | 4px blur | Elevated elements |
| `--shadow-large` | 8px blur | Modals, dropdowns |
| `--shadow-hover` | 12px blur | Hover states |

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Target Device |
|------------|-------|---------------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## 🏗 Application Architecture

### Page Structure

```
src/
├── pages/
│   ├── Index.tsx              # Home page
│   ├── Properties.tsx         # Property listings with filters
│   ├── PropertyDetails.tsx    # Single property view
│   ├── Agents.tsx             # Agent directory
│   ├── AgentProfile.tsx       # Individual agent page
│   ├── About.tsx              # About company page
│   ├── Contact.tsx            # Contact form page
│   ├── Login.tsx              # User authentication
│   ├── Register.tsx           # User registration
│   ├── Profile.tsx            # User profile page
│   ├── admin/                 # Admin dashboard pages
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminProperties.tsx
│   │   ├── AdminAgents.tsx
│   │   ├── AdminLocations.tsx
│   │   └── AdminCities.tsx
│   └── agent/                 # Agent dashboard pages
│       ├── AgentDashboard.tsx
│       ├── AgentProperties.tsx
│       └── AgentDeals.tsx
└── components/
    ├── Navbar.tsx             # Main navigation
    ├── Hero.tsx               # Homepage hero with search
    ├── PropertyCard.tsx       # Property listing card
    ├── PropertyCarousel.tsx   # Featured properties slider
    ├── PropertyGrid.tsx       # Grid of property cards
    ├── Services.tsx           # Services section
    ├── Footer.tsx             # Site footer
    └── ui/                    # Shadcn UI components
```

---

## 📄 Page Descriptions

### 1. Home Page (`Index.tsx`)

**Purpose:** Landing page that introduces the platform and helps users start their property search.

**UI Components:**
- **Navbar** - Fixed navigation with links to all pages
- **Hero Section** - Full-screen background image with:
  - Location badge (Kurdistan Region, Iraq)
  - Main heading: "Find Your Perfect Home in Kurdistan"
  - Search box with Sell/Rent tabs and location input
  - Statistics (500+ properties, 2 cities, 98% happy clients)
- **Property Carousel** - Horizontal scrolling featured properties
- **Property Grid** - 6 property cards in a responsive grid
- **Services Section** - 4 service cards explaining company offerings
- **Footer** - Contact info, quick links, social media

**User Interactions:**
- Search by location and purpose (Sell/Rent)
- Click property cards to view details
- Navigate to other sections via navbar

---

### 2. Properties Page (`Properties.tsx`)

**Purpose:** Browse and filter all available property listings.

**UI Components:**
- **Breadcrumb** - Navigation path indicator
- **Filter Sidebar** (sticky on desktop):
  - City dropdown (All, Erbil, Sulaymaniyah)
  - Purpose dropdown (Rent, Sale)
  - Property Type dropdown (Apartment, House, Villa, etc.)
  - Bedrooms selector
  - Bathrooms selector
  - Price range inputs (min/max)
  - Area range inputs (min/max)
  - "Find Result" button
- **Property Grid** - Responsive grid of property cards
- **Pagination** - Page numbers with prev/next buttons
- **Empty State** - Message when no properties match filters

**User Interactions:**
- Apply filters to narrow results
- Click cards to view property details
- Navigate between pages

---

### 3. Property Details Page (`PropertyDetails.tsx`)

**Purpose:** Detailed view of a single property with all information.

**UI Components:**
- **Breadcrumb** - Navigation back to listings
- **Image Gallery** - Large property image
- **Property Header:**
  - Title and project name
  - Location with city and area
  - Price badge (with /month for rentals)
  - Purpose badge (FOR RENT / FOR SALE)
- **Property Features Grid:**
  - Bedrooms count
  - Bathrooms count
  - Square meters
  - Rooms count
  - Garage indicator
  - Balcony indicator
- **Agent Contact Card:**
  - Agent photo
  - Agent name and phone
  - Contact button
- **Related Properties** - Similar listings carousel

**User Interactions:**
- View property images
- Contact agent via phone
- Browse related properties

---

### 4. Agents Page (`Agents.tsx`)

**Purpose:** Directory of all real estate agents.

**UI Components:**
- **Page Header** - Title and description
- **Agent Cards Grid:**
  - Agent photo (circular)
  - Name and title
  - City location
  - Experience years
  - Rating with stars
  - Property count
  - Contact buttons (phone, email)
  - "View Profile" button

**User Interactions:**
- Browse agent list
- Click to view full agent profile
- Direct contact via phone/email

---

### 5. Agent Profile Page (`AgentProfile.tsx`)

**Purpose:** Detailed agent information with their property listings.

**UI Components:**
- **Agent Header:**
  - Large profile photo
  - Name, title, city
  - Experience and rating
  - Specialties badges
  - Contact information
- **Bio Section** - Agent description
- **Agent's Properties** - Grid of their listings
- **Reviews Section:**
  - Review cards with ratings
  - Review submission form

**User Interactions:**
- View agent's full profile
- Browse their property listings
- Submit reviews

---

### 6. About Page (`About.tsx`)

**Purpose:** Company information and mission statement.

**UI Components:**
- **Hero Banner** - Company tagline
- **Mission Section** - Company values
- **Team Section** - Team member cards
- **Statistics** - Company achievements

---

### 7. Contact Page (`Contact.tsx`)

**Purpose:** Allow users to get in touch with the company.

**UI Components:**
- **Contact Form:**
  - Name input
  - Email input
  - Phone input
  - Subject dropdown
  - Message textarea
  - Submit button
- **Contact Information:**
  - Office addresses (Erbil, Sulaymaniyah)
  - Phone numbers
  - Email addresses
  - Working hours
- **Map** - Office location

---

### 8. Login Page (`Login.tsx`)

**Purpose:** User authentication.

**UI Components:**
- **Login Form:**
  - Email input
  - Password input
  - Remember me checkbox
  - Login button
  - Register link
- **Social Login** - Optional third-party auth

---

### 9. Register Page (`Register.tsx`)

**Purpose:** New user account creation.

**UI Components:**
- **Registration Form:**
  - Full name input
  - Email input
  - Password input
  - Confirm password input
  - Terms acceptance checkbox
  - Register button
  - Login link

---

### 10. Admin Dashboard (`admin/AdminDashboard.tsx`)

**Purpose:** Administrative control panel for managing the platform.

**UI Components:**
- **Statistics Cards:**
  - Total properties count
  - Total agents count
  - Total cities count
  - Total locations count
- **Quick Actions** - Links to management sections
- **Recent Activity** - Latest listings

**Sub-pages:**
- **AdminProperties** - CRUD for properties
- **AdminAgents** - CRUD for agents
- **AdminLocations** - CRUD for areas/neighborhoods
- **AdminCities** - CRUD for cities

---

### 11. Agent Dashboard (`agent/AgentDashboard.tsx`)

**Purpose:** Dashboard for registered agents to manage their listings.

**UI Components:**
- **Overview Statistics:**
  - My properties count
  - Active deals count
  - Pending deals
- **Property Management Table**
- **Deal Tracking** - Who rented/bought properties

---

## 🧩 Reusable Components

### Navbar (`Navbar.tsx`)

**Features:**
- Fixed position at top
- Logo on left
- Navigation links in center (with icons)
- Auth buttons on right
- Mobile hamburger menu
- Active state indicators
- Dropdown for admin/user profile

### PropertyCard (`PropertyCard.tsx`)

**Features:**
- Property image with lazy loading
- Purpose badge (FOR RENT / FOR SALE)
- Price display (with /month for rentals)
- Project name tag
- Title
- Location (area, city)
- Features row (sqm, beds, baths)
- "View Details" button
- Hover effects with shadow

### Footer (`Footer.tsx`)

**Sections:**
- Company info with logo
- Quick links (Properties, Agents, About, Contact)
- Contact information
- Social media icons (Facebook, Instagram, Twitter)
- Copyright notice

### Hero (`Hero.tsx`)

**Features:**
- Full-screen background image
- Dark overlay gradient
- Centered content
- Search box with tabs (Sell/Rent)
- Location search input
- Statistics section

---

## 🎭 UI States

### Loading States
- **PropertyCardSkeleton** - Placeholder while properties load
- **PropertyDetailsSkeleton** - Placeholder for detail page
- **SplashScreen** - Initial app loading screen

### Empty States
- "No properties found" message with illustration
- Filter suggestions

### Error States
- Form validation errors (red text, border highlight)
- 404 Not Found page
- Network error messages

### Interactive States
- Hover effects on cards and buttons
- Active/selected filter indicators
- Focus rings for accessibility
- Loading spinners on buttons

---

## 🔐 Authentication Flow

1. **Guest User:**
   - Can browse all properties
   - Can view agent profiles
   - Cannot access admin/agent dashboards

2. **Registered User:**
   - All guest capabilities
   - Can save favorite properties
   - Can submit agent reviews

3. **Agent Role:**
   - Can access agent dashboard
   - Can manage own property listings
   - Can track deals

4. **Admin Role:**
   - Full access to admin dashboard
   - Can manage all properties, agents, cities, locations

---

## 📊 User Flow Diagrams

### Property Search Flow
```
Home Page → Enter location → Select Sell/Rent → Click Search
    ↓
Properties Page → Apply filters → Browse results
    ↓
Property Details → View info → Contact Agent
```

### Agent Discovery Flow
```
Home/Properties → Click Agent link → Agents Page
    ↓
Browse agents → Click "View Profile"
    ↓
Agent Profile → View listings → Contact or Review
```

---

## 🌐 Internationalization Ready

- All text content stored in components (can be extracted to i18n files)
- RTL-ready layout using Tailwind (for Arabic/Kurdish support)
- Currency formatting (USD with proper symbols)

---

## ♿ Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance
- Focus indicators
- Alt text for images
- Screen reader compatible

---

## 📈 Performance Optimizations

- **Lazy Loading:** Images load on scroll
- **Code Splitting:** Routes loaded on demand
- **Skeleton Screens:** Better perceived loading
- **Optimized Images:** Signed URLs from Backblaze
- **Minimal CSS:** Tailwind purges unused styles

---

## 🎯 Key UI/UX Decisions

1. **Simplified Hero Search:** Clean Sell/Rent tabs with location search (inspired by FreshEstates)

2. **Sticky Filters:** Sidebar filters stay visible while scrolling on desktop

3. **Card-based Design:** Consistent card layout for properties and agents

4. **Mobile-First:** All layouts responsive down to 320px

5. **Green Primary Color:** RGB(23, 199, 81) - Fresh, trustworthy, nature-associated

6. **Warm Backgrounds:** Beige tones create welcoming atmosphere

7. **Prominent CTAs:** Green buttons stand out against neutral backgrounds

---

## 📁 File Organization

```
src/
├── assets/           # Static images
├── components/       # Reusable UI components
│   └── ui/          # Shadcn UI primitives
├── hooks/           # Custom React hooks
│   ├── useProperties.ts
│   ├── useAgents.ts
│   └── useAuth.ts
├── lib/             # Utility functions
├── pages/           # Route components
│   ├── admin/       # Admin pages
│   └── agent/       # Agent pages
├── App.tsx          # Root component with routes
├── main.tsx         # Entry point
└── index.css        # Global styles + Tailwind
```

---

## 🔧 Environment Configuration

```env
# Backend API
VITE_API_URL=http://localhost:3001

# Database
DATABASE_URL=mysql://user:pass@localhost:3306/mood_db

# Backblaze B2 Storage
B2_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_app_key
B2_BUCKET_NAME=your_bucket
B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
B2_REGION=us-east-005

# JWT Secret
JWT_SECRET=your_secret_key
```

---

## 📝 Summary

The Mood Real Estate UI is a modern, responsive web application built with React, TypeScript, and Tailwind CSS. It features:

- **Clean, professional design** with warm colors and modern typography
- **Intuitive navigation** with clear user flows
- **Comprehensive property search** with multiple filter options
- **Agent discovery and contact** system
- **Admin and Agent dashboards** for content management
- **Secure authentication** with role-based access
- **Mobile-responsive** layouts for all screen sizes
- **Accessible** design following WCAG guidelines

The application serves as a complete real estate platform for the Kurdistan region, connecting property seekers with agents and providing administrators full control over the platform content.
