# Frontend-Backend Data Comparison & Error Analysis

This document compares what the frontend sends to the backend versus what the backend expects for all API endpoints.

---

## 1. Authentication Endpoints

### 1.1 Login (`POST /api/auth/login/`)

**Frontend Sends:**
```javascript
{
  username: string,  // from credentials.username
  password: string   // from credentials.password
}
```

**Backend Expects:**
```python
request.data.get('username')  # ✅ Matches
request.data.get('password')  # ✅ Matches
```

**Status:** ✅ **CORRECT** - Perfect match

---

### 1.2 Register (`POST /api/auth/register/`)

**Frontend Sends:**
```javascript
{
  username: string,
  email: string,
  password: string,
  password2: string,
  first_name: string,
  last_name: string,
  user_type: string  // 'student' or 'instructor'
}
```

**Backend Expects:**
```python
username = request.data.get('username')          # ✅
email = request.data.get('email')                 # ✅
password = request.data.get('password')          # ✅
password2 = request.data.get('password2')       # ✅
first_name = request.data.get('first_name', '') # ✅ (optional)
last_name = request.data.get('last_name', '')   # ✅ (optional)
user_type = request.data.get('user_type')       # ✅
```

**Backend Validation:**
- All of: `username, email, password, password2, user_type` are required
- Username cannot contain '@'
- Email must contain '@'
- Passwords must match
- Username/email must not already exist

**Status:** ✅ **CORRECT** - All fields match, validation aligns

---

### 1.3 Verify Email (`POST /api/auth/verify-email/`)

**Frontend Sends:**
```javascript
{
  uid: string,   // from URL params or query params
  token: string  // from URL params or query params
}
```

**Backend Expects:**
```python
uid = request.data.get('uid')    # ✅
token = request.data.get('token') # ✅
```

**Status:** ✅ **CORRECT** - Perfect match

---

### 1.4 Password Reset Request (`POST /api/auth/password-reset/`)

**Frontend Sends:**
```javascript
{
  email: string  // email.trim()
}
```

**Backend Expects:**
```python
email = request.data.get('email')  # ✅
```

