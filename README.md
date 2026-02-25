# YouTube Shorts to MP4 Converter - 1080p H.264

A premium Next.js web application that allows users to seamlessly convert and download YouTube Shorts videos without watermarks, purely in 1080p HD H.264 format.

## Technologies Used
- **Next.js 14** (App Router)
- **Tailwind CSS** (for styling, including a premium glassmorphic dark mode)
- **Framer Motion** (for micro-animations and smooth transitions)
- **TypeScript** (for robust type-safe code)

## Getting Started Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying to Vercel

This application is designed specifically to be deployed natively on Vercel. However, since extracting video from YouTube via heavy binaries like `yt-dlp` or `ffmpeg` surpasses Vercel's 50MB Serverless Function execution limit, the API route is currently stubbed out to accept a fast third-party API integration.

### Steps to Deploy:

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit of Converter UI"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Log into [Vercel](https://vercel.com/)
   - Click **"Add New..." > "Project"**
   - Import the repository you just pushed to GitHub.
   - The framework (Next.js) will be automatically detected.
   - Click **Deploy**!

3. **Production API Setup:**
   For the backend video processing to work in production, open `src/app/api/convert/route.ts` and replace the simulated response with a `fetch()` call to a third-party conversion API (like Cobalt API) or deploy a worker separate from Vercel. 
