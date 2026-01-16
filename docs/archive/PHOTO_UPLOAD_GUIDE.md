# Employee Photo Upload - User Guide

## 🎯 Quick Start

The employee photo upload feature is now fully functional! Here's how to use it:

---

## 📸 Adding a Photo to New Employee

1. **Navigate to Employees Page**
   - Go to http://localhost:5173/employees

2. **Click "Add Employee"**
   - Green button in the top right corner

3. **Upload Photo** (in the dialog)
   - Click the **"Upload Photo"** button with camera icon
   - Select an image file from your computer
   - Supported formats: JPEG, JPG, PNG, GIF, WebP
   - Max size: 5MB
   - Photo preview appears immediately

4. **Fill Employee Details**
   - Complete all required fields across 3 tabs:
     - Personal Information
     - Contact Information
     - Employment Details

5. **Save**
   - Click the "Save" button
   - Employee is created first
   - Photo is automatically uploaded and optimized
   - Success notification appears

---

## 🔄 Updating Photo for Existing Employee

1. **Edit Employee**
   - Click the edit (pencil) icon on any employee row
   - Or click "View" then edit

2. **Current Photo Loads**
   - If employee has a photo, it displays in the preview section

3. **Replace Photo** (optional)
   - Click "Upload Photo" to select new image
   - New photo preview replaces old one
   - Old photo will be deleted when you save

4. **Remove Photo** (optional)
   - Click the red "Remove" button
   - Photo preview clears

5. **Save Changes**
   - Click "Save" to apply changes

---

## 👁️ Viewing Photos

### In Employee List (DataTable)
- **Photo Column**: First column shows circular avatars
- **With Photo**: 50px circular image with blue border
- **Without Photo**: Blue gradient placeholder with user icon

### In Employee Dialog
- **Preview Section**: 150px circular photo at the top
- **Quick Info Cards**: Shows employee ID, name, department below photo

---

## 🎨 Photo Specifications

### Accepted Files
- **Formats**: JPEG, JPG, PNG, GIF, WebP
- **Max Size**: 5MB before upload
- **Validation**: Client and server-side checking

### Automatic Optimization
- **Resize**: 400x400 pixels (square)
- **Crop**: Cover fit, centered
- **Format**: JPEG
- **Quality**: 85%
- **Final Size**: ~20-50KB (60-70% reduction)

---

## 🔍 Photo Storage

### Location
```
backend/uploads/employees/
├── optimized-1736469123456-123456789.jpg
├── optimized-1736469234567-234567890.jpg
└── ...
```

### File Naming
- Prefix: `optimized-`
- Timestamp: Unix timestamp
- Random: 9-digit number
- Extension: `.jpg`

### URL Path
```
http://localhost:5000/uploads/employees/optimized-filename.jpg
```

---

## ✅ Validation & Error Handling

### Client-Side Validation
- ✅ File type check (images only)
- ✅ File size limit (5MB)
- ✅ Preview generation
- ✅ Clear error messages

### Server-Side Validation
- ✅ File type verification
- ✅ Size limit enforcement
- ✅ Authentication required
- ✅ Employee existence check

### Error Scenarios

**Photo Upload Fails**
- ❌ Employee is still created/updated
- ⚠️ Warning toast: "Employee saved but photo upload failed"
- ✓ You can edit employee and upload photo later

**Invalid File Type**
- ❌ Upload rejected
- ⚠️ Error: "Only image files are allowed"

**File Too Large**
- ❌ Upload rejected
- ⚠️ Error: "File size exceeds 5MB limit"

---

## 🎯 Best Practices

### Photo Quality
- ✅ Use recent, professional photos
- ✅ Well-lit, clear face shots
- ✅ Neutral background preferred
- ✅ Square aspect ratio works best

### File Size
- ✅ 1-3MB original files are ideal
- ✅ System automatically optimizes
- ✅ No need to resize before upload

