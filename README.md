# ComraidShops

> A digital cultural ecosystem for Nigerian fashion — where editorial discovery meets multi-vendor commerce.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Live](https://img.shields.io/badge/Status-Live-brightgreen)](https://be.comraidshops.art)
[![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](https://comraidshops.art)
[![Backend: Django REST](https://img.shields.io/badge/Backend-Django%20REST-green)](https://be.comraidshops.art/api/)

---

## What is ComraidShops?

ComraidShops is a headless e-commerce platform built for independent Nigerian fashion brands. It's two things at once:

1. **An editorial publication** — Magazine articles, brand stories, exhibitions, and curated collections that carry cultural weight
2. **A multi-vendor marketplace** — Brands manage products, orders, earnings, and withdrawals through a full vendor dashboard

The platform is built around a single idea: **curation is the highest form of commerce**. Every design decision, every content piece, every product listing should feel like it belongs in a museum, not a marketplace.

---

## Live Platform

| | URL |
|---|---|
| **Frontend** | [comraidshops.art](https://comraidshops.art) |
| **Backend API** | [be.comraidshops.art/api/](https://be.comraidshops.art/api/) |

---

## The Stack

**Frontend** — Next.js 15+ (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, SWR

**Backend** — Django 4.2, Django REST Framework 3.15, Python 3.9, JWT (SimpleJWT)

**Database** — MariaDB (cPanel managed)

**Media** — Cloudinary (global CDN, all product/brand images)

**Payments** — Paystack (card payments, saved cards, webhook-driven order confirmation)

**Infrastructure** — Namecheap cPanel (shared), LiteSpeed + CloudLinux/Passenger, Vercel (frontend)

---

## Architecture

```
comraidshops.art (Vercel)
└── Next.js Frontend
    └── Fetches from: be.comraidshops.art/api/

be.comraidshops.art (cPanel Server)
└── Django REST API
    ├── core app         — Brands, Products, Orders, Cart, Editorial
    ├── investors app    — Investor profiles, equity tracking, updates
    ├── services app      — Platform services
    └── dj-rest-auth      — JWT auth, registration, Google OAuth
        └── MariaDB (riveslmx_backend_comriad)
```

---

## Features

### Editorial Discovery
- Long-form magazine articles with full HTML content
- Brand editorial profiles: philosophy, manifesto, founder bios, story
- Exhibitions — curated collections of brands, products, and articles
- FitFrames — styled outfit combinations from multiple products

### Multi-Vendor Commerce
- Full vendor dashboard: products, orders, analytics, earnings, withdrawals
- Commission tracking per order (default 10%)
- Vendor approval workflow (pending → approved → live)
- Paystack checkout with saved card support
- Guest checkout (email-based, no account required)
- Order status progression: pending → processing → shipped → delivered

### Investor Relations
- Investor profiles with equity % and total investment tracking
- Capital allocation by category (development, marketing, operations)
- Private investor update feed
- Milestone tracking

### Auth & Identity
- JWT access + refresh token flow
- Google OAuth via dj-rest-auth + allauth
- Email verification, password reset
- Custom user roles: customer, vendor, admin

---

## API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/brands/` | GET | List all brands |
| `/api/products/` | GET | List products |
| `/api/magazines/` | GET | Editorial magazines |
| `/api/exhibitions/` | GET | Curated exhibitions |
| `/api/fitframes/` | GET | Styled outfit combinations |
| `/api/auth/register/` | POST | Create account |
| `/api/auth/login/` | POST | Get JWT tokens |
| `/api/vendor/dashboard/` | GET | Vendor stats |
| `/api/vendor/products/` | GET/POST | Manage products |
| `/api/vendor/orders/` | GET | Vendor orders |
| `/api/vendor/earnings/` | GET | Vendor earnings |
| `/api/paystack/initialize/` | POST | Start payment |
| `/api/paystack/webhook/` | POST | Payment confirmation |
| `/api/investors/` | GET | Investor feed |

Full API docs at `be.comraidshops.art/api/`

---

## Brand Philosophy

> *"Interpretation, not imitation. A controlled range of expression."*

ComraidShops is not a marketplace in the generic sense. It is a **terminal for the modern collector** — where independent labels are treated with the reverence of a museum exhibition. Every brand, every product, every article is curated through a specific lens.

The platform has a distinct voice: high-end, editorial, precise. Never generic. Never discount-code energy.

See [branding.txt](branding.txt) for the full brand bible — voice, tone, visual pillars, and motion design standards.

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- MariaDB/MySQL

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials, Paystack keys, Cloudinary credentials

python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL

npm run dev
```

---

## Related Projects

| Repo | Description |
|---|---|
| [chopcentral](https://github.com/comraidshops/chopcentral) | Nigerian meal prep & food delivery platform |
| [gassplan](https://github.com/comraidshops/gassplan) | Predictive gas utility platform |
| [casestudy](https://github.com/comraidshops/casestudy) | Project documentation & case studies |

---

## License

This project is proprietary and private. All rights reserved.