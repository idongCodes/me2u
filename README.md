# Me2U | Gently Used Home Goods in Worcester, MA

![Me2U Banner](/public/undraw_for-sale_7qjb.svg)

Me2U is a community-focused marketplace designed for the residents of Worcester County. It offers a safe, reliable, and "neighborhood-approved" way to shop for gently used baby gear, toddler clothes, and home goods.

**Live Site:** [fromme2u.app](https://fromme2u.app)

---

## 📖 The Story of Me2U

### What it is for
Me2U was built to solve a common problem: the "is this still available?" loop. It’s a custom digital shop where neighbors can browse, reserve, and pick up quality items from a trusted local source.

### Why it was made
The project started with a simple goal: helping a friend and his wife (a new mom of two) sell off a plethora of high-quality baby items that were gifted, donated, or outgrown. 

### What it evolved into
What began as a simple yard sale alternative evolved into a professional web application. It is now a full-scale inventory management and reservation system, designed to provide a "boutique" feel to the secondhand market while maintaining the trust and simplicity of a neighbor-to-neighbor transaction.

### Showcased Items
*   👶 **Baby & Toddler Gear:** Strollers, cribs, high chairs, and car seats.
*   👕 **Clothing:** Hand-picked onesies, toddler shoes, and seasonal outfits.
*   🏠 **Home Goods:** Barely used furniture, electronics, and décor.
*   🧹 **Verified Quality:** Every item comes from a single, verified smoke-free, pet-free, and professionally cleaned home.

---

## 🚀 Why Me2U is Better than Other Marketplaces

*   🛡️ **Scammer-Proof:** We enforce a strictly **Cash Only** model upon arrival. No fake digital deposits, no shipping fraud, and no hidden fees.
*   🔒 **The "First Dibs" Lock:** When you click **Reserve**, the item is instantly stamped as "RESERVED" globally. It's locked just for you, giving you time to finalize pickup without stress.
*   🧹 **Guaranteed Hygiene:** Unlike standard marketplaces where hygiene is a mystery, Me2U items are guaranteed to be from a single, clean, smoke-free location.
*   📅 **Modern Pickup:** Automated "Add to Calendar" buttons in your confirmation email handle the "when and where" for you.

---

## 🛠️ Tech Stack & Toolbox

*   **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) - Chosen for its blazing-fast performance, SSR capabilities, and SEO optimization.
*   **Language:** [TypeScript](https://www.typescriptlang.org/) - Ensures a robust, type-safe codebase that catches bugs before they happen.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Used for a rapid, beautiful, and fully responsive "Mobile-First" design.
*   **Database:** [MongoDB (via Mongoose)](https://www.mongodb.com/) - Provides a flexible and scalable schema for inventory and reservation management.
*   **Notifications:** 
    *   **Twilio (SMS):** For real-time admin alerts.
    *   **Resend (Email):** For professional, interactive HTML confirmation emails with custom domain verification.
*   **Icons:** [Lucide React](https://lucide.dev/) - For clean, consistent iconography throughout the dashboard and shop.

---

## ✨ Features

### 🛒 Dynamic Neighborhood Shop
*   Real-time inventory tracking with live "RESERVED" and "IN CART" status stamps.
*   Multi-selection support: Mass select items and add them to your cart in one tap.
*   Mobile-first image carousels for easy product inspection.

### 📅 Advanced Reservation System
*   15-minute editing window: Customers can update their time, date, or items after booking.
*   Conflict prevention: Intelligent logic prevents overlapping pickup times.
*   Automatic inventory locking: Items are released back to the shop immediately upon cancellation or after the edit window expires if not confirmed.

### 📧 Interactive Notifications
*   Professional HTML emails with branded styling.
*   **Calendar Integration:** One-tap buttons to save pickups to Google, Apple, or Outlook calendars.
*   Embedded shop address and Google Maps links for easy navigation.

### 🔐 Multi-Tab Admin Dashboard
*   **Inventory Manager:** Full CRUD for shop items, including "Mark as Sold" quick toggles.
*   **Reservation Hub:** View every booking, manage statuses, and override customer limits.
*   **Inbox:** Centralized contact form management with Archive/Trash/Spam sorting.
*   **Testimonial Moderation:** Review, approve, and delete neighbor feedback.
*   **Safety Net:** 60-second "Undo" system for all deletion actions.

---

## 🧱 Hurdles & Lessons Learned

*   **Carrier Filtering:** Navigating the strict A2P 10DLC regulations with Twilio. We learned that Toll-Free numbers require extensive business verification, leading us to pivot to a "Verified Admin SMS" + "Verified Customer Email" model for maximum reliability.
*   **State Management:** Handling real-time multi-select UI synchronization across a high-performance Next.js application required careful refactoring from complex strings to robust boolean states.
*   **SEO & Optimization:** Implementing dynamic sitemaps and whitelisting domains (Cloudinary) in `next.config.ts` to solve `400 Bad Request` image errors.

---

## 🗺️ Future Roadmap

### Codebase & Architecture
*   **Unit Testing:** Implement Jest and Playwright for exhaustive automated testing of the reservation logic.
*   **Zod Validation:** Move all server actions to strict Zod-based schema validation for even higher security.
*   **Monorepo Migration:** If the app expands, moving to a Turborepo structure to separate the Admin panel from the Shop front-end.

### Scalability & Infrastructure
*   **Redis Integration:** Implement Redis for ultra-fast temporary inventory locking during the 15-minute reservation window.
*   **Vercel Blob:** Fully integrate the "Camera to Cloud" upload feature for instant inventory additions via mobile.
*   **Search Engine:** Moving from basic Mongo search to Algolia for large-scale inventory filtering.

### Expansion Ideas
*   **Multi-Seller Support:** Allow trusted neighbors to list their own items with admin approval.
*   **Neighborhood Subscriptions:** Allow neighbors to sign up for "New Item Alerts" based on categories.
*   **Interactive Pickup Maps:** Dynamic routing for customers picking up multiple items from different locations.

---

## 🤝 How to Collaborate

I'm always open to ideas and improvements from the developer community!

1.  **Fork** the repository.
2.  Create your **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

---

## 🔗 Connect with the Maker

**Live App:** [fromme2u.app](https://fromme2u.app)

[<img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" />](https://www.linkedin.com/in/idongcodes/)
[<img src="https://img.shields.io/badge/Threads-000000?style=for-the-badge&logo=threads&logoColor=white" />](https://www.threads.com/@idongcodes)
[<img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" />](https://www.instagram.com/idongcodes/)
[<img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white" />](https://www.facebook.com/idngcodes/)
[<img src="https://img.shields.io/badge/Telegram-26A69A?style=for-the-badge&logo=telegram&logoColor=white" />](https://t.me/idongcxdes)

Built with ❤️ by **idongcodes**
