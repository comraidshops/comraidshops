================================================================================
COMRAIDSHOPS | TECHNICAL DOCUMENTATION & ARCHITECTURE REFERENCE
================================================================================

For Creative, Design, and Lexicon guidelines, refer to: branding.txt

1. PROJECT SUMMARY
------------------
ComraidShops is a decoupled headless e-commerce ecosystem. It utilizes a 
Next.js frontend and a Django REST Framework backend to provide a 
high-performance, editorial-grade shopping experience. The system caters 
to regular users, vendors, superuser administrators, and institutional investors.

2. TECHNICAL STACK
------------------
FRONTEND:
- Framework: Next.js 15+ (App Router).
- Styling: Tailwind CSS v4 (High-performance engine).
- Animations: Framer Motion 12 (Spring-based physics).
- Icons: Lucide React.
- State: Custom Context API (Cart, Notification, PWA).

BACKEND:
- Framework: Django & Django Rest Framework (DRF).
- Auth: JWT (SimpleJWT).
- Storage: Cloudinary (Global Media CDN).
- Payments: Paystack Integration.

3. KEY ARCHITECTURAL FEATURES
-----------------------------
- DASHBOARD ISOLATION: 
  Global site navigation (Header/Footer) is automatically hidden on 
  /dashboard routes to provide a focused "Terminal" workspace.
  
- GLOBAL NOTIFICATION CENTER: 
  A centralized NotificationProvider manages unread states and triggers 
  the premium slide-over center across the entire application.

- PWA SYNC: 
  Integrated Progressive Web App support for "Install to Home Screen" 
  functionality across iOS and Android.

- KNOWLEDGE MANAGEMENT:
  Obsidian RAG Vault integration for structured context retrieval, ensuring 
  efficient LLM interactions and tracking of architectural decisions.

4. CORE DIRECTORY STRUCTURE
---------------------------
backend/
├── core/             # API Logic (Models, Views, Serializers)
├── config/           # Server Settings
├── investors/        # Investor portal authentication & data
└── templates/        # Editorial Email Templates

frontend/
├── src/
│   ├── app/         # Routes & Layouts
│   ├── components/  # Atomic UI Library
│   ├── context/     # Global State Management
│   └── lib/         # API Fetchers & Utilities

5. DEVELOPMENT
--------------
Frontend: cd frontend && npm run dev
Backend:  cd backend && python manage.py runserver

6. RECENT PLATFORM UPDATES
--------------------------
- Elevated Vendor Dashboard: Transitioned to a premium, editorial-style 
  interface with advanced typography, whitespace balance, and glassmorphism.
- Admin Messaging System: Implemented robust Superuser Broadcast API 
  with dynamic recipient filtering and integrated email/in-app notifications.
- Vendor Brand Management: Exposed comprehensive brand fields (heritage, 
  founders) with image previews and persistent synchronization.
- Build & Stability: Fixed LightningCSS, Tailwind v4, and Vercel native 
  binary compatibility issues.

================================================================================
7. DEEP DIVE: INVESTOR PORTAL (SHAREHOLDER DASHBOARD)
================================================================================
The Investor Portal is a highly secure, isolated module designed for institutional 
investors and stakeholders. It provides real-time equity analytics, platform 
governance overviews, and strategic logs.

7.1 AUTHENTICATION & SECURITY
-----------------------------
- Dedicated Login Flow: Accessible via `/investor-login` frontend route.
- JWT Authorization: Uses `InvestorLoginSerializer` and `TokenObtainPairView` 
  to issue access and refresh tokens.
- Custom Permissions: `IsInvestor` permission class validates that the user 
  has an `investor_profile` object linked to their account. Standard users 
  or vendors cannot access investor routes.
- Google OAuth: Features a self-contained Google OAuth2 login (`InvestorGoogleLogin`) 
  that strictly authenticates emails pre-approved with an Investor Profile.
- Connection Integrity UI: Frontend enforces a visual "Secured (SSL)" and 
  Node-based session display to convey institutional-grade security.

7.2 DATA MODELS (backend/investors/models.py)
---------------------------------------------
- InvestorProfile: Core model storing `equity_percentage`, `total_investment`, 
  `investment_date`, `status` (active/pending/exited), and `company_valuation_snapshot`.
- InvestmentAllocation: Tracks how capital is distributed across categories 
  (development, marketing, operations, infrastructure) with detailed descriptions.
- MilestoneUpdate: Manages Roadmap Nodes, showcasing timeline events with statuses 
  (completed, ongoing, planned).
- InvestorUpdateFeed: A specialized intelligence feed for Strategic Notes and Dev Logs.
- InvestorNotification: System for targeted in-app alerts (read/unread states).

7.3 FRONTEND ARCHITECTURE (frontend/src/app/investor/dashboard/page.tsx)
------------------------------------------------------------------------
- Ambient Design System: Utilizes a dark mode aesthetic (`bg-[#050505]`) with 
  ambient background lighting, glassmorphism (`backdrop-blur-xl`), and sophisticated 
  Framer Motion micro-animations (spring-based physics).
- Performance Grid: Visualizes critical KPIs:
    * Equity Ownership (%)
    * Committed Capital ($)
    * Indicative Portfolio (Calculated via valuation * equity)
    * Vesting Commencement Date
- Capital Distribution Module: Displays fund allocation using animated progress 
  bars and lists detailed "Strategic Logs".
- Roadmap Node Timeline: A vertical, interactive timeline indicating project 
  milestones and operational statuses.
- Strategic Row & Valuation: Prominently displays the Company Valuation Snapshot 
  with growth node badges and legal disclaimers.
- Intelligence Feed: Renders the `InvestorUpdateFeed` with categorized news cards.

7.4 NOTIFICATION SYSTEM
-----------------------
- Secure Alerts Center: A dedicated dropdown overlay for `InvestorNotification`s.
- Features include visual unread badges, "Flush All" capabilities (marking all 
  notifications as read via API), and distinct read/unread UI states.

================================================================================
Generated for ComraidShops Development Team
Last Update: 2026-05-10
================================================================================
