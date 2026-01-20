# Thryft

A student marketplace for buying and selling items on campus. Built with Next.js 16, React 19, and Firebase.

## Features

- **Student-Only Marketplace**: Verified student accounts with school selection
- **Browse Listings**: Filter by category (clothes, textbooks, tech, furniture, tickets, services)
- **Create Listings**: Sell items with images, pricing, condition, and size
- **Messaging**: Chat with buyers/sellers about items
- **Save Items**: Bookmark listings to find them later
- **Dark Mode**: Automatic theme based on system preference
- **Responsive Design**: Works on desktop and mobile with sidebar navigation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Language**: TypeScript 5
- **Linting**: ESLint 9

## Getting Started

### Prerequisites

- Node.js 24+
- Firebase project with Auth, Firestore, and Storage enabled
- Google OAuth provider configured

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure Firebase (see Environment Variables below)
```

### Environment Variables

Create `.env.local` with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin SDK for server-side operations (optional)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"
```

### Development

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start

# Clean isolated build cache
npm run clean:isolated
```

## Project Structure

```
├── app/
│   ├── api/              # Next.js API routes
│   ├── components/       # Reusable UI components
│   ├── lib/              # Firebase config, auth context, types
│   ├── listings/         # Listings pages (browse, detail, create)
│   ├── messages/         # Messaging system
│   ├── profile/          # User profile
│   ├── schools/          # School management pages
│   └── views/            # Shared view components
├── public/               # Static assets
└── package.json
```

## Key Components

- `sidebar.tsx`: Desktop navigation sidebar
- `bottom-nav.tsx`: Mobile bottom navigation
- `listing-gallery.tsx`: Image gallery for listings
- `progressive-image.tsx`: Lazy-loaded images with blur placeholder
- `image-upload.tsx`: Firebase Storage image uploads
- `chat-image-upload.tsx`: Image uploads in messages

## Database Schema

Key Firestore collections:

- `users/{userId}`: User profiles with schoolId
- `listings/{listingId}`: Item listings with metadata
- `conversations/{conversationId}`: Chat threads
- `messages/{messageId}`: Individual messages
- `schools/{schoolId}`: School information
- `savedListings/{docId}`: User-saved items

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run clean:isolated` | Clear isolated build cache |

## Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
