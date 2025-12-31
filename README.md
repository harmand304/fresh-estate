# Mood Real Estate

A modern real estate property listing application built with React and PostgreSQL.

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Tailwind CSS** | Utility-first CSS styling |
| **Shadcn/UI** | Pre-built UI components |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web server framework |
| **Prisma ORM** | Type-safe database client |
| **CORS** | Cross-origin resource sharing |

### Database
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Relational database |
| **pgAdmin 4** | Database management GUI |
| **Prisma Studio** | Visual database browser |

---

## 📁 Project Structure

```
mood-real-estate-ui-main/
├── public/
│   └── images/              # Property images
├── prisma/
│   └── schema.prisma        # Prisma database schema
├── server/
│   └── index.js             # Express API server (Prisma)
├── database/
│   ├── schema.sql           # SQL table definitions
│   ├── seed_data.sql        # Initial data
│   └── update_images.sql    # Image path updates
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PropertyCard.tsx
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Home page
│   │   ├── Properties.tsx   # Property listings
│   │   ├── PropertyDetails.tsx
│   │   ├── About.tsx
│   │   └── Contact.tsx
│   ├── hooks/
│   │   └── useProperties.ts # Data fetching hook
│   └── main.tsx             # App entry point
├── .env                     # Database connection URL
└── package.json
```

---

## 🗄️ Database Schema (Prisma)

### Models

```prisma
model City {
  id        Int        @id
  name      String     @unique
  locations Location[]
  agents    Agent[]
}

model Location {
  id         Int        @id
  name       String
  cityId     Int
  properties Property[]
}

model Agent {
  id         Int        @id
  name       String
  phone      String?
  properties Property[]
}

model PropertyType {
  id         Int        @id
  name       String     @unique
  properties Property[]
}

model Property {
  id             UUID     @id
  title          String
  price          Decimal
  purpose        String   // "SALE" | "RENT"
  bedrooms       Int
  bathrooms      Int
  areaSqm        Int
  imageUrl       String?
  location       Location?
  agent          Agent?
  propertyType   PropertyType?
}
```

### Cities
- Erbil
- Sulaymaniyah

### Property Types
- Apartment, House, Villa, Office, Commercial, Land, Plot

---

## 🚀 How to Run

### Prerequisites
- Node.js v18+
- PostgreSQL installed
- pgAdmin 4

### 1. Database Setup
```bash
# In pgAdmin 4:
# 1. Create database: mood_real_estate
# 2. Run: database/schema.sql
# 3. Run: database/seed_data.sql
```

### 2. Environment Setup
```bash
# Create .env file with your database URL:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mood_real_estate"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Start Backend Server
```bash
npm run server
# Runs on http://localhost:3001
```

### 5. Start Frontend
```bash
npm run dev
# Runs on http://localhost:8080
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | Get all properties |
| GET | `/api/properties/:id` | Get single property |
| GET | `/api/cities` | Get all cities |
| GET | `/api/locations` | Get all locations |

---

## 📱 Features

- ✅ Property listings with filters (city, purpose, type, bedrooms, price, area)
- ✅ Property detail pages
- ✅ Responsive design (mobile & desktop)
- ✅ Animated splash screen
- ✅ Agent contact information
- ✅ Pagination
- ✅ Local image storage

---

## �️ Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (visual database browser)
npx prisma studio

# View database schema
npx prisma db pull

# Apply schema changes
npx prisma db push
```

---

## 📦 Dependencies

### Frontend (package.json)
- react, react-dom, react-router-dom
- @radix-ui components (shadcn/ui)
- tailwindcss, postcss, autoprefixer
- lucide-react, sonner

### Backend
- express
- @prisma/client
- prisma (dev)
- cors

---

## 👤 Author

Mood Real Estate Team
