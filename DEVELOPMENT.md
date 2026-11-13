# DEVELOPMENT LOG — CHARBHUJA FURNITURE

## Current Status
- **Current Phase:** PHASE 4 — CUSTOM PROJECT COLLECTIONS, DRAG-AND-DROP DESIGN UPLOADS, FIREBASE STORAGE & BESPOKE QUOTATIONS (COMPLETED)
- **Next Steps:** END-TO-END VALIDATION & DEPLOYMENT

---

## 1. Phase 3 Overview & Achievements
In Phase 3, we implemented the complete dynamic product catalogue powered by Cloud Firestore and Firebase Storage:
1. **Dynamic Product Details Page (`/product/:productId`)**:
   - Live loading via `getProductById(productId)` with fallback to static initial dataset if offline or network throttled.
   - Interactive multi-image gallery:
     - Main hero image with smooth transitions and full view.
     - Clickable thumbnail strip with active focus indicators.
     - Previous / Next navigation overlay buttons.
     - Fullscreen Lightbox modal preview.
     - Image counter badge (`1 / 3`).
   - Specifications & Craftsmanship module:
     - Standard dimensions card (Width × Depth × Height, unit) with visual ruler icon.
     - Material & Timber selection chips.
     - Finish & Polish selection chips.
     - Product type badges (`Crafted on Demand`, `Ready to Ship`, `Bespoke Architecture`).
     - Quantity stepper and cart addition feedback.
     - Project collection bookmarking.
     - "Need Custom Dimensions or Pinterest Idea?" callout directly routing to `/upload-idea?title=...`.
     - Related Trending Pieces recommendation grid.

2. **Real-Time Reactive Catalogue Browsing (`/browse`)**:
   - Connected directly to `subscribeProducts` Firestore listener. Any updates made in the admin portal (creation, editing, price changes, deletions) reflect immediately on the storefront without needing a page refresh.
   - Category filtering chips (Sofas, Wardrobes, Dining Tables, Beds, Chairs, TV Units, Kitchens, Desks, etc.).
   - Full text search across piece names, categories, descriptions, and timbers.
   - Sorting by featured priority, price (low-to-high, high-to-low), and alphabetical.
   - Quick reset filter action.

3. **Homepage Live Trending Sync (`/`)**:
   - Homepage featured pieces now react in real time to catalogue modifications in Firestore.

4. **Complete Product CRUD & Multi-Image Upload in Admin Dashboard (`/admin`)**:
   - **Catalog Search & Category Filtering**: Filter pieces by category or search by keywords within the admin dashboard.
   - **Create New Trending Piece**:
     - Multi-image file upload via `uploadProductImage(file, productId)` to Firebase Storage with base64 fallback.
     - Drag/select multiple photos with thumbnail previews and remove controls.
     - One-click preset workshop photo selector for rapid catalog setup.
     - Strict field validation (Title length, positive price, required descriptions, dimensions, photo attachments).
     - Timber and Finish tag management with custom tag additions.
     - Dimensions configuration (Width, Depth, Height, Unit).
     - Product type selection (`made_to_order`, `ready_made`, `custom`).
     - Lead time (weeks) and trending toggle.
   - **Edit Existing Piece**:
     - Pre-fills all attributes into the modal.
     - Allows adding new photos, removing photos, updating dimensions, price, description, and specifications.
     - Writes changes to Firestore via `updateProduct(productId, changes)`.
   - **Delete Piece**:
     - Confirmation dialog before deletion.
     - Removes from Firestore via `removeProduct(productId)`.
   - **Storefront Preview**: Direct link from each piece card to view the live customer PDP in a new tab.

---

## 2. Completed Phase 3 Checklist
- [x] Implemented `uploadProductImage` in `/src/services/firebase/storage.ts` with size/type validation and resilient fallback.
- [x] Implemented `subscribeProducts`, `getProductById`, `addProduct`, `updateProduct`, and `removeProduct` in `/src/services/firebase/firestore.ts`.
- [x] Upgraded `/src/pages/ProductDetails/ProductDetailsPage.tsx` with dynamic Firestore loading, multi-image gallery carousel, lightbox, custom modification CTA, and related pieces.
- [x] Upgraded `/src/pages/Browse/BrowsePage.tsx` with real-time `subscribeProducts` listener and clean search/filter states.
- [x] Updated `/src/pages/Home/HomePage.tsx` to subscribe to live Firestore catalog updates.
- [x] Built complete Product CRUD modal in `/src/pages/Admin/AdminDashboardPage.tsx` supporting creation, multi-image upload, editing, deletion, and field validation.
- [x] Enriched `/src/data/products.ts` with multiple high-resolution gallery angles per initial piece.
- [x] Ran compilation and lint checks — verified 0 errors.

