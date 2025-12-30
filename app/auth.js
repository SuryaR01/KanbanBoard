import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/mysql";
import { comparePassword } from "@/lib/jwt";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const connection = await pool.getConnection();

        try {
          // Find user by email
          const [users] = await connection.query(
            "SELECT id, name, email, password, image, provider, role FROM users WHERE email = ?",
            [credentials.email]
          );

          if (users.length === 0) {
            throw new Error("Invalid email or password");
          }

          const user = users[0];

          // Check if user registered with credentials
          if (user.provider !== "credentials" || !user.password) {
            throw new Error("Please use OAuth login for this account");
          }

          // Verify password
          const isPasswordValid = await comparePassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          // Return user object (without password)
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } finally {
          connection.release();
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = user.role || 'user';
        
        // Store OAuth users in database
        if (account?.provider && account.provider !== "credentials") {
          const connection = await pool.getConnection();
          try {
            // Check if user exists and get role
            const [existingUsers] = await connection.query(
              "SELECT id, role FROM users WHERE email = ?",
              [user.email]
            );

            if (existingUsers.length === 0) {
              // Create new OAuth user
              await connection.query(
                "INSERT INTO users (name, email, image, provider, role) VALUES (?, ?, ?, ?, ?)",
                [user.name, user.email, user.image, account.provider, 'user']
              );
              token.role = 'user';
            } else {
              // Update existing user
              await connection.query(
                "UPDATE users SET name = ?, image = ?, provider = ? WHERE email = ?",
                [user.name, user.image, account.provider, user.email]
              );
              // Use existing role
              token.role = existingUsers[0].role;
            }
          } finally {
            connection.release();
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID and other info to session
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "secret",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token.v2`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

export const getSession = () => getServerSession(authOptions);

