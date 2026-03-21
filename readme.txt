================================================================================
COMRAIDSHOPS | CURATED BRAND MARKETPLACE
================================================================================

1. PROJECT PHILOSOPHY
---------------------
ComraidShops is not just a marketplace; it is a digital gallery and editorial 
platform designed for independent and curated brands. The project aims to 
redefine the e-commerce experience by merging commerce with curation.

Instead of a generic product grid, ComraidShops focuses on the "story" behind 
the brand and its creations. It bridges the gap between high-end digital 
magazines and functional marketplaces, giving independent designers a 
platform that feels as premium as a physical boutique.

Core Values:
- Story-First Commerce: Every brand and product has a narrative (Philosophy, 
  Manifesto, Founder Bios).
- Curated Discovery: Features like "Current Rotation" and "Exhibitions" guide 
  users rather than making them search blindly.
- Community Archive: The "FitFrame" system allows users to curate and save 
  looks, turning a shop into a personal moodboard.


2. ART DIRECTION & DESIGN AESTHETIC
-----------------------------------
The visual language of ComraidShops is built on "Digital Luxury."

- Color Palette: Strict Monochromatic (High-Contrast Black & White). This 
  ensures that the product photography is the only source of color, allowing 
  the clothes to speak for themselves.
- Design System: Glassmorphism. The UI uses heavy backdrop blurs (20px-30px), 
  frosted glass surfaces, and subtle rim lighting to create depth.
- Typography: Uses the Geist font family for a sleek, technical, yet 
  approachable look. 
- UI Feel: "Alive" and interactive. Micro-animations (Framer Motion) provide 
  tactile feedback. The UI uses spring-based physics for transitions to avoid 
  the "stiff" feeling of traditional web apps.
- Layout: Asymmetrical grids and editorial-style spacing.


3. TECHNICAL STACK
------------------
FRONTEND:
- Framework: Next.js (App Router) - Leveraging Server Components for SEO and 
  Client Components for interactivity.
- Styling: Tailwind CSS v4 - Utilizing a high-performance utility-first CSS 
  engine with custom design tokens.
- Animations: Framer Motion - Driving the smooth layout transitions and 
  interactive UI elements.
- Icons: Lucide React - A consistent, minimalist icon set.

BACKEND:
- Framework: Django & Django Rest Framework (DRF).
- Authentication: JWT (SimpleJWT) - Secure, stateless token-based authentication.
- Database: SQLite (Development) / PostgreSQL (Production).
- Media: Cloudinary - Global CDN for high-performance image and video delivery.
- Payments: Paystack Integration - Secure processing for transactions.

ARCHITECTURE:
- Decoupled Headless Setup: The frontend communicates with the backend via a 
  RESTful API, allowing for a fast, app-like user experience.


4. UI FLOW & KEY FEATURES
-------------------------
CUSTOMER JOURNEY:
1. Landing: Enters via the "Hero Statement" or "Editorial Entry."
2. Discovery: Browses "Current Rotation" or "Featured Labels."
3. Education: Reads about the brand's philosophy or the "Curator's Note" in 
   an Exhibition.
4. Interaction: Fits & Frames allow users to see products in a curated outfit 
   context.
5. Purchase: Standard cart flow integrated with Paystack for seamless checkout.

USER DASHBOARD:
- Overview: Quick look at total orders and saved items.
- Saved Fits (The Archives): A personal space for users to save FitFrames.
- Global Mobile Nav: An authenticated-only bottom navigation bar providing 
  instant access to Home, Dashboard, Archives, Orders, and Profile.

VENDOR DASHBOARD:
- Product Management: Vendors can create "cinematic" product listings with 
  360 videos, materials detail, and stories.
- Analytics: Revenue tracking and order management.
- Withdrawals: Integrated system for vendors to request payouts.


5. PROJECT STRUCTURE
--------------------
backend/
├── core/             # Main Django app (Models, Views, Serializers)
├── config/           # Django settings and URL configuration
└── media/            # Local media storage (mirrored on Cloudinary)

frontend/
├── src/
│   ├── app/         # Next.js App Router (Pages & Layouts)
│   ├── components/  # Atomic design components (UI, Layout, Brand, Home)
│   ├── context/     # React Context for Global State (Cart, Notifications)
│   └── lib/         # API helpers and utilities
└── public/          # Static assets

================================================================================
Generated for ComraidShops Development Team
2026-03-19
================================================================================
