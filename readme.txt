================================================================================
COMRAIDSHOPS | COMPLETE TECHNICAL DOCUMENTATION & ARCHITECTURE REFERENCE
================================================================================

For Creative, Design, and Lexicon guidelines, refer to: branding.txt

1. PROJECT SUMMARY
------------------
ComraidShops is a decoupled headless e-commerce ecosystem. It utilizes a 
Next.js frontend and a Django REST Framework backend to provide a 
high-performance, editorial-grade shopping experience. The platform acts as 
a luxury multi-vendor marketplace interlaced with editorial content, 
exhibitions, and an institutional investor dashboard.

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

================================================================================
DEEP DIVE MODULES (EXHAUSTIVE DOCUMENTATION)
================================================================================

6. EDITORIAL PLATFORM (MAGAZINES & EXHIBITIONS)
-----------------------------------------------
ComraidShops is not just a store; it is an editorial platform. Content and 
commerce are intertwined.
- Magazine (`core.models.Magazine`): Acts as a thematic publication container. 
  Features SEO overrides (meta_title, meta_description) and allows grouping 
  of `linked_articles` for deep editorial context.
- Articles (`core.models.Article`): Individual content nodes that support full HTML 
  content, image uploads, and an advanced Cinematic Video System (YouTube, Vimeo, 
  or direct Cloudinary upload). Articles can feature products natively and support 
  user "likes".
- Exhibitions (`core.models.Exhibition`): Curated digital galleries. Exhibitions 
  are cross-referenced with `Articles`, `Products`, `Collections`, and `Magazines`, 
  providing a unified narrative interface complete with curator notes.

7. E-COMMERCE & CATALOG FLOW
----------------------------
- Products & Variants: Comprehensive cataloging (`Product`, `ProductVariant`) 
  supporting multiple sizes, colors, and SKUs. Extended via `ProductFeature` and 
  `ProductSpecification` for granular technical details.
- Immersive Media: Uses `ProductImage` and `Product360Video` for high-end visualization.
- Collections: Curated thematic groups of products (`Collection`) with their 
  own dedicated media (`CollectionImage`).
- Checkout & Orders (`Order`, `OrderItem`): Complete payment flow powered by 
  Paystack, robust order tracking, status flags (pending, shipped, delivered), 
  and multi-vendor cart handling.

8. VENDOR ECOSYSTEM (LUXURY BRANDING)
-------------------------------------
- Vendor Profiles (`core.models.Vendor`): Link backend users to commercial 
  storefronts. Vendors manage their own inventory.
- Brand Pages (`core.models.Brand`): Distinct from functional vendors, Brand models 
  encapsulate the identity, heritage, and founder information of a label. Features 
  rich image galleries (`BrandImage`).
- Financials: Intricate tracking of vendor revenue (`VendorEarning`) minus 
  platform fees (`Commission` and `GlobalCommission`). Vendors can issue 
  payouts through `WithdrawalRequest`.
- Community: `BrandCommunityMember` tracking for loyalists.

9. USER PROFILES & SOCIAL (FITFRAMES)
-------------------------------------
- Profiles & Settings: Management of `UserAddress` and `SavedCard` configurations.
- FitFrames (`core.models.FitFrame`, `FitItem`): A social-commerce feature allowing 
  users to curate personal style moodboards or outfits from catalog items. Users 
  can save other users' creations (`SavedFitFrame`).
- Dashboards: Frontend routes (`/dashboard/user/`) isolate the consumer experience 
  into a sleek panel for tracking orders, billing, and saved fits.

10. SUPERUSER ADMINISTRATION
----------------------------
- Global Control: The `/dashboard/admin/` routes provide absolute control over 
  users, finance, editorial publishing, product approvals, and category management.
- Admin Messaging (`core.models.AdminMessage`): A powerful broadcast system 
  capable of dispatching in-app alerts and batch emails via SendGrid to specific 
  roles (Vendors, Users, Investors).

11. INVESTOR PORTAL (SHAREHOLDER DASHBOARD)
-------------------------------------------
The Investor Portal is a highly secure, isolated module designed for stakeholders.
- Authentication: Dedicated `/investor-login` utilizing `InvestorLoginSerializer`, 
  JWT authorization, and specialized Google OAuth specifically for whitelisted investors.
- Data Models (`backend/investors/models.py`):
    * `InvestorProfile`: Equity percentage, valuation snapshot, vesting dates.
    * `InvestmentAllocation`: Categorical capital distribution (Development, Marketing, etc.).
    * `MilestoneUpdate`: Roadmap nodes and timeline events.
    * `InvestorUpdateFeed` & `InvestorNotification`: Strategic intelligence feed and secure alerts.
- UI Architecture: Uses dark-mode ambient lighting, Framer Motion, and a 
  focused "Terminal" aesthetic distinct from the main platform. Features 
  interactive progress bars and a secure alert dropdown with "Flush All" functionality.

================================================================================
Generated for ComraidShops Development Team
Last Update: 2026-05-10
================================================================================