**Backend Validation:**
- Email is required (but returns success even if user doesn't exist for security)

**Status:** ✅ **CORRECT** - Perfect match

---

### 1.5 Password Reset Validate (`POST /api/auth/password-reset/validate/`)

**Frontend Sends:**
```javascript
{
  uid: string,   // from URL query params
  token: string  // from URL query params
}
```

**Backend Expects:**
```python
uid = request.data.get('uid')    # ✅
token = request.data.get('token') # ✅
```

**Backend Returns:**
```python
{'valid': True, 'email': user.email}  # on success
{'valid': False, 'error': '...'}      # on failure
```

**Status:** ✅ **CORRECT** - Perfect match

---

### 1.6 Password Reset Confirm (`POST /api/auth/password-reset/confirm/`)

**Frontend Sends:**
```javascript
{
  uid: string,
  token: string,
  new_password: string,      // from newPassword state
  confirm_password: string   // from confirmPassword state
}
```

**Backend Expects:**
```python
uid = request.data.get('uid')               # ✅
token = request.data.get('token')           # ✅
new_password = request.data.get('new_password')      # ✅
confirm_password = request.data.get('confirm_password') # ✅
```

**Backend Validation:**
- All fields required
- `new_password` must match `confirm_password`
- Password must pass Django's `validate_password()` (min 8 chars, etc.)

**Status:** ✅ **CORRECT** - Perfect match

---

### 1.7 Token Refresh (`POST /api/auth/token/refresh/`)

**Frontend Sends:**
```javascript
{
  refresh: string  // refreshToken from localStorage
}
```

**Backend Expects:**
```python
# Django REST Framework SimpleJWT expects:
{'refresh': '<token>'}  # ✅
```

**Backend Returns:**
```python
{'access': '<new_access_token>', 'refresh': '<new_refresh_token>'}
```

**Status:** ✅ **CORRECT** - Standard JWT refresh flow

---

### 1.8 Logout (`POST /api/auth/logout/`)

**Frontend Sends:**
```javascript
{
  refresh: string  // refreshToken from localStorage
}
```

**Backend Expects:**
```python
refresh_token = request.data.get('refresh')  # ✅
```

**Status:** ✅ **CORRECT** - Perfect match

---

## 2. Google OAuth Endpoints

### 2.1 Get Google Auth URL (`GET /api/auth/google/url/`)

**Frontend Sends:** No body (GET request)

**Backend Returns:**
```python
{'auth_url': '<google_oauth_url>'}  # ✅
```

**Frontend Expects:** `response.data.auth_url` ✅

**Status:** ✅ **CORRECT** - Perfect match

---

### 2.2 Google Authenticate (`POST /api/auth/google/authenticate/`)

**Frontend Sends:**
```javascript
{
  code: string  // OAuth authorization code from Google
}
```

**Backend Expects:**
```python
code = request.data.get('code')  # ✅
```

**Backend Returns:**
```python
{
  'refresh': str(refresh),
  'access': str(refresh.access_token),
  'user': {...},
  'is_new_user': bool,
  'needs_user_type': bool
}
```

**Status:** ✅ **CORRECT** - Perfect match

---

### 2.3 Set User Type (`POST /api/auth/google/set-user-type/`)

**Frontend Sends:**
```javascript
{
  user_type: string  // 'student' or 'instructor'
}
```

**Backend Expects:**
```python
user_type = request.data.get('user_type')  # ✅ Required
# Validates: user_type must be in ['student', 'instructor']
```

**Backend Returns:**
```python
{
  'message': 'User type set successfully',
  'user': {...}  # Updated user object with user_type
}
```

**Status:** ✅ **CORRECT** - Perfect match

---

## 3. Profile Endpoints

### 3.1 Get User Data (`GET /api/user-data/`)

**Frontend Sends:** No body (GET request with Authorization header)

**Backend Returns:**
```python
{
  'id': user.id,
  'username': user.username,
  'email': user.email,
  'first_name': user.first_name,
  'last_name': user.last_name,
  'email_verify': user.email_verify,
  'user_type': user.user_type,
  'date_joined': user.date_joined,
}
```

**Frontend Expects:** `response.data` with all above fields ✅

**Status:** ✅ **CORRECT** - Perfect match

---

### 3.2 Update Profile (`PUT /api/profile/update/`)

**Frontend Sends:**
```javascript
{
  username: string,
  first_name: string,
  last_name: string,
  email: string
  // Note: user_type is NOT sent from ProfilePage.jsx
}
```

**Backend Expects:**
```python
username = request.data.get('username', '').strip()      # ✅
first_name = request.data.get('first_name', '').strip()   # ✅
last_name = request.data.get('last_name', '').strip()     # ✅
email = request.data.get('email', '').strip()             # ✅
user_type = request.data.get('user_type', '').strip()     # ⚠️ OPTIONAL - Frontend doesn't send it
```

**Backend Validation:**
- Username cannot contain '@'
- Email must contain '@'
- Username/email must not already exist (except for current user)
- If email changes, sends verification email

**Backend Returns:**
```python
{
  'message': 'Profile updated successfully!',
  'user': {
    'id': user.id,
    'username': user.username,
    'email': user.email,
    'first_name': user.first_name,
    'last_name': user.last_name,
    'email_verify': user.email_verify,
  }
}
```

**Frontend Expects:** `res.data.user` ✅

**Issue Found:** ⚠️ Frontend doesn't send `user_type` but backend accepts it (optional). This is fine since ProfilePage doesn't allow changing user_type.

**Status:** ✅ **CORRECT** - All sent fields match, optional fields handled properly

---

## 4. Instructor Time Slot Endpoints

### 4.1 Get User Slots (`GET /api/instructor/get-user-slots/`)

**Frontend Sends:** No body (GET request with Authorization header)

**Backend Returns:**
```python
{
  'slots': [
    {
      'id': slot.id,
      'course_name': slot.course_name,
      'section': slot.section,
      'day_of_week': slot.day_of_week,
      'start_time': slot.start_time,
      'end_time': slot.end_time,
      'duration_minutes': slot.duration_minutes,
      'start_date': slot.start_date,
      'end_date': slot.end_date,
      'room': slot.room,
      'status': slot.status,
      'created_at': slot.created_at,
      'require_specific_email': slot.policy.require_specific_email,
      'set_student_limit': slot.policy.set_student_limit,
    }
  ]
}
```

**Frontend Expects:** `res.data.slots` ✅

**Status:** ✅ **CORRECT** - Perfect match

---

### 4.2 Create Time Slot (`POST /api/instructor/time-slots/create-slot/`)

**Frontend Sends:**
```javascript
{
  course_name: string,
  section: string,          // Set to ' ' (space) if empty
  day_of_week: string,      // 'Mon', 'Tue', etc.
  start_time: string,       // Format: "HH:MM" (24-hour)
  end_time: string,         // Format: "HH:MM" (24-hour)
  duration_minutes: number, // Default: 10
  start_date: string,       // Format: "YYYY-MM-DD"
  end_date: string,         // Format: "YYYY-MM-DD"
  room: string
  // Note: set_student_limit is NOT sent
}
```

**Backend Expects:**
```python
course_name = request.data.get("course_name")           # ✅ REQUIRED
section = request.data.get("section", " ")             # ✅ Optional, defaults to " "
day_of_week = request.data.get("day_of_week")          # ✅ REQUIRED (must be in ['Mon', 'Tue', ...])
start_time = request.data.get("start_time")            # ✅ REQUIRED (time format)
end_time = request.data.get("end_time")                # ✅ REQUIRED (time format)
duration_minutes = request.data.get("duration_minutes", 10) # ✅ Optional, defaults to 10
start_date = request.data.get("start_date")            # ✅ REQUIRED (date format)
end_date = request.data.get("end_date")                # ✅ REQUIRED (date format)
room = request.data.get("room")                       # ✅ REQUIRED
set_student_limit = request.data.get("set_student_limit", 1) # ⚠️ NOT SENT BY FRONTEND, defaults to 1
```

**Issue Found:** ⚠️ Frontend doesn't send `set_student_limit`, but backend defaults it to 1, which is fine.

**Backend Validation:**
- Required: `course_name, start_time, end_time, day_of_week, start_date, end_date, room`
- `day_of_week` must be one of: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
- `set_student_limit` must be >= 1 (defaults to 1 if not provided)

**Backend Returns:**
```python
{'success': True, 'time_slot_id': time_slot.id}  # Status 201
```

**Frontend Expects:** `res.data.success` and `res.data.time_slot_id` ✅

**Status:** ✅ **CORRECT** - All required fields match, optional fields have defaults

---

### 4.3 Update Time Slot (`POST /api/instructor/time-slots/update-slot/${id}`)

**Frontend Sends:**
```javascript
{
  course_name: string,
  section: string,          // Set to ' ' (space) if empty
  day_of_week: string,
  start_time: string,      // Format: "HH:MM" (24-hour)
  end_time: string,        // Format: "HH:MM" (24-hour)
  duration_minutes: number,
  start_date: string,      // Format: "YYYY-MM-DD"
  end_date: string,        // Format: "YYYY-MM-DD"
  room: string
  // Note: set_student_limit is NOT sent
}
```

**Backend Expects:**
```python
course_name = request.data.get("course_name")           # ✅ REQUIRED
section = request.data.get("section", " ")             # ✅
day_of_week = request.data.get("day_of_week")          # ✅ REQUIRED
start_time = request.data.get("start_time")            # ✅ REQUIRED
end_time = request.data.get("end_time")                # ✅ REQUIRED
duration_minutes = request.data.get("duration_minutes", 10) # ✅
start_date = request.data.get("start_date")            # ✅ REQUIRED
end_date = request.data.get("end_date")                # ✅ REQUIRED
room = request.data.get("room")                       # ✅ REQUIRED
set_student_limit = request.data.get("set_student_limit", 1) # ⚠️ NOT SENT BY FRONTEND, defaults to 1
```

**Backend Validation:**
- Same as create slot
- Validates slot belongs to logged-in instructor

**Backend Returns:**
```python
{'success': True, 'time_slot_id': time_slot.id}  # Status 200
```

**Frontend Expects:** `res.data.success` and `res.data.time_slot_id` ✅

**Status:** ✅ **CORRECT** - All required fields match

---

### 4.4 Delete Time Slot (`DELETE /api/instructor/time-slots/delete-slot/${id}/`)

**Frontend Sends:** No body (DELETE request with ID in URL)

**Backend Expects:**
```python
slot_id  # From URL parameter <int:slot_id> ✅
```

**Backend Issues Found (REPORTED ONLY - NOT FIXED):**
1. **Line 57**: Returns `time_slot.id` AFTER deletion, which will cause AttributeError:
   ```python
   time_slot.delete()  # Object deleted
   return Response({'success': True, 'time_slot_id': time_slot.id}, ...)  # ❌ time_slot no longer exists
   ```
   **Fix Needed:** Save ID before deletion:
   ```python
   slot_id = time_slot.id
   time_slot.delete()
   return Response({'success': True, 'time_slot_id': slot_id}, ...)
   ```

2. **Line 55**: Error message says "Failed to update time slot" but should say "Failed to delete time slot"

3. **Line 41**: Docstring says "Handle update time slot" but should say "Handle delete time slot"

**Backend Returns:**
```python
{'success': True, 'time_slot_id': time_slot.id}  # Status 200
```

**Frontend Expects:** `res.data.success` ✅

**Status:** ⚠️ **BACKEND BUG** - Will crash when trying to access `time_slot.id` after deletion

---

### 4.5 Toggle Slot Status (`POST /api/instructor/time-slots/toggle-slot-status/${id}/`)

**Frontend Sends:** No body (POST request with ID in URL)

**Backend Expects:**
```python
slot_id  # From URL parameter <int:slot_id> ✅
```

**Backend Logic:**
```python
time_slot.status = not time_slot.status  # Toggles boolean
time_slot.save()
```

**Backend Returns:**
```python
{'success': True, 'time_slot_id': time_slot.id}  # Status 200
```

**Frontend Expects:** `res.data.success` ✅
**Frontend Logic:** Calculates new status from current slot status: `!slot?.status` ✅

**Status:** ✅ **CORRECT** - Perfect match

---

## 5. Summary of Issues Found

### 🟢 Correct Connections (No Issues)
- ✅ All authentication endpoints
- ✅ All password reset endpoints
- ✅ All Google OAuth endpoints
- ✅ Profile endpoints
- ✅ Get user slots
- ✅ Create time slot
- ✅ Update time slot
- ✅ Toggle slot status

### 🔴 Backend Bugs Found (NOT FIXED - REPORTED ONLY)

#### Bug 1: `delete_slot.py` Line 57 - Critical
**Problem:** Accessing `time_slot.id` after `time_slot.delete()` will cause AttributeError

**Current Code:**
```python
time_slot.delete()
return Response({'success': True, 'time_slot_id': time_slot.id}, ...)  # ❌ CRASHES
```

**Should Be:**
```python
slot_id = time_slot.id
time_slot.delete()
return Response({'success': True, 'time_slot_id': slot_id}, ...)  # ✅ WORKS
```

#### Bug 2: `delete_slot.py` Line 55 - Minor
**Problem:** Wrong error message
- Current: `'Failed to update time slot'`
- Should be: `'Failed to delete time slot'`

#### Bug 3: `delete_slot.py` Line 41 - Documentation
**Problem:** Wrong docstring
- Current: `"""Handle update time slot for the logged-in user."""`
- Should be: `"""Handle delete time slot for the logged-in user."""`

### ⚠️ Minor Notes

1. **Frontend doesn't send `set_student_limit`** for create/update slot
   - Backend defaults to 1, which is acceptable
   - Not an error, just a note

2. **Frontend doesn't send `user_type`** in profile update
   - Backend accepts it optionally
   - Not an error, ProfilePage simply doesn't allow changing user_type

---

## 6. Data Format Verification

### Date/Time Formats

**Frontend Sends:**
- Dates: `"YYYY-MM-DD"` (e.g., "2024-01-15") ✅
- Times: `"HH:MM"` (24-hour format, e.g., "14:00") ✅

**Backend Expects:**
- Dates: `format='date'` (accepts "YYYY-MM-DD") ✅
- Times: `format='time'` (accepts "HH:MM:SS" or "HH:MM") ✅

**Status:** ✅ **COMPATIBLE** - Formats match

### Boolean Values

**Frontend:**
- Uses JavaScript booleans: `true`/`false` ✅

**Backend:**
- Uses Python booleans: `True`/`False` ✅

**Status:** ✅ **COMPATIBLE** - JSON serialization handles conversion

---

## 7. Authentication Headers

**Frontend:**
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
```

**Backend:**
```python
# Uses rest_framework_simplejwt.authentication.JWTAuthentication
# Expects: Authorization: Bearer <token>
```

**Status:** ✅ **CORRECT** - Standard JWT Bearer token format

---

## 8. Error Response Handling

**Backend Error Format:**
```python
{'error': 'Error message'}  # Single error string
# OR
{'error': ['error1', 'error2']}  # Array of errors (some endpoints)
```

**Frontend Handling:**
```javascript
err.response?.data?.error || err.response?.data?.message || 'Default error'
```

**Status:** ✅ **CORRECT** - Frontend handles both single errors and arrays

---

## 9. Success Response Handling

All endpoints return consistent success formats:
- `{'success': True, ...}` ✅
- `{'message': '...', ...}` ✅
- Frontend checks for both ✅

**Status:** ✅ **CORRECT** - Consistent response handling

---

## Conclusion

**Total Endpoints Analyzed:** 18
**Correctly Connected:** 17
**Backend Bugs Found:** 3 (all in `delete_slot.py`, 1 critical)
**Data Format Issues:** 0
**Missing Required Fields:** 0

**Overall Status:** ✅ Frontend is correctly connected to backend. All data formats match. Only issues are backend bugs in delete endpoint that need to be fixed in backend code.