---

## 3. Files Created or Modified (Phase 3)
- `/src/pages/ProductDetails/ProductDetailsPage.tsx` — Dynamic PDP with multi-image gallery & specs
- `/src/pages/Browse/BrowsePage.tsx` — Real-time Firestore sync & category navigation
- `/src/pages/Admin/AdminDashboardPage.tsx` — Full product CRUD, multi-image upload, and validation
- `/src/pages/Home/HomePage.tsx` — Live trending designs sync
- `/src/data/products.ts` — Multi-image product assets
- `/DEVELOPMENT.md` — Updated development log

---

## 4. Phase 4 Overview & Achievements
In Phase 4, we designed and built the complete bespoke furniture manufacturing pipeline from customer idea upload to artisan quotation and order fulfillment:

1. **Multi-File Drag-and-Drop Custom Design Uploads (`/upload-idea`)**:
   - Drag-and-drop zone with visual feedback for JPG, PNG, WebP images, and PDF architectural floor plans.
   - Real-time multi-file upload progress bar with instant thumbnail and document previews.
   - Single-click removal of uploaded files before submission.
   - Project collection selection dropdown allowing customers to tie their custom idea directly to a room project.
   - Timber preference selector (CP Teakwood, Indian Rosewood, Natural White Ash, Walnut, Acacia, White Oak).
   - Room measurements / architectural dimensions input with carpenter guidance.
   - Reference code generator (`#CB-IDEA-...`) with instant booking confirmation.

2. **Customer Project Collections (`/projects` & `/projects/:projectId`)**:
   - Organization of curated pieces and custom requests by room (Living Room, Master Suite, Dining Area, Home Office).
   - Real-time Firestore sync with `projects` collection and local state fallback for guest users.
   - Ability to save architectural notes and room specifications per project.
   - Combined Room Quotation request CTA that bundles all items and ideas in the room.

3. **Firebase Storage & Firestore Security Architecture**:
   - Dedicated `uploadCustomDesignFile(file, userId)` storing client assets in `custom-ideas/{userId}/{timestamp}_{filename}`.
   - Strict Firestore security rules deployed to `ai-studio-charbhujafurnitu-9e31e71e-3e65-4c8b-852e-a2877b172e91`:
     - Customers can ONLY read and create their own projects and custom requests (`resource.data.userId == request.auth.uid`).
     - Admin (`sudhanshujangid143@gmail.com`) can read, update, and manage all client submissions and quotations.
   - Firebase Storage security rules restricted to authenticated owner and admin.

4. **Quotation Management & Review (`/admin`)**:
   - Real-time custom idea requests board with status filters (`all`, `submitted`, `quote_sent`, `in_production`, etc.).
   - Client contact links for direct Phone calling and WhatsApp messaging.
   - Multi-document inspector allowing workshop staff to view photos and download architectural PDFs.
   - Workshop Quotation modal allowing the artisan to formulate:
     - Quoted amount in ₹.
     - Crafting timeline in weeks.
     - Status transition (`quote_sent`, `visit_scheduled`, `in_production`, etc.).
     - Joinery and timber workshop notes sent directly to the client.

5. **Customer Request Status Tracking & Quotation Acceptance (`/account`)**:
   - Real-time tracking of submission status across 8 workflow milestones.
   - Official Bespoke Quotation proposal banner displaying quoted amount, artisan joinery specs, and lead time.
   - "Accept & Order Piece" workflow: marks the custom proposal as approved in Firestore and automatically adds the custom item to `useCartStore` with the quoted price and specs for seamless checkout.
   - Option to decline or request modifications.

---

## 5. Phase 4 Checklist
- [x] Implemented `uploadCustomDesignFile` in `/src/services/firebase/storage.ts` with PDF and image support up to 15MB.
- [x] Implemented `createProject`, `updateProject`, `deleteProject`, `getProjectById`, `subscribeUserProjects`, `subscribeAllProjects`, and `approveCustomQuotation` in `/src/services/firebase/firestore.ts`.
- [x] Configured and deployed strict Firestore & Storage rules for private data isolation.
- [x] Built drag-and-drop multi-file upload, project selection, timber preference, and dimensions input in `/src/pages/CustomDesign/UploadIdeaPage.tsx`.
- [x] Built live customer project collections and room notes in `/src/pages/Projects/ProjectsPage.tsx`.
- [x] Enhanced `/src/pages/Account/AccountPage.tsx` with bespoke quotation review, order acceptance into cart, and request status tracking.
- [x] Upgraded `/src/pages/Admin/AdminDashboardPage.tsx` with custom request status filtering, multi-attachment preview, WhatsApp/call links, and comprehensive quotation formulation modal.
- [x] Verified zero TypeScript compilation and lint errors.
