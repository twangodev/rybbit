# Google Search Console Setup Guide

## 🎉 What's New

I've completely implemented Google Search Console integration with **real OAuth2 authentication**! No more API keys - it now fetches actual data from Google Search Console.

## 🚀 Quick Setup

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Search Console API:
   - Go to "APIs & Services" > "Library"
   - Search for "Search Console API"
   - Click "Enable"

### 2. Create OAuth2 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - **Development**: `http://localhost:3001/api/search-console/oauth/callback`
   - **Production**: `https://yourdomain.com/api/search-console/oauth/callback`
5. Copy the **Client ID** and **Client Secret**

### 3. Add Environment Variables
Add these to your `.env` file:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
BASE_URL=http://localhost:3001  # or your production URL
```

### 4. Restart Your Server
```bash
npm run build
npm run dev
```

## 🔗 How to Connect

1. Go to your Search Console page in Rybbit
2. Click the **"Connect"** button
3. You'll be redirected to Google to authorize
4. Grant permission to access your Search Console data
5. You'll be redirected back and see your real data!

## 📊 What You'll See

- **Real search performance data** from Google Search Console
- **Total clicks, impressions, CTR, and average position**
- **Top performing queries** that drive traffic to your site
- **Top performing pages** in search results
- **Automatic data updates** when you refresh

## 🔧 Features

- ✅ **Secure OAuth2 authentication** (no API keys needed)
- ✅ **Real-time data** from Google Search Console
- ✅ **Automatic token refresh** (handles expired tokens)
- ✅ **Connection status** (shows if you're connected)
- ✅ **Disconnect option** (remove access anytime)
- ✅ **Error handling** (clear error messages)

## 🐛 Troubleshooting

### "Connection Failed" Error
- Make sure your Google Cloud Console project has Search Console API enabled
- Check that your redirect URI is correct in OAuth2 credentials
- Verify your environment variables are set correctly

### "No Data Available"
- Make sure your website is verified in Google Search Console
- Check that you have search data for the selected date range
- Verify your domain matches what's in Google Search Console

### OAuth2 Redirect Issues
- Ensure `BASE_URL` in your `.env` matches your actual server URL
- Check that the redirect URI in Google Cloud Console matches exactly

## 🎯 Next Steps

Once connected, you can:
- View your search performance metrics
- Analyze top queries and pages
- Track your search rankings over time
- Optimize your content based on search data

The integration is now fully functional and will show real data from your Google Search Console!
