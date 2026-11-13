# Charbhuja Furniture
## Complete E-Commerce & Custom Furniture Manufacturing Platform

Charbhuja Furniture is a digital platform for a solid wood furniture manufacturing and interior design business. It blends luxury direct-to-consumer e-commerce with tailored custom furniture manufacturing, room project folders, quotation proposals, and order management.

---

## 1. Brand & Design Philosophy
- **Identity:** Four hands growing together in an enduring tree-like formation.
- **Palette:** Warm paper (`#F8F6F2`), Soft putty (`#F0ECE5`), Charcoal ink (`#29231E`), Muted bronze (`#77716A`), Brand walnut (`#68452D`), Sandstone (`#A17A58`).
- **Typography:** Playfair Display (editorial headings) + Plus Jakarta Sans (clean modern body).
- **Hardwoods:** Seasoned Central Province (CP) Teak, Indian Rosewood (Sheesham), White Oak, American Walnut.

---

## 2. Technology Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Zustand, React Hook Form, Zod, Lucide React.
- **Backend (Phase 2):** Firebase Authentication, Cloud Firestore, Firebase Storage, Firebase Security Rules, Firebase Cloud Functions.
- **Future Payments:** Designed for Razorpay integration (manual order confirmation in v1).

---

## 3. Getting Started

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Runs the Vite development server on `http://localhost:3000`.

### Type Check & Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
```

---

## 4. Application Routes

### Customer Routes
- `/` — Homepage (Hero, Category Strip, Featured Furniture, Bespoke Process, Craftsmanship, Brand Story)
- `/browse` — Product Catalogue (Search, Category filters, Sorting, Responsive grid)
- `/product/:productId` — Product Details (Image gallery, Timber & Finish options, Dimensions, Add to Cart & Project)
- `/custom-design` — Custom Furniture Submission (Dimensions, Timber species, Drag-and-drop CAD/drawings upload)
- `/projects` — Customer Room Projects (Organize furniture by space, notes, combined quotation requests)
- `/checkout` — Order Confirmation & Address (Manual verification workflow)
- `/account` — Customer Profile (Order tracking, Custom design quotes, Saved addresses)
- `/login` — Sign In / Authentication (Google & Mobile OTP)

### Staff Admin Routes
- `/admin` — Operations Dashboard (Overview KPIs, Products, Custom Requests, Orders, Analytics)

---

## 5. Development Phases
- **Phase 1 (Completed):** Project Audit & Foundation, Design System, Homepage, Full Routing, Zustand State, Responsive Layouts.
- **Phase 2 (Upcoming):** Firebase Authentication, Firestore Database, Storage, and Security Rules.
- **Phase 3:** Database-backed Product Catalogue & Admin Creation.
- **Phase 4:** Cloud Storage uploads for Custom Design Requests & Quotation Engine.
- **Phase 5:** Firestore Order Placement & Status History Pipeline.
- **Phase 6:** Admin Operations & Live Metrics.
- **Phase 7:** End-to-End Testing & Security Rule Verification.
- **Phase 8:** Razorpay Payment Gateway & WhatsApp/Email Notifications.
