# Election Dashboard - Puducherry

A comprehensive **Next.js-based election analytics dashboard** featuring Puducherry constituency data with interactive maps, vote share visualizations, locality-wise analysis, and survey data.

## 🎯 Features

- **Multi-Assembly Support**: Select from 30 Puducherry assemblies across 5 districts
- **Interactive Maps**: Leaflet-based polling station maps with 2021 election results
- **Vote Share Analysis**: Historical data across 3 election years (2011, 2016, 2021)
- **Candidate Comparison**: Multi-year performance tracking for all candidates
- **Locality-Wise Analysis**: Performance breakdown by geographic locality
- **Polling Location Filter**: Filter stations by locality and station name
- **Survey Reports**: Comprehensive demographic analysis (gender, caste, age groups)
- **Geographic Information**: Assembly history, geography, and economy data
- **File Upload**: Upload and process election data files
- **JCM Branding**: Integrated with JCM logo and styling

## 📦 Tech Stack

- **Framework**: Next.js 16.0.7 with TypeScript
- **Frontend**: React 19+, Tailwind CSS, Lucide Icons
- **Charting**: Recharts (Line, Area, Bar, Pie charts)
- **Maps**: Leaflet 1.9.4 + React-Leaflet
- **Build**: Turbopack (ultra-fast development builds)

## 🚀 Deployment

### GitHub Pages Deployment

#### Step 1: Initialize Git Repository
```powershell
cd dashboard
git init
git add .
git commit -m "Initial commit: Election Dashboard"
```

#### Step 2: Create GitHub Repository
1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `datadash`
3. Copy the repository URL

#### Step 3: Push to GitHub
```powershell
git remote add origin https://github.com/YOUR_USERNAME/datadash.git
git branch -M main
git push -u origin main
```

#### Step 4: Enable GitHub Pages
1. Go to repository Settings → Pages
2. Set "Source" to "GitHub Actions"
3. The workflow will auto-deploy on every push to `main`

#### Step 5: Access Your Dashboard
Your dashboard will be available at:
```
https://YOUR_USERNAME.github.io/datadash/
```

### Alternative: Vercel Deployment

1. Sign up at [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Vercel auto-detects Next.js and deploys
4. Your site will be live at `your-project.vercel.app`

## 🏗️ Build & Run Locally

### Development
```powershell
npm install
npm run dev
# Open http://localhost:3000
```

### Production Build
```powershell
npm run build
npm start
```

### Static Export
```powershell
npm run build
# Output in /out directory
```

## 📊 Dashboard Structure

### Tabs Overview

1. **Overview**: Summary statistics, candidate performance, vote share trends
2. **Maps**: Interactive polling station map with filtering
3. **Candidates**: Multi-year candidate comparison and trend analysis
4. **Locality**: Locality-wise performance breakdown and analysis
5. **Table**: Detailed polling station data table
6. **GI Dashboard**: Geographic and assembly information
7. **Survey**: Demographic survey analysis and reports
8. **Upload**: Upload election data files

## 🗺️ Assembly Coverage

### Karaikal District (6)
- Karaikal, Tirunallar, Nannilam, Nedungadu, Villupuram, Ranipet

### Puducherry District (12)
- Pondicherry South, Pondicherry North, Villianur, Bahour, Auroville, Oulgaret, Kalapet, Sedarapet, Nettapakkam, Ariankuppam, Evur, Thattanchavadi

### Yanam District (3)
- Yanam, Padibidri, Maruteru

### Mahe District (6)
- Mahe, Chenkalari, Kannur, Kozhikode, Kodungalloor, Peravoor

### Union Territory Region (3)
- Kurumbapettai, Tiruvallore, Chengalpattu

## 📈 Data Structure

### Polling Stations (34 Total)
- Location coordinates (latitude/longitude)
- Candidate election results (2011, 2016, 2021)
- Voter turnout percentages

### Survey Data
- Gender distribution (F/M/Transgender)
- Age groups (18-25, 25-50, 50-65, 65+)
- Caste categories
- Response types (High Impact, Low Impact, No Opinion)

### Election Candidates
1. **AINRC** - All India N.R. Congress
2. **INC** - Indian National Congress
3. **VIGESWARAN** - Independent Candidate
4. **Others** - Combined other candidates

## 🛠️ Configuration Files

### `next.config.ts`
Configured for static export with GitHub Pages:
- `output: 'export'` - Static site generation
- `basePath: '/datadash'` - Subdirectory deployment
- `assetPrefix: '/datadash/'` - Asset CDN path

### `.github/workflows/deploy.yml`
Auto-deployment workflow:
- Triggers on push to `main` branch
- Builds and exports static site
- Deploys to GitHub Pages

## 📝 Environment Variables

No environment variables required for basic functionality. 

Optional for analytics:
```env
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 🔧 Troubleshooting

### Build Errors
```powershell
# Clear cache and reinstall
rm -r .next node_modules
npm install
npm run build
```

### Port Already in Use
```powershell
# Run on different port
npm run dev -- -p 3001
```

### GitHub Pages Not Showing
1. Check repository settings → Pages
2. Verify branch is set to `main`
3. Wait 1-2 minutes for deployment
4. Check Actions tab for build status

## 📱 Mobile Responsive

Dashboard is fully responsive and works on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 👥 Team & Contributors

**Project**: Puducherry Election Analytics Dashboard
**Built with**: Next.js, React, TypeScript, Tailwind CSS

## 📄 License

This project is open source and available for educational and governmental use.

---

**Last Updated**: 2024
**Version**: 1.0.0
