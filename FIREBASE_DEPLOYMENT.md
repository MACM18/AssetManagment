# Firebase Hosting Deployment Guide

This document explains how to set up and use automated deployment to Firebase Hosting for the AssetManagement application.

## Overview

The application uses GitHub Actions to automatically deploy the Next.js application to Firebase Hosting whenever changes are pushed to the `main` branch. The deployment workflow can also be triggered manually.

## Prerequisites

1. A Firebase project with Hosting enabled
2. Firebase CLI installed locally (for initial setup only)
3. GitHub repository with Actions enabled

## Initial Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firebase Hosting in your project

### 2. Configure Firebase Project ID

Update the `.firebaserc` file with your Firebase project ID:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

Replace `your-firebase-project-id` with your actual Firebase project ID.

### 3. Set Up GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### Required Secrets:

1. **FIREBASE_SERVICE_ACCOUNT**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Copy the entire JSON content
   - Add it as a secret in GitHub

2. **FIREBASE_PROJECT_ID**
   - Your Firebase project ID (same as in `.firebaserc`)

#### Optional (Already Available):

- **GITHUB_TOKEN** - Automatically provided by GitHub Actions

### 4. Test Local Build

Before deploying, test that the application builds correctly:

```bash
npm install
npm run build
```

This will create an `out` directory with the static files ready for deployment.

## Deployment Workflow

### Automatic Deployment

The deployment workflow (`.github/workflows/firebase-deploy.yml`) automatically runs when:

- Changes are pushed to the `main` branch
- A pull request is merged into `main`

The workflow performs the following steps:

1. Checks out the repository
2. Sets up Node.js environment
3. Installs dependencies
4. Builds the Next.js application (static export)
5. Deploys to Firebase Hosting

### Manual Deployment

You can trigger a deployment manually:

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select "Deploy to Firebase Hosting" workflow
4. Click "Run workflow"
5. Select the branch and click "Run workflow"

## Configuration Files

### firebase.json

Configures Firebase Hosting settings:

- **public**: `out` - Directory containing the built static files
- **rewrites**: Routes all requests to `index.html` for client-side routing
- **headers**: Sets cache headers for static assets

### next.config.js

Updated to support static export:

- **output**: `'export'` - Generates static HTML files
- **images.unoptimized**: `true` - Disables Next.js image optimization (not supported in static export)

## Local Testing with Firebase

To test the deployment locally before pushing:

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase (if not already done)

```bash
firebase init hosting
```

Select:
- Use an existing project
- Choose your Firebase project
- Set public directory to `out`
- Configure as single-page app: Yes
- Don't overwrite existing files

### 4. Build and Deploy

```bash
npm run build
firebase deploy --only hosting
```

### 5. Test Locally

```bash
npm run build
firebase serve --only hosting
```

Visit http://localhost:5000 to test the application.

## Troubleshooting

### Build Fails

- **Error**: `Module not found` or dependency issues
  - Solution: Run `npm ci` to ensure clean dependency installation

- **Error**: Image optimization not supported
  - Solution: Already configured with `images.unoptimized: true`

### Deployment Fails

- **Error**: `Invalid service account`
  - Solution: Verify `FIREBASE_SERVICE_ACCOUNT` secret is correctly set with valid JSON

- **Error**: `Permission denied`
  - Solution: Ensure the service account has "Firebase Hosting Admin" role

- **Error**: `Project not found`
  - Solution: Verify `FIREBASE_PROJECT_ID` secret matches your Firebase project

### Environment Variables

Firebase Hosting with static export does not support runtime environment variables. All environment variables must be set at build time:

```bash
# In GitHub Actions workflow
env:
  NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
  # Add other NEXT_PUBLIC_* variables as needed
```

For local development, use `.env.local` file (already configured).

## Monitoring Deployments

### GitHub Actions

1. Go to "Actions" tab in your repository
2. Click on a workflow run to see detailed logs
3. Check each step for success or errors

### Firebase Console

1. Go to Firebase Console → Hosting
2. View deployment history
3. See live URL and rollback options if needed

## Rolling Back

If a deployment causes issues:

### Using Firebase Console

1. Go to Firebase Console → Hosting
2. Click "Release history"
3. Find a previous working version
4. Click three dots → "Rollback"

### Using Firebase CLI

```bash
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION TARGET_SITE_ID:live
```

## Performance Optimization

The deployment includes:

- **Static generation**: Pre-rendered pages for fast loading
- **Cache headers**: Long-term caching for assets (1 year)
- **CDN**: Firebase Hosting automatically uses Google's CDN

## Security

- Never commit service account keys to the repository
- Use GitHub Secrets for all sensitive data
- Regularly rotate service account keys
- Review Firebase Security Rules for Firestore and Storage

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Support

For issues with deployment:

1. Check GitHub Actions logs
2. Verify all secrets are correctly set
3. Test local build with `npm run build`
4. Review Firebase Console for hosting errors
5. Open an issue on GitHub if problems persist
