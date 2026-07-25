# Vercel Deployment - Required Environment Variables

## 🔴 CRITICAL: Without These Steps, Production Auth Will Fail

The production `auth/api-key-not-valid` error is caused by missing environment variables in Vercel.

---

## Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Select: **dunia-boutique** project
3. Click: **Settings** (gear icon, top right)
4. Navigate: **Environment Variables**

---

## Step 2: Add These Variables

Create 6 environment variables with these exact names and values:

### 1. NEXT_PUBLIC_FIREBASE_API_KEY
```
Value: AIzaSyBS7z71Z886VuXTySpmxrC3Hf30gkNUCzE
Environments: Production, Preview, Development
```

### 2. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```
Value: dunia-boutique.firebaseapp.com
Environments: Production, Preview, Development
```

### 3. NEXT_PUBLIC_FIREBASE_PROJECT_ID
```
Value: dunia-boutique
Environments: Production, Preview, Development
```

### 4. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```
Value: dunia-boutique.firebasestorage.app
Environments: Production, Preview, Development
```

### 5. NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```
Value: 842999784659
Environments: Production, Preview, Development
```

### 6. NEXT_PUBLIC_FIREBASE_APP_ID
```
Value: 1:842999784659:web:37e2b6dbe988d89c362026
Environments: Production, Preview, Development
```

---

## Step 3: Verify All Variables Are Set

After adding, your Environment Variables should look like:

```
✓ NEXT_PUBLIC_FIREBASE_API_KEY (Production, Preview, Development)
✓ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (Production, Preview, Development)
✓ NEXT_PUBLIC_FIREBASE_PROJECT_ID (Production, Preview, Development)
✓ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (Production, Preview, Development)
✓ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (Production, Preview, Development)
✓ NEXT_PUBLIC_FIREBASE_APP_ID (Production, Preview, Development)
```

---

## Step 4: Trigger a Redeploy

1. Go to: **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots)
4. Select: **Redeploy**
5. Confirm: **Redeploy**

Wait for build to complete (2-3 minutes)

---

## Step 5: Test on Live Site

### Test Login:
1. Visit: https://your-domain.vercel.app/login
2. Enter credentials
3. Click "Login"
4. ✅ Should work without `auth/api-key-not-valid` error

### Test Signup:
1. Visit: https://your-domain.vercel.app/signup
2. Enter email, password, name
3. Click "Sign Up"
4. ✅ Should create account without Firebase errors

### Test Session:
1. After login, refresh page
2. ✅ Session should persist (you stay logged in)

### Test Media:
1. Visit: https://your-domain.vercel.app/admin/media
2. Admin login (if required)
3. Upload image
4. ✅ Images should appear on category pages

---

## Build Log Verification

After redeploy, check build logs:

1. Go to: **Deployments** > Latest > Build Logs
2. Look for this line:

```
[Firebase] Config loaded from environment: {
  source: 'environment variables',
  projectId: 'dunia-boutique',
  hasApiKey: true,
  hasProjectId: true,
  hasAll: true
}
```

✅ If you see `source: 'environment variables'` → Setup is correct!

❌ If you see `source: 'hardcoded fallback'` → Env vars not set, repeat steps above

---

## Troubleshooting

### Error: Still getting `auth/api-key-not-valid`

1. **Verify variables are saved:**
   - Go to Settings > Environment Variables
   - Confirm all 6 variables are showing

2. **Check if variables are in scope:**
   - Each variable should have checkmarks for: Production, Preview, Development

3. **Redeploy again:**
   - Sometimes Vercel cache needs clearing
   - Redeploy from Deployments tab

4. **Check browser console:**
   - Open DevTools > Console
   - Look for Firebase initialization logs
   - Should show `source: 'environment variables'`

### Build Fails

1. Check build logs in Deployments
2. Ensure no syntax errors in code
3. Run locally: `npm run build` to test

---

## Files Modified

- `lib/firebase.ts` - Now reads from environment variables
- `.env.production` - Documentation added
- All category pages - Already using dynamic image loading

---

## What Changed?

### Before (Broken in Production)
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBS7z71Z886VuXTySpmxrC3Hf30gkNUCzE",  // Hardcoded
  authDomain: "dunia-boutique.firebaseapp.com",
  ...
};
```

**Problem:** Vercel's build process doesn't embed hardcoded strings into browser code.

### After (Works in Production)
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBS7z71Z886VuXTySpmxrC3Hf30gkNUCzE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dunia-boutique.firebaseapp.com",
  ...
};
```

**Solution:** Explicitly read from environment variables that Vercel injects during build.

---

## Questions?

- Check `PRODUCTION_FIXES.md` for detailed technical documentation
- Review build logs in Vercel dashboard
- Check Firebase Console for auth settings
- Verify Firestore collection `websiteImages` exists

---

**Last Updated:** 2026-07-25
**Status:** Ready for deployment
