# Unified Access Platform

A Next.js dashboard application that connects Google Drive, GitHub repositories, and Google AI Studio (Gemini) in one unified interface.

## Features

- **Google Drive Integration**: Browse your Drive files (read-only access)
- **GitHub Integration**: View your repositories with direct links
- **AI Assistant**: Chat with Google's Gemini AI model
- **OAuth Authentication**: Secure login with Google and GitHub
- **Token Refresh**: Automatic Google token refresh for extended sessions
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed on your system
- Google Cloud Console project with Drive API enabled
- GitHub OAuth app configured
- Google AI Studio API key (optional, for AI features)

### Local Development Setup

1. **Clone and navigate to the app directory**:
   ```bash
   cd apps/unified-access-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

4. **Configure OAuth providers** (see detailed setup below):
   - Google OAuth (for Drive access)
   - GitHub OAuth (for repository access)
   - Google AI Studio API key (optional)

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** and navigate to `http://localhost:3000`

## OAuth Setup Guide

### Google OAuth Configuration

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create or select a project**
3. **Enable the Google Drive API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API" and enable it
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.vercel.app/api/auth/callback/google` (for production)
5. **Copy the Client ID and Client Secret** to your `.env.local` file:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### GitHub OAuth Configuration

1. **Go to [GitHub Developer Settings](https://github.com/settings/developers)**
2. **Click "New OAuth App"**
3. **Fill in the application details**:
   - Application name: "Unified Access Platform"
   - Homepage URL: `http://localhost:3000` (or your domain)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. **Copy the Client ID and Client Secret** to your `.env.local` file:
   ```env
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret
   ```

### Google AI Studio (Gemini) Setup

1. **Go to [Google AI Studio](https://aistudio.google.com/app/apikey)**
2. **Create a new API key**
3. **Add it to your `.env.local` file**:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-1.5-flash
   ```

**Note**: The AI feature works without this key but will show a fallback message.

### NextAuth Secret

Generate a secure random string for NextAuth:

```bash
openssl rand -base64 32
```

Add it to your `.env.local` file:
```env
NEXTAUTH_SECRET=your_generated_secret_string
```

## Complete .env.local Example

```env
# NextAuth base URL (use your deployed URL in production)
NEXTAUTH_URL=http://localhost:3000
# Generate a long random string (e.g., `openssl rand -base64 32`)
NEXTAUTH_SECRET=your_generated_secret_string_here

# OAuth - Google (for Drive read-only)
GOOGLE_CLIENT_ID=your_google_client_id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth - GitHub (read repos)
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# Gemini (Google AI Studio)
# Get a key: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

## API Endpoints

### Drive Files
- **GET** `/api/drive/list` - Returns the first 20 files from Google Drive
- **Authentication**: Requires Google OAuth connection
- **Response**: `{ files: [...] }` or `401` if not connected

### GitHub Repositories
- **GET** `/api/github/list` - Returns the most recent 20 repositories
- **Authentication**: Requires GitHub OAuth connection  
- **Response**: `{ repos: [...] }` or `401` if not connected

### AI Assistant
- **POST** `/api/ai/ask` - Send a prompt to Gemini AI
- **Body**: `{ prompt: "your question" }`
- **Response**: `{ provider: "gemini", message: "..." }` or `{ provider: "fallback", message: "..." }`

## Deployment on Vercel

### Monorepo Deployment

Since this app is in a subdirectory of a monorepo, follow these steps:

1. **Connect your GitHub repository to Vercel**
2. **In the import project dialog**:
   - Set **Root Directory** to `apps/unified-access-platform`
   - Vercel will automatically detect it's a Next.js project
3. **Add your environment variables** in the Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all the variables from your `.env.local` file
   - Make sure to update `NEXTAUTH_URL` to your Vercel URL
4. **Update OAuth redirect URIs**:
   - Add your Vercel URL to Google and GitHub OAuth configurations
   - Format: `https://your-app.vercel.app/api/auth/callback/google`
   - Format: `https://your-app.vercel.app/api/auth/callback/github`

### Build Commands

The `vercel.json` file is already configured with the appropriate build commands:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next", 
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

## Troubleshooting

### Common Issues

1. **"OAuth Error: access_denied"**
   - Check that your redirect URIs match exactly
   - Ensure the OAuth app is configured correctly

2. **"Drive API not enabled"**
   - Make sure Google Drive API is enabled in Google Cloud Console
   - Wait a few minutes after enabling

3. **"Invalid token" errors**
   - The app automatically refreshes Google tokens
   - Try signing out and signing back in

4. **AI responses not working**
   - Check that `GEMINI_API_KEY` is set correctly
   - The app will show a fallback message if the key is missing

5. **Build errors on Vercel**
   - Ensure all environment variables are set
   - Check that the Root Directory is set to `apps/unified-access-platform`

### Development Tips

- Use the browser's Network tab to debug API calls
- Check the Vercel function logs for backend errors
- Test OAuth flows in an incognito window to avoid cached tokens

## Security Notes

- This app uses read-only access for Google Drive
- GitHub access is limited to public repository information and your own repos
- Tokens are securely managed by NextAuth with automatic refresh
- All environment variables should be kept secret and never committed to version control

## Tech Stack

- **Framework**: Next.js 14.2.5
- **Authentication**: NextAuth.js with JWT sessions
- **APIs**: Google Drive API, GitHub API, Google Generative AI
- **Deployment**: Vercel-optimized
- **Styling**: Inline styles (easily replaceable with your preferred CSS framework)

## License

This project is for demonstration purposes. Please review the terms of service for Google Drive API, GitHub API, and Google AI Studio before production use.