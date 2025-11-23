# 🔐 Login Testing Guide for DirectConnect Rentals

## ⚠️ **Important: You Must Sign Up FIRST!**

You're getting the **"Invalid credentials"** error because you haven't created an account yet.

---

## 🚀 **Quick Start - Use Test Account**

A test account has been created for you:

```
📧 Email: test@example.com
🔑 Password: Test@1234
👤 Role: Owner
✅ Status: Verified
```

### **To Login:**
1. Go to your app
2. Click the **"Login"** tab
3. Enter:
   - Email: `test@example.com`
   - Password: `Test@1234`
4. Click **"Sign In"**

You should now be logged in! ✅

---

## 📝 **How to Create Your Own Account**

### **Step 1: Go to Sign Up**
Click the **"Sign Up"** tab on the auth page

### **Step 2: Fill in the Form**
- **Full Name**: Any name (e.g., "John Doe")
- **Email**: Any email (e.g., "yourname@email.com")
- **Password**: Must include:
  - ✅ At least 8 characters
  - ✅ At least 1 UPPERCASE letter (A-Z)
  - ✅ At least 1 lowercase letter (a-z)
  - ✅ At least 1 special character (!@#$%^&*)

  **Example**: `MyPassword@123`

- **Phone Number** (Optional): Indian format
  - Format: `+91 98765 43210`
  - Must be 10 digits after +91
  
- **Role**: Choose one:
  - **Owner**: If you want to list properties
  - **Tenant**: If you want to search & book properties

### **Step 3: Click "Create Account"**
Your account will be created and you'll be automatically logged in!

### **Step 4: You Can Now:**
- ✅ List properties (if Owner)
- ✅ Search properties (if Tenant)
- ✅ Chat with property owners
- ✅ Verify your phone with OTP
- ✅ View your profile

---

## 🔑 **Password Requirements**

Your password MUST have all of these:

❌ **Bad passwords:**
- `123456` (no letters or special chars)
- `password` (no uppercase or special chars)
- `Pass123` (no special character)
- `Pass!` (too short)

✅ **Good passwords:**
- `MyPassword@123`
- `Secure#Pass2024`
- `DirectConnect@1`
- `Test@1234`

---

## 💭 **Why the Error?**

When you try to login with an email that doesn't exist, you get:
```
"Invalid credentials"
```

This is intentional for security - it doesn't tell you if the email exists or not.

**Solution**: Sign up first, then login!

---

## 🔄 **Login vs Sign Up Flow**

```
┌─────────────────────────────────────┐
│         Auth Page                    │
├─────────────────┬───────────────────┤
│  Sign Up        │      Login         │
├─────────────────┼───────────────────┤
│ • Full Name     │ • Email            │
│ • Email         │ • Password         │
│ • Password      │                    │
│ • Phone         │ [Sign In]          │
│ • Role          │                    │
│ [Create Account]│                    │
└─────────────────┴───────────────────┘
```

**First time?** → Use **Sign Up**
**Returning?** → Use **Login**

---

## 🛠️ **Troubleshooting**

### "Invalid credentials" error
✅ **Fix**: Sign up first using the "Sign Up" tab

### "Email already registered" error
✅ **Fix**: Use "Login" tab instead, or use a different email for sign up

### "Password must be at least 8 characters..."
✅ **Fix**: Make your password longer and include uppercase, lowercase, and special character

### "Please enter a valid 10-digit Indian phone number"
✅ **Fix**: Use format `+91 XXXXX XXXXX` (e.g., +91 98765 43210)

---

## 📱 **Test Accounts Created**

| Email | Password | Role | Status |
|-------|----------|------|--------|
| test@example.com | Test@1234 | Owner | ✅ Verified |

---

## ✅ **After Login**

Once logged in, you can:

### **As Owner:**
1. Click "List Property" in dashboard
2. Fill in property details
3. Add images and amenities
4. Publish to database ✅
5. View your listings
6. Chat with interested tenants

### **As Tenant:**
1. Browse all properties
2. Click on properties to view details
3. Message property owners
4. Schedule viewings
5. Save favorite properties

---

## 🎯 **Next Steps**

1. **Login** with: `test@example.com` / `Test@1234`
2. **Create a property listing** (if Owner)
3. **Verify your phone** with OTP
4. **Chat with other users**
5. **View your profile**

Enjoy using DirectConnect Rentals! 🏠
