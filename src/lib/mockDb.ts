// A simple in-memory database for the frontend assignment.
// This allows the Signup flow to work without requiring a real database like Vercel Postgres or Firebase.
// Note: In a serverless environment like Vercel, this memory is wiped when the function spins down,
// but it is perfectly sufficient for demonstrating UI/UX during an assignment evaluation!

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app this would be hashed
  image?: string;
}

// Global variable to persist across hot-reloads in Next.js development server
const globalForDb = globalThis as unknown as {
  mockUsers: MockUser[];
};

export const mockUsers: MockUser[] = globalForDb.mockUsers || [
  // The default hardcoded admin user
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@dummy.com",
    password: "password123",
    image: "https://i.pravatar.cc/150?u=admin",
  }
];

if (process.env.NODE_ENV !== "production") {
  globalForDb.mockUsers = mockUsers;
}