### When to Upload
- ✅ **During creation**: Upload with initial employee data
- ✅ **After creation**: Edit employee anytime to add photo
- ✅ **Periodic updates**: Replace photos as needed (new ID, appearance change)

---

## 🔧 Troubleshooting

### Photo Not Showing in Table
**Check:**
1. Photo uploaded successfully? (check toast notification)
2. Refresh the page (F5)
3. Check browser console for errors
4. Verify backend server is running (port 5000)

### Upload Button Not Working
**Check:**
1. File input is hidden (this is normal)
2. Try different image file
3. Check file size < 5MB
4. Verify file is actually an image

### Photo Preview Not Appearing
**Check:**
1. File is valid image format
2. Browser supports FileReader API
3. Check browser console for errors

### Slow Upload
**Reason:**
- Large file size (3-5MB files take 2-3 seconds)
- Network speed
- Image optimization processing

**Solution:**
- Wait for upload to complete
- Use smaller images if possible
- Upload will continue in background

---

## 📊 Performance Tips

### For Faster Uploads
1. **Resize images before upload** (optional)
   - 800x800 or 1000x1000 is plenty
   - Reduces upload time

2. **Use JPEG format** (optional)
   - Smaller than PNG for photos
   - System converts to JPEG anyway

3. **Batch operations**
   - Upload photos during employee creation
   - Avoid editing just to add photo later

---

## 🚀 Advanced Features

### Photo Management API

**Upload Photo**
```bash
POST http://localhost:5000/api/employees/:id/photo
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: photo (file)
```

**Delete Photo**
```bash
DELETE http://localhost:5000/api/employees/:id/photo
Authorization: Bearer <token>
```

### Direct File Access
```
http://localhost:5000/uploads/employees/optimized-filename.jpg
```

---

## 📱 Mobile Support

The photo upload feature is fully responsive:

- ✅ **Mobile browsers**: Camera option appears in file picker
- ✅ **Tablet**: Touch-optimized buttons
- ✅ **Desktop**: Standard file selection

### Mobile Tips
1. Use "Take Photo" option in file picker
2. Photos from camera are auto-optimized
3. Preview works on all devices

---

## 🎨 UI Elements

### Photo Upload Section
- **Location**: Top of employee dialog, above tabs
- **Layout**: Photo preview on left, buttons on right
- **Style**: Medical blue gradient theme
- **Responsive**: Stacks on mobile

### Quick Info Cards
- **Employee ID**: Gray card with hashtag icon
- **Name**: Blue card with user icon
- **Department**: Cyan card with building icon

### Photo Column
- **Position**: First column in table
- **Width**: 80px
- **Avatar**: 50px circular
- **Fallback**: User icon in gradient circle

---

## ✨ Visual Examples

### Photo States

**With Photo**
```
┌─────────────┐
│   [Photo]   │  ← Circular avatar
│   Employee  │  ← Name
│   #EMP001   │  ← ID
└─────────────┘
```

**Without Photo**
```
┌─────────────┐
│    [👤]     │  ← User icon placeholder
│   Employee  │  ← Name
│   #EMP001   │  ← ID
└─────────────┘
```

### Upload Flow
```
1. Click "Upload Photo"
     ↓
2. Select image file
     ↓
3. Preview appears instantly
     ↓
4. Fill other fields
     ↓
5. Click "Save"
     ↓
6. Employee saved
     ↓
7. Photo uploaded & optimized
     ↓
8. Success notification
     ↓
9. Photo appears in table
```

---

## 🎉 Summary

The employee photo upload system provides:

✅ **Easy Upload**: Click, select, done
✅ **Instant Preview**: See photo before saving
✅ **Auto Optimization**: No manual resizing needed
✅ **Professional Display**: Circular avatars throughout
✅ **Mobile Support**: Works on all devices
✅ **Error Handling**: Graceful failure recovery
✅ **Performance**: Fast uploads, optimized storage

**Start using it now at http://localhost:5173/employees** 🚀
