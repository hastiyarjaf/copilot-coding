import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

async function refreshGoogleAccessToken(token) {
  try {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: token.google?.refreshToken || ""
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });
    const data = await res.json();

    if (!res.ok) throw data;

    return {
      ...token,
      google: {
        ...token.google,
        accessToken: data.access_token,
        accessTokenExpires: Date.now() + data.expires_in * 1000,
        refreshToken: token.google?.refreshToken // may not change
      }
    };
  } catch (e) {
    return { ...token, error: "GoogleRefreshAccessTokenError" };
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.readonly",
          access_type: "offline",
          prompt: "consent"
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: { params: { scope: "read:user repo" } }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google") {
        token.google = {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + (account.expires_in || 3600) * 1000
        };
      }
      if (account?.provider === "github") {
        token.github = {
          accessToken: account.access_token
        };
      }

      if (token.google?.accessTokenExpires && Date.now() > token.google.accessTokenExpires) {
        token = await refreshGoogleAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      session.providers = {
        google: !!token.google?.accessToken,
        github: !!token.github?.accessToken
      };
      session.tokens = {
        google: token.google ? { accessToken: token.google.accessToken } : null,
        github: token.github ? { accessToken: token.github.accessToken } : null
      };
      return session;
    }
  },
  pages: {
    signIn: "/"
  }
};

export default NextAuth(authOptions);