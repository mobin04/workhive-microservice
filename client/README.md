# WorkHive Frontend

The frontend of **WorkHive**, a job platform built with **React** and **Vite**.  
It provides a modern and responsive interface for **job seekers, employers, and admins**, integrated with the WorkHive backend microservices.

---

## Tech Stack

- **React** – UI library
- **Vite** – Fast build tool and development server
- **React Router DOM** – Client-side routing
- **Redux Toolkit** – State management
- **TanStack Query (React Query)** – API caching and server state management
- **Axios** – API requests
- **React Hook Form (useForm)** – Form handling and validation
- **Mapbox** – Location and coordination-based job search

---

## Features

- **Authentication & User Management**

  - Login, signup, and password reset
  - Token-based authentication (JWT via backend)
  - Forgot password and OTP verification
  - Session handling with cookies

- **Job Management**

  - Browse, search, and filter jobs
  - Save or like jobs for later
  - Employers can create, update, renew, and close jobs

- **Applications**

  - Apply for jobs with resumes
  - View submitted applications
  - Employers can accept, reject, or shortlist applications
  - Real-time status updates

- **Notifications**

  - Popup and persistent notification support
  - Application status updates (accept/reject/shortlist)
  - Login and signup notifications
  - Integration with backend notification service

- **Admin Controls**

  - Suspend/unsuspend users
  - Manage platform-wide activities
  - View statistics for jobs, applications, and users

- **UI & UX**
  - Location-based job search using **Mapbox**
  - Reusable components for forms, loaders, modals, and popups
  - Light/dark theme support via `ThemeContext`

---

## Folder Structure

Detailed Folder Structure:

```sh
client
├── public/                   # Static assets
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── employer-components/
│   │   ├── error-page/
│   │   ├── footer/
│   │   ├── forgot-password/
│   │   ├── header/
│   │   ├── home/
│   │   ├── info-popup/
│   │   ├── job-description-render/
│   │   ├── job-viewer/
│   │   ├── loader/
│   │   ├── login/
│   │   ├── notification/
│   │   ├── notification-popup/
│   │   ├── saved-jobs/
│   │   ├── sign-up/
│   │   ├── submit-application/
│   │   ├── view-applications/
│   │   ├── warning-msg/
│   │
│   ├── contexts/
│   │   └── ThemeContext.js   # Theme context (dark/light)
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── admin-hooks/
│   │   ├── employer-hooks/
│   │   ├── useDebounce.js
│   │   ├── useFetchApplications.js
│   │   ├── useFetchProfile.js
│   │   ├── useHandlePassword.js
│   │   ├── useMergeWithdrawnApp.js
│   │   ├── useNotificationListener.js
│   │   ├── usePreventScroll.js
│   │   ├── useSaveAndRemoveJob.js
│   │   ├── useScrollTo.js
│   │   ├── useSignOut.js
│   │   ├── useTriggerPopup.js
│   │   └── useUpdateProfile.js
│   │
│   ├── server/               # API calls and backend interaction
│   │   ├── applicationWithdraw.js
│   │   ├── createAndEditJob.js
│   │   ├── deleteJob.js
│   │   ├── deleteNotification.js
│   │   ├── fetchAdminStats.js
│   │   ├── fetchData.js
│   │   ├── fetchProfile.js
│   │   ├── handlePassword.js
│   │   ├── handleSuspendUserAdmin.js
│   │   ├── reload.js
│   │   ├── removeJobFromSaved.js
│   │   ├── saveJob.js
│   │   ├── signOut.js
│   │   ├── updateApplication.js
│   │   └── updateProfile.js
│   │
│   ├── store/                # Redux store and slices
│   │   ├── slices/
│   │   └── store.js
│   │
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Root component
│   ├── config.js             # Global config
│   ├── index.css             # Global styles
│   ├── main.jsx              # Entry point
│   └── ThemeContext.js
│
├── .env                      # Environment variables
├── vite.config.js            # Vite configuration
├── package.json
├── package-lock.json
└── index.html

```

## Project Setup

### Prerequisites

- **Node.js** >= 22.x
- **npm** (comes with Node.js)
- **Mapbox account** for location search (get token: [https://mapbox.com](https://mapbox.com))

---

### Install Dependencies

```sh
cd client
npm install
```

### Environment Variables

Create a `env` file in the `client` directory with the following variables:

```sh
# API Gateway (Backend)
VITE_API_URL=http://localhost/api/v2

# Notification service url
VITE_SOCKET_URL=http://localhost:8004

# Mapbox Access Token
VITE_MAPBOX_API_KEY=<your-mapbox-access-token>

```

### Run Development Server

```sh
npm run dev

```

The app will be available at: `http://localhost:5173`

### Build for Production

```sh
npm run build
```

Build output will be generated in the dist/ folder.

---

## Screenshots and Screen Records

### Authentications

- [Login, Password Reset, Magic login](screenshots/Authentication/Login-ezgif.com-video-to-gif-converter.gif)
- [Signup](screenshots/Authentication/Signup.png)

### Job Seekers

- [Home](screenshots/jobseekers/job_seeker_Home_page.png)
- [Job-Filter](screenshots/jobseekers/job_filter_jobseeker.png)
- [Profile](screenshots/jobseekers/profile_view_page_jobseeker.png)
- [Applications](screenshots/jobseekers/application_view_jobseeker.png)
- [Saved-Jobs](screenshots/jobseekers/view_saved_jobs_jobseeker.png)
- [Notification-Panel](screenshots/jobseekers/notification_panel.png)
- [Job-Details](screenshots/jobseekers/job_view_jobseeker.png)
- [Pagination](screenshots/jobseekers/pagination.png)
- [Apply-job](screenshots/jobseekers/apply_job_jobseeker.png)

### Employers

- [Home](screenshots/employers/Employer_Home.png)
- [Post a Job](screenshots/employers/Post_Job-ezgif.com-video-to-gif-converter.gif)
- [Statistics](screenshots/employers/Statistics-ezgif.com-video-to-gif-converter.gif)
- [View Applications](screenshots/employers/View_applications.png)
- [View Resume](screenshots/employers/View_Resume-ezgif.com-video-to-gif-converter.gif)
- [Manage Job](screenshots/employers/Manage_Job.png)

### Admin

- [Home](screenshots/admin/Admin_Home-ezgif.com-video-to-gif-converter.gif)
- [User Management](screenshots/admin/User_ManageMent.png)
- [Employer Management](screenshots/admin/Employer_ManageMent.png)
- [Edit User Profile](screenshots/admin/Edit_User_Details.png)
- [Account Suspention](screenshots/admin/Account_suspention-ezgif.com-video-to-gif-converter.gif)
- [Edit Job Details](screenshots/admin/Edit_Job_Details-ezgif.com-video-to-gif-converter.gif)

---

## 🙏 Acknowledgments

Thanks to the amazing tools and libraries that made this project possible:  
[React](https://react.dev/) · [Vite](https://vitejs.dev/) · [Mapbox](https://www.mapbox.com/) · [Redux Toolkit](https://redux-toolkit.js.org/) · [TanStack Query](https://tanstack.com/query/latest)
