# GitHub Actions Configuration Guide

This guide explains how to configure GitHub Actions secrets for the automated data collection and monthly export workflows.

## Required Secrets

To enable automated workflows, add the following secrets to your GitHub repository:

### 1. Navigate to Repository Settings
- Go to your repository on GitHub
- Click on **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret**

### 2. Add Firebase Secrets

#### FIREBASE_SERVICE_ACCOUNT
Your Firebase service account JSON credentials.

**How to get it:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Copy the entire JSON content
6. Paste it as the secret value

**Example format:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

#### FIREBASE_PROJECT_ID
Your Firebase project ID (e.g., `my-investment-tracker`)

#### FIREBASE_STORAGE_BUCKET
Your Firebase storage bucket name (e.g., `my-investment-tracker.appspot.com`)

## Workflows

### Daily Data Collection
- **File**: `.github/workflows/daily-data-collection.yml`
- **Schedule**: Every day at 9:00 AM UTC (3:00 PM Sri Lanka Time)
- **Purpose**: Fetches CSE stock data with throttling
- **Manual Trigger**: Go to Actions → Daily Stock Data Collection → Run workflow

### Monthly Export
- **File**: `.github/workflows/monthly-export.yml`
- **Schedule**: First day of each month at 00:00 UTC
- **Purpose**: Aggregates monthly data and uploads to Firebase Storage
- **Manual Trigger**: Go to Actions → Monthly Data Export → Run workflow
- **Requires**: All three Firebase secrets above

## Testing Workflows

### Test Daily Collection Locally
```bash
npm run collect-data
```

### Test Monthly Export Locally
1. Set environment variables:
   ```bash
   export FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/service-account.json
   export FIREBASE_PROJECT_ID=your-project-id
   export FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   ```

2. Run the script:
   ```bash
   npm run monthly-export
   ```

## Workflow Permissions

The workflows require the following permissions (already configured):
- **contents: write** - To commit collected data back to the repository
- **actions: read** - To read workflow configuration

## Troubleshooting

### Daily Collection Not Running
1. Check if the workflow is enabled (Actions tab)
2. Verify GitHub Actions is enabled for your repository
3. Check workflow logs for errors

### Monthly Export Failing
1. Verify all three Firebase secrets are correctly set
2. Ensure Firebase Storage is enabled in your project
3. Check that the service account has necessary permissions
4. Review workflow logs for specific error messages

### Data Not Being Committed
1. Check repository permissions
2. Verify the GitHub Actions bot has write access
3. Review commit history in the Actions logs

## Security Notes

⚠️ **Never commit service account credentials to the repository**
- Service account JSON should only be added as a GitHub secret
- The `.gitignore` file is configured to exclude `service-account.json`
- The workflow creates the file temporarily and removes it after use

## API Integration

The current implementation uses mock data. To integrate with real CSE data:

1. Obtain API access from a financial data provider
2. Update `src/lib/stockData.ts` → `fetchCSEStockData()` function
3. Add API credentials as GitHub secrets if needed
4. Update the workflow to pass API credentials to the script
