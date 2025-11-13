# React Router v7 Integration

## Routes Structure

The application now uses React Router v7 with the following routes:

- **`/`** - Home page with navigation cards
- **`/rest`** - Todo list using REST API with React Query
- **`/graphql`** - Todo list using GraphQL with Apollo Client
- **`*`** - Catch-all route that redirects to home

## Navigation

Each todo list page has a "Back to Home" link that allows users to return to the home page and switch between implementations.

## Key Features

1. **Home Component** (`/src/components/Home.tsx`)
   - Beautiful landing page with gradient background
   - Two navigation cards: REST API and GraphQL
   - Tech stack showcase
   - Responsive design

2. **REST Route** (`/rest`)
   - Traditional REST API implementation
   - React Query for data fetching
   - Back navigation to home

3. **GraphQL Route** (`/graphql`)
   - GraphQL implementation with Apollo Client
   - Real-time subscriptions
   - Back navigation to home

## Usage

Navigate to:

- `http://localhost:5173/` - Home page
- `http://localhost:5173/rest` - REST implementation
- `http://localhost:5173/graphql` - GraphQL implementation

## React Router v7 Features Used

- `BrowserRouter` - Browser-based routing
- `Routes` and `Route` - Route configuration
- `Link` - Navigation component
- `Navigate` - Programmatic navigation (redirect)

## Testing

TypeScript compilation: ✅ Passing (0 errors)
All components properly typed and integrated.
