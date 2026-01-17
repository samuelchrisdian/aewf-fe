# AEWF - Frontend Documentation

> **Attendance Early Warning Framework** - Sistem Peringatan Dini Kehadiran berbasis Machine Learning

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#️-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Available Scripts](#-available-scripts)
- [API Integration](#-api-integration)
- [Components Documentation](#-components-documentation)
- [Routing](#️-routing)
- [State Management](#-state-management)
- [Styling](#-styling)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**AEWF (Attendance Early Warning Framework)** adalah sistem manajemen kehadiran yang dilengkapi dengan **prediksi risiko berbasis Machine Learning**. Frontend ini dibangun untuk Sekolah Kristen Pelita Kasih Lawang sebagai bagian dari proyek skripsi.

### Tujuan Utama
- **Monitoring Kehadiran Real-time**: Memantau kehadiran siswa secara harian
- **Early Warning System**: Mendeteksi siswa berisiko dropout melalui analisis pola kehadiran
- **Risk Prediction**: Menggunakan ML untuk memprediksi tingkat risiko siswa (Low, Medium, High, Critical)
- **Analytics & Reporting**: Menyediakan insight dan laporan komprehensif

### Target User
| Role | Deskripsi |
|------|-----------|
| **Admin** | Mengelola seluruh sistem, termasuk machines, classes, dan user management |
| **Teacher** | Memantau kehadiran siswa, melihat alerts, dan mengambil tindakan |

---

## 🛠️ Tech Stack

### Core Framework & Language
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI Library - menggunakan versi terbaru dengan fitur concurrent |
| **TypeScript** | 5.4.0 | Type-safe development |
| **Vite** | 7.2.4 | Build tool & dev server (super fast HMR) |

### UI & Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **Lucide React** | 0.556.0 | Modern SVG icon library |
| **PostCSS** | 8.5.6 | CSS processor |
| **Autoprefixer** | 10.4.22 | Auto vendor prefixes |

### State Management & Data Fetching
| Technology | Version | Purpose |
|------------|---------|---------|
| **TanStack React Query** | 5.0.0 | Server state management & caching |
| **React Context API** | Built-in | Auth state management |

### HTTP Client
| Technology | Version | Purpose |
|------------|---------|---------|
| **Axios** | 1.13.2 | HTTP client dengan interceptors |

### Data Visualization
| Technology | Version | Purpose |
|------------|---------|---------|
| **Chart.js** | 4.5.1 | Charting library |
| **React-Chartjs-2** | 5.3.1 | React wrapper untuk Chart.js |

### Table & Virtualization
| Technology | Version | Purpose |
|------------|---------|---------|
| **TanStack React Table** | 8.21.3 | Headless table dengan sorting & pagination |
| **TanStack React Virtual** | 3.13.13 | Virtual scrolling untuk large datasets |
| **React Window** | 2.2.3 | Efficient list rendering |

### Routing
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Router DOM** | 7.10.1 | Client-side routing |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.39.1 | Code linting |
| **@vitejs/plugin-react** | 5.1.1 | React plugin for Vite |

---

## ✨ Features

### Implemented Features ✅

#### 🔐 Authentication
- [x] Login with username/password
- [x] JWT Token-based authentication
- [x] Token refresh mechanism
- [x] Protected routes
- [x] Session persistence (localStorage)
- [x] Role-based access (Admin/Teacher)
- [x] Logout functionality
- [ ] Forgot Password *(Not implemented)*
- [ ] Register *(Not implemented - Admin only creates users)*

#### 📊 Dashboard Overview
- [x] Total Teachers count
- [x] Total Students count
- [x] Today's attendance percentage
- [x] High-risk students count
- [x] Risk distribution chart (Doughnut)
- [x] Recent alerts list
- [x] Quick navigation to detailed pages
- [x] **ML Model Status card** (status, last trained, metrics)
- [x] **High Risk Students list** (top 5 at-risk with scores)

#### 🚨 Alerts & Risk Management
- [x] View all risk alerts
- [x] Filter alerts by status (Open, In Progress, Resolved, Dismissed)
- [x] Filter by risk level (Low, Medium, High, Critical)
- [x] Alert actions (Acknowledge, Resolve, Dismiss)
- [x] Student detail view with risk history
- [x] ML-based risk explanation text
- [x] **Data Quality Warning badge** (for students with low recording completeness)
- [x] Feature Importance chart (factor weights visualization)

#### 👨‍🎓 Student Management
- [x] List all students with pagination
- [x] Search students by name/NIS
- [x] Filter by class
- [x] Create new student
- [x] Update student information
- [x] Delete student (soft delete)
- [x] View student details

#### 📅 Attendance Management
- [x] View daily attendance records
- [x] Filter by date/month with **Apply button**
- [x] Filter by class
- [x] Filter by status (Present, Absent, Late, Excused)
- [x] Manual attendance entry with modal
- [x] Update attendance records with modal
- [x] Attendance summary statistics
- [x] **Date range filtering** with start/end date
- [x] **Server-side pagination** for large datasets

#### 📈 Analytics
- [x] Attendance trends (Weekly/Monthly)
- [x] Class comparison charts
- [x] Student attendance patterns
- [x] Interactive data visualizations

#### 🏫 Class Management (Admin Only)
- [x] View all classes
- [x] Create new class
- [x] Update class information
- [x] Delete class
- [x] View class students

#### 🖥️ Machine Management (Admin Only)
- [x] View registered machines
- [x] Register new machine
- [x] Update machine status (Active/Inactive/Maintenance)
- [x] View machine users
- [x] Machine-Student mapping

#### 📥 Import System (Admin Only)
- [x] Multi-step import wizard UI
- [x] Import master data (Students, Classes, Teachers)
- [x] Sync machine users from fingerprint export
- [x] Import attendance logs
- [x] Import batch history and status tracking
- [x] File upload with validation
- [x] **Import preview endpoints** (preview data before committing)
- [x] Delete unmapped machine users

#### 🔗 Fuzzy Mapping System (Admin Only)
- [x] Mapping dashboard with statistics
- [x] View unmapped machine users
- [x] Auto-mapping with fuzzy name matching
- [x] Confidence score indicators (High/Medium/Low)
- [x] Verify/Reject individual mappings
- [x] Bulk verify multiple mappings
- [x] Manual mapping for unmatched users

#### 📊 Reports & Export System
- [x] Three report types: Attendance, Risk, Class Summary
- [x] Tabbed UI for report selection
- [x] Date range filters with class selection
- [x] Generate attendance summary reports
- [x] Generate risk analysis reports with student breakdown
- [x] Generate class summary with wali kelas information
- [x] Export students to Excel
- [x] Export attendance to Excel
- [x] Download master data template

#### 🤖 ML Model Management (v2)
- [x] View model status (Available/Not Trained)
- [x] View last trained timestamp
- [x] View model performance metrics (Recall, F1, AUC-ROC)
- [x] Trigger model retraining
- [x] Feature importance visualization
- [x] **Model version display** (v1, v2)
- [x] **Data quality indicators** (recording_completeness, longest_gap_days)
- [x] **Dynamic factor rendering** (supports new feature columns)

#### 🔔 Notifications System
- [x] Notification bell with unread badge in header
- [x] Notification dropdown for quick view
- [x] Full notifications page with list
- [x] Filter by status (All/Unread/Read)
- [x] Mark notifications as read
- [x] Delete notifications
- [x] Auto-refresh (polling every 60 seconds)
- [x] Sidebar navigation item

---

## 📁 Project Structure

```
src/
├── assets/                     # Static files (images, fonts)
│   └── react.svg
├── components/                 # Reusable UI components
│   ├── Card.tsx               # Stat card component
│   ├── DataTable.tsx          # Generic data table with pagination
│   ├── HeatmapChart.tsx       # Heatmap visualization
│   ├── Layout.tsx             # Main app layout with sidebar
│   └── RiskExplanationPanel.tsx # ML risk explanation display
├── features/                   # Feature-based modules
│   ├── alerts/                # Alert/Risk management
│   │   ├── AlertsPage.tsx     # Alerts list page
│   │   ├── StudentDetailPage.tsx  # Student risk detail
│   │   ├── components/
│   │   │   └── FeatureImportanceChart.tsx  # ML feature weights chart
│   │   ├── context/           # Alert-specific context
│   │   ├── models/            # TypeScript models
│   │   ├── queries/           # React Query hooks
│   │   └── index.tsx          # Feature exports
│   ├── analytics/             # Analytics & reporting
│   │   ├── AnalyticsPage.tsx
│   │   └── queries/
│   ├── attendance/            # Attendance management
│   │   ├── AttendancePage.tsx
│   │   └── queries/
│   ├── auth/                  # Authentication
│   │   ├── LoginPage.tsx      # Login form
│   │   ├── ProtectedRoute.tsx # Route guard
│   │   ├── api/               # Auth API calls
│   │   ├── context/           # AuthProvider
│   │   ├── hooks/             # useAuth hook
│   │   └── models/            # Auth types
│   ├── classes/               # Class management
│   │   ├── ClassesPage.tsx
│   │   └── queries/
│   ├── import/                # Import wizard (Admin only)
│   │   ├── ImportPage.tsx     # Multi-step import wizard
│   │   ├── components/
│   │   │   ├── ImportStepper.tsx
│   │   │   ├── ImportMasterStep.tsx
│   │   │   ├── ImportUsersStep.tsx
│   │   │   ├── ImportMappingStep.tsx
│   │   │   ├── ImportAttendanceStep.tsx
│   │   │   └── FileUploader.tsx
│   │   └── queries/
│   ├── machines/              # Machine management
│   │   ├── MachinesPage.tsx
│   │   └── queries/
│   ├── mapping/               # Fuzzy mapping system (Admin only)
│   │   ├── MappingPage.tsx    # Mapping dashboard
│   │   ├── components/
│   │   │   ├── MappingStats.tsx
│   │   │   ├── UnmappedUsersList.tsx
│   │   │   ├── MappingSuggestionCard.tsx
│   │   │   ├── BulkVerifyModal.tsx
│   │   │   ├── ManualMappingModal.tsx
│   │   │   └── ConfidenceScoreBadge.tsx
│   │   └── queries/
│   ├── reports/               # Reports & Export system
│   │   ├── ReportsPage.tsx    # Main reports page with tabs
│   │   ├── components/
│   │   │   ├── ReportFilters.tsx      # Date range & class filters
│   │   │   ├── ExportButton.tsx       # Download button component
│   │   │   ├── AttendanceReport.tsx   # Attendance report table
│   │   │   ├── RiskReport.tsx         # Risk students table
│   │   │   └── ClassSummaryReport.tsx # Class summary table
│   │   └── queries/
│   │       └── useReportQueries.ts    # React Query hooks
│   ├── overview/              # Dashboard
│   │   ├── OverviewPage.tsx
│   │   ├── components/
│   │   │   ├── ModelStatusCard.tsx      # ML model status display
│   │   │   └── HighRiskStudentsList.tsx # Top at-risk students
│   │   ├── context/
│   │   └── queries/
│   ├── ml/                    # ML Model Management
│   │   ├── queries/
│   │   │   └── useMLQueries.ts   # Model info, performance, retrain hooks
│   │   └── index.tsx
│   ├── notifications/         # Notifications System
│   │   ├── NotificationsPage.tsx  # Full notifications page
│   │   ├── components/
│   │   │   ├── NotificationDropdown.tsx  # Bell + dropdown
│   │   │   └── NotificationItem.tsx      # Single notification
│   │   ├── queries/
│   │   │   └── useNotificationQueries.ts # Notification hooks
│   │   └── index.tsx
│   └── students/              # Student management
│       ├── StudentsPage.tsx
│       └── queries/
├── lib/                       # Core utilities
│   ├── api-client.ts          # Axios instance & interceptors
│   ├── api-helpers.ts         # API response helpers
│   └── react-query.ts         # QueryClient configuration
├── services/                  # Legacy API services
│   └── api.ts                 # Mock data (dev mode)
├── types/                     # Global TypeScript types
│   └── api.ts                 # API request/response types
├── App.css                    # App-specific styles
├── App.tsx                    # Main app with routing
├── index.css                  # Global styles & Tailwind
└── main.tsx                   # App entry point
```

---

## 🚀 Installation

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | >= 18.x | LTS version recommended |
| **npm/yarn/pnpm** | Latest | Package manager |
| **Backend API** | Running | http://localhost:5000 (default) |

### Steps

```bash
# 1. Clone repository
git clone https://github.com/your-repo/aewf-frontend.git

# 2. Navigate to frontend directory
cd fe-react

# 3. Install dependencies
npm install
# or
yarn install
# or
pnpm install

# 4. Copy environment variables
cp .env.example .env

# 5. Configure environment variables
# Edit .env file with your configuration (see Configuration section)

# 6. Run development server
npm run dev
# or
yarn dev
# or
pnpm dev

# 7. Open browser
# Navigate to http://localhost:5173
```

---

## ⚙️ Configuration

### Environment Variables

Buat file `.env` di root folder dengan konfigurasi berikut:

```env
# API Configuration
# Base URL untuk backend API
# Kosongkan untuk menggunakan Vite proxy (recommended for development)
# Vite akan proxy /api/* requests ke http://localhost:5001
VITE_API_BASE_URL=http://localhost:5000

# Untuk production, set ke full URL:
# VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Vite Proxy Configuration

Untuk development, Vite sudah dikonfigurasi untuk proxy API requests:

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### Path Aliases

Project menggunakan path alias `@` untuk imports:

```javascript
// vite.config.js
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

**Usage:**
```typescript
import { apiClient } from '@/lib/api-client';
import type { Student } from '@/types/api';
```

---

## 📜 Available Scripts

```bash
# Development server (dengan HMR)
npm run dev          # Start pada http://localhost:5173

# Production build
npm run build        # Build ke folder /dist

# Preview production build
npm run preview      # Preview build hasil

# Linting
npm run lint         # Run ESLint

# Type checking
npm run type-check   # Check TypeScript types (tsc --noEmit)
```

---

## 🔌 API Integration

### API Client Configuration

```typescript
// src/lib/api-client.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Attempt token refresh
          // If refresh fails, redirect to login
        }
        return Promise.reject(error);
      }
    );
  }
}

export const apiClient = new ApiClient();
```

### API Endpoints Used

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | User logout |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/change-password` | Change password |

#### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Get dashboard statistics |

#### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/students` | List students (paginated) |
| POST | `/api/v1/students` | Create student |
| GET | `/api/v1/students/:nis` | Get student detail |
| PUT | `/api/v1/students/:nis` | Update student |
| DELETE | `/api/v1/students/:nis` | Delete student |

#### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/attendance/daily` | Get daily attendance |
| GET | `/api/v1/attendance/summary` | Get attendance summary |
| POST | `/api/v1/attendance` | Create manual attendance |
| PUT | `/api/v1/attendance/:id` | Update attendance |
| GET | `/api/v1/students/:nis/attendance` | Get student attendance |

#### Risk Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/risk/alerts` | Get risk alerts. Query: `?status=open\|in_progress\|resolved\|dismissed&level=low\|medium\|high\|critical` |
| GET | `/api/v1/risk/alerts/actioned` | Get actioned alerts history |
| GET | `/api/v1/risk/list` | Get all students with risk data. Query: `?level=high\|medium\|low&alert_status=none` |
| GET | `/api/v1/risk/students` | Get at-risk students |
| GET | `/api/v1/risk/students/:nis` | Get student risk detail with ML v2 data quality info |
| GET | `/api/v1/risk/students/:nis/history` | Get risk history |
| POST | `/api/v1/risk/alerts/:id/action` | Perform alert action |

#### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/trends` | Attendance trends. Query: `?period=weekly\|monthly&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` |
| GET | `/api/v1/analytics/class-comparison` | Class comparison. Query: `?period=YYYY-MM` |
| GET | `/api/v1/analytics/student-patterns/:nis` | Individual student attendance patterns (summary, trend, weekly patterns) |

#### Classes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/classes` | List classes |
| POST | `/api/v1/classes` | Create class |
| PUT | `/api/v1/classes/:id` | Update class |
| DELETE | `/api/v1/classes/:id` | Delete class |

#### Machines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/machines` | List machines |
| POST | `/api/v1/machines` | Register machine |
| PUT | `/api/v1/machines/:id` | Update machine |
| DELETE | `/api/v1/machines/:id` | Delete machine |
| GET | `/api/v1/machines/:id/users` | Get machine users |
| DELETE | `/api/v1/machines/users/:id` | Delete machine user |

#### Import System
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/import/master` | Import master data (Students, Classes, Teachers) |
| POST | `/api/v1/import/master/preview` | Preview master data import without committing |
| POST | `/api/v1/import/users-sync` | Sync machine users from fingerprint export |
| POST | `/api/v1/import/users-sync/preview` | Preview users sync without committing |
| POST | `/api/v1/import/attendance` | Import attendance logs |
| POST | `/api/v1/import/attendance/preview` | Preview attendance import without committing |
| GET | `/api/v1/import/batches` | List import batch history |
| GET | `/api/v1/import/batches/:id` | Get batch details |
| POST | `/api/v1/import/batches/:id/rollback` | Rollback batch |

#### Fuzzy Mapping
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/mapping/stats` | Get mapping statistics |
| GET | `/api/v1/mapping/unmapped` | List unmapped users with suggestions |
| POST | `/api/v1/mapping/process` | Run auto-mapping engine |
| POST | `/api/v1/mapping/verify` | Verify single mapping |
| POST | `/api/v1/mapping/bulk-verify` | Bulk verify/reject mappings |
| DELETE | `/api/v1/mapping/:id` | Delete a mapping |

#### Reports & Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/attendance` | Generate attendance report. Query: `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&class_id=XXX` |
| GET | `/api/v1/reports/risk` | Generate risk report. Returns students with risk levels |
| GET | `/api/v1/reports/class-summary` | Generate class summary. Query: `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` |
| GET | `/api/v1/export/students` | Export students to Excel. Query: `?class_id=XXX` |
| GET | `/api/v1/export/attendance` | Export attendance to Excel. Query: `?start_date&end_date&class_id` |
| GET | `/api/v1/export/template/master` | Download master data import template |

#### ML Model Management (v2)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/models/info` | Get model status, type, threshold, trained_at, **model_version** |
| GET | `/api/v1/models/performance` | Get model metrics (recall, f1, auc_roc, optimal_threshold) |
| POST | `/api/v1/models/retrain` | Trigger model retraining |

> **Note:** ML Model v2 includes additional features:
> - `recording_completeness`: Data quality indicator (0-1)
> - `longest_gap_days`: Maximum gap between attendance records
> - `data_quality.is_low_quality`: Flag for students with < 70% recording completeness

#### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | List notifications. Query: `?is_read=true\|false&page=1` |
| PUT | `/api/v1/notifications/:id/read` | Mark notification as read |
| DELETE | `/api/v1/notifications/:id` | Delete notification |
| GET | `/api/v1/notifications/settings` | Get user notification preferences |
| PUT | `/api/v1/notifications/settings` | Update notification preferences |


---

## 🧩 Components Documentation

### Core Components

#### Card Component

Komponen untuk menampilkan statistik dengan icon dan trend indicator.

```tsx
import Card from '@/components/Card';
import { Users } from 'lucide-react';

<Card
  title="Total Students"
  value={150}
  subtext="Active students"
  Icon={Users}
  colorClass="bg-blue-500"
  trend="up"
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | ✅ | Card title |
| `value` | `ReactNode` | ✅ | Main value to display |
| `subtext` | `string` | ❌ | Subtitle or additional info |
| `Icon` | `ComponentType` | ✅ | Lucide icon component |
| `colorClass` | `string` | ❌ | Background color class |
| `trend` | `'up' \| 'down'` | ❌ | Trend indicator |

---

#### DataTable Component

Generic table component dengan sorting dan pagination.

```tsx
import DataTable from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<Student>[] = [
  { accessorKey: 'nis', header: 'NIS' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'class_name', header: 'Class' },
];

<DataTable
  columns={columns}
  data={students}
  initialState={{ pagination: { pageSize: 10 } }}
  noDataMessage="No students found."
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `columns` | `ColumnDef<T>[]` | ✅ | Table column definitions |
| `data` | `T[]` | ✅ | Data array |
| `initialState` | `InitialTableState` | ❌ | Initial table state |
| `noDataMessage` | `string` | ❌ | Message when no data |

---

#### Layout Component

Main application layout dengan responsive sidebar.

```tsx
import Layout from '@/components/Layout';

// Digunakan sebagai wrapper di routing
<Route element={<Layout />}>
  <Route path="/" element={<OverviewPage />} />
</Route>
```

**Features:**
- Responsive sidebar (collapsible on mobile)
- User profile section
- Role-based navigation filtering
- Logout functionality

---

### Feature-Specific Patterns

#### Query Hook Pattern

Semua data fetching menggunakan React Query dengan pattern konsisten:

```typescript
// src/features/students/queries/useStudentsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const STUDENTS_QUERY_KEY = ['students'] as const;

export function useStudentsQuery(params?: StudentsListParams) {
  return useQuery({
    queryKey: [...STUDENTS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await apiClient.get<any>('/api/v1/students', { params });
      return {
        students: response.data || [],
        total: response.pagination?.total || 0,
        page: response.pagination?.page || 1,
        per_page: response.pagination?.per_page || 20,
        total_pages: response.pagination?.pages || 1,
      };
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
```

#### Mutation Hook Pattern

```typescript
// src/features/students/queries/useCreateStudent.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStudentRequest) => {
      return apiClient.post('/api/v1/students', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
    },
  });
}
```

---

## 🗺️ Routing

### Route Structure

```
/                    # Dashboard Overview
/login              # Login page (public)
/alerts             # Alerts list
/alerts/:nis        # Student risk detail
/students           # Student management
/attendance         # Attendance records
/analytics          # Analytics & charts
/classes            # Class management (Admin only)
/machines           # Machine management (Admin only)
/import             # Import wizard (Admin only)
/mapping            # Fuzzy mapping dashboard (Admin only)
/reports            # Reports & Export (All roles)
/notifications      # Notifications list (All roles)
```

### Route Configuration

```tsx
// src/App.tsx
<BrowserRouter>
  <AuthProvider>
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="alerts" element={<AlertsFeature />} />
        <Route path="alerts/:nis" element={<StudentDetailFeature />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="machines" element={<MachinesPage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="mapping" element={<MappingPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

### Protected Routes

```tsx
// src/features/auth/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### Role-Based Navigation

Menu navigasi difilter berdasarkan role user:

```tsx
const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Attendance', href: '/attendance', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Classes', href: '/classes', icon: BookOpen, adminOnly: true },
  { name: 'Machines', href: '/machines', icon: Server, adminOnly: true },
  { name: 'Import', href: '/import', icon: Upload, adminOnly: true },
  { name: 'Mapping', href: '/mapping', icon: Link2, adminOnly: true },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

// Filter navigation based on user role (case-insensitive)
const filteredNavigation = navigation.filter(item => {
  if (item.adminOnly) {
    return user?.role?.toLowerCase() === 'admin';
  }
  return true;
});
```

---

## 📊 State Management

### Authentication State

Menggunakan **React Context + useReducer** pattern:

```typescript
// State structure
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Actions
type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_SESSION'; payload: { user: User; token: string } };
```

### Server State (React Query)

Semua data dari API dimanage oleh **TanStack React Query**:

```typescript
// QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Local Storage

| Key | Description |
|-----|-------------|
| `access_token` | JWT access token |
| `refresh_token` | JWT refresh token |
| `user` | User object (JSON stringified) |

---

## 🎨 Styling

### Approach

Project menggunakan **Tailwind CSS** dengan konfigurasi custom:

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a56db",     // Vivid blue
        secondary: "#7e22ce",   // Purple
        danger: "#dc2626",      // Red for alerts
        warning: "#d97706",     // Amber for warnings
        success: "#16a34a",     // Green for success
      }
    },
  },
};
```

### Color System

| Color | Hex | Usage |
|-------|-----|-------|
| `primary` | `#1a56db` | Primary buttons, links, active states |
| `secondary` | `#7e22ce` | Secondary actions |
| `danger` | `#dc2626` | Error states, critical alerts |
| `warning` | `#d97706` | Warning states, medium risk |
| `success` | `#16a34a` | Success states, low risk |

### Risk Level Colors

```tsx
const riskColors = {
  low: 'bg-green-500',      // #16a34a
  medium: 'bg-yellow-500',  // #d97706
  high: 'bg-red-500',       // #dc2626
  critical: 'bg-red-800',   // #991b1b
};
```

### Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

---

## 🧪 Testing

### Current Testing Status

> ⚠️ **Note:** Unit tests and E2E tests belum diimplementasikan. Ini adalah area untuk pengembangan selanjutnya.

### Recommended Testing Stack

```javascript
// Future implementation
{
  "devDependencies": {
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "vitest": "^1.x",
    "playwright": "^1.x"  // For E2E
  }
}
```

### Manual Testing

Untuk testing manual, gunakan demo credentials yang tersedia di login page:

| Role | Username | Password |
|------|----------|----------|
| Teacher | `teacher1` | `password123` |
| Admin | `admin` | `admin123` |

---

## 🚢 Deployment

### Build for Production

```bash
# Build production bundle
npm run build

# Output folder: /dist
```

### Deployment Platforms

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Configuration

Untuk production, set environment variable:

```env
VITE_API_BASE_URL=https://api.your-domain.com
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. CORS Error

**Problem:** API requests blocked karena CORS.

**Solution:**
- Pastikan backend sudah mengkonfigurasi CORS dengan benar
- Gunakan Vite proxy untuk development:
  ```javascript
  // vite.config.js
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  }
  ```

#### 2. 401 Unauthorized setelah Refresh

**Problem:** Token expired dan refresh gagal.

**Solution:**
- Clear localStorage dan login ulang
- Pastikan refresh token masih valid

```javascript
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('user');
window.location.href = '/login';
```

#### 3. Blank Page setelah Build

**Problem:** Aplikasi blank setelah deploy.

**Solution:**
- Pastikan base path sudah benar di `vite.config.js`
- Check apakah server sudah dikonfigurasi untuk SPA routing
- Periksa console untuk error

#### 4. Mock Data masih Aktif

**Problem:** Data yang ditampilkan adalah mock data, bukan dari API.

**Solution:**
- Check `src/services/api.ts`, set `MOCK_MODE = false`
- Pastikan menggunakan query hooks bukan legacy API

---

## 🤝 Contributing

### Development Workflow

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Open Pull Request

### Code Style

- Gunakan TypeScript strict mode
- Follow ESLint rules
- Gunakan functional components dengan hooks
- Gunakan React Query untuk data fetching
- Struktur folder berbasis feature

### Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

---

## 📄 License

This project is part of a thesis project for Binus University.

---

## 📞 Contact

**Developer:** Samuel Christian  
**Project:** AEWF (Attendance Early Warning Framework)  
**Institution:** Sekolah Kristen Pelita Kasih Lawang

---

## 📚 Related Links

- **Backend Repository:** [AEWF Backend](../be-flask)
- **API Documentation:** See backend README.md
- **ML Model Documentation:** See backend ML_FLOW_GUIDE.md

---

> **Note:** This frontend is part of AEWF (Attendance Early Warning Framework) project, integrating with Flask backend and Machine Learning-based risk prediction system.
