# Data Dashboard

A comprehensive, interactive data dashboard built with Next.js, React, and modern visualization libraries. Features interactive maps, real-time analytics, and detailed location-based insights.

## Features

### 🗺️ Interactive Maps
- **Leaflet Integration**: Interactive map with marker-based location visualization
- **Location Markers**: Click markers to see detailed location information
- **Geographic Distribution**: View all your data points on a world map

### 📊 Advanced Analytics
- **Line Charts**: Track revenue trends over time
- **Area Charts**: Visualize revenue growth patterns
- **Bar Charts**: Compare performance by region
- **Pie Charts**: View market share distribution

### 📈 Dashboard Tabs
1. **Overview**: Summary statistics and key performance indicators
2. **Maps**: Geographic visualization of all locations
3. **Analytics**: Detailed regional performance analysis
4. **Table**: Complete location details in table format

### 🔐 Admin Panel
- **Data Management**: Add, edit, and delete polling stations, assemblies, GI data, and survey data
- **Real-time Updates**: Changes reflect immediately in the public dashboard
- **Secure Login**: Protected admin access with email/password authentication

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Maps**: Leaflet & React-Leaflet
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth (for admin)
- **Icons**: Lucide React
- **Language**: TypeScript

## Setup

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable Firestore Database and Authentication.
3. In Authentication, enable Email/Password sign-in.
4. Create a service account key:
   - Go to Project Settings > Service Accounts > Generate new private key.
   - Download the JSON file and keep it secure.
5. Copy the values from the JSON file and your project config to `.env.local`.

### 2. Environment Variables

Create `.env.local` in the root directory:

```env
# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securepassword
ADMIN_PASSWORD_HASH=$2a$10$example.hash.here  # Generate with bcrypt
```

### 3. Installation

```bash
npm install
```

### 4. Seed Database

**Important**: Before running the seed script, ensure your `.env.local` has valid Firebase credentials from your Firebase project.

Run the seeding script to populate Firestore with initial data:

```bash
npm run seed
```

If you encounter errors, double-check your Firebase service account key and project settings.

### 5. Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

### 6. Admin Access

- Go to `/admin` to log in as admin.
- Use the credentials from `.env.local`.
- Access the dashboard at `/admin/dashboard` to manage data.

## Deployment

Deploy to Vercel or your preferred platform. Ensure environment variables are set in your deployment environment.

For static export (GitHub Pages):

```bash
npm run export
```

## Admin Features

- **Polling Stations**: View, add, edit polling station data including location and election results.
- **Assemblies**: Manage assembly information.
- **GI Data**: Update constituency general information and history.
- **Survey Data**: Modify survey results and demographics.

Changes made in the admin panel will immediately update the public dashboard.

The page will auto-update as you make changes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
