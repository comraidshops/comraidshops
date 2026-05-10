================================================================================
COMRAIDSHOPS | TECHNICAL DOCUMENTATION
================================================================================

For Creative, Design, and Lexicon guidelines, refer to: branding.txt

1. PROJECT SUMMARY
------------------
ComraidShops is a decoupled headless e-commerce ecosystem. It utilizes a 
Next.js frontend and a Django REST Framework backend to provide a 
high-performance, editorial-grade shopping experience.

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
- Investor Portal: Resolved mobile responsiveness and JWT authentication 
  security edge cases.
- Build & Stability: Fixed LightningCSS, Tailwind v4, and Vercel native 
  binary compatibility issues.

================================================================================
Generated for ComraidShops Development Team
Last Update: 2026-05-10
================================================================================
