#  Team Task Manager

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-316192?style=for-the-badge&logo=postgresql)

A premium, full-stack task management platform designed to streamline team productivity. Built with modern web technologies, it features an interactive Kanban board, role-based access control, and comprehensive analytics.

## ✨ Key Features

* 🔐 **Secure Authentication:** Seamless signup and login utilizing JWT session cookies.
* 👥 **Role-Based Access Control (RBAC):** Distinct permission levels for Admin and Member users.
* 🗂️ **Relational Data Management:** Organize work efficiently with Projects, Teams, and Tasks powered by Prisma.
* 📋 **Interactive Kanban Board:** Drag-and-drop task status updates for an intuitive workflow.
* 📊 **Productivity Analytics:** Automated overdue task detection and visual data reporting.
* 🎨 **Modern UI/UX:** Responsive dashboard featuring charts, activity feeds, advanced search/filtering, and Shadcn-inspired reusable primitives.
* 🛡️ **Robust Validation:** End-to-end type safety and form validation using Zod and React Hook Form.

---

## 🛠️ Tech Stack

**Frontend**
* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4
* **UI Components:** Radix UI primitives (Shadcn-inspired)
* **Interactions:** dnd-kit (Drag & Drop), Framer Motion (Animations), Sonner (Toasts)
* **Data Visualization:** Recharts

**Backend & Database**
* **Database:** PostgreSQL *(Default)* / MySQL-compatible
* **ORM:** Prisma 7
* **Authentication:** Custom JWT Implementation
* **Validation:** Zod

---

## 🏛️ System Architecture

The application follows a modern monolithic architecture utilizing Next.js 16 App Router for both client-side rendering and server-side logic, communicating securely with a PostgreSQL database via Prisma ORM.

```text
    [ Web Browser ]
           │
           │ HTTPS / JWT Cookies
           ▼
  ┌──────────────────────────────────────────────┐
  │                 Next.js 16                   │
  │                                              │
  │  ┌─────────────────┐    ┌─────────────────┐  │
  │  │ Client UI       │    │ Server App      │  │
  │  │ (React, Radix,  │◄──►│ (Server Actions,│  │
  │  │ Tailwind CSS)   │    │ Route Handlers) │  │
  │  └─────────────────┘    └─────────────────┘  │
  └─────────────────────────────────┬────────────┘
                                    │
                                    │ Prisma Client
                                    ▼
  ┌──────────────────────────────────────────────┐
  │                 Prisma ORM                   │
  │  (Data Validation, Type-safe Queries)        │
  └─────────────────────────────────┬────────────┘
                                    │
                                    │ TCP / Port 5432
                                    ▼
  ┌──────────────────────────────────────────────┐
  │               PostgreSQL (Railway)           │
  │  (Relational Data, Users, Tasks, Projects)   │
  └──────────────────────────────────────────────┘
