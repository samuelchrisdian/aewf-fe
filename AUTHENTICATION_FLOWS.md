// AUTHENTICATION FLOW DIAGRAMS

/**
 * ============================================
 * USER AUTHENTICATION FLOW
 * ============================================
 */

/*

┌─────────────────────────────────────────────────────────────┐
│                    App Initialization                       │
│            (src/App.tsx wraps with AuthProvider)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              AuthProvider Mounts                            │
│      Tries to restore session from localStorage             │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────┴─────┐
                    │           │
                    ▼           ▼
            ┌───────────────┐  ┌──────────────────┐
            │ Session Found │  │ No Session       │
            │ (logged in)   │  │ (not logged in)  │
            └────────┬──────┘  └────────┬─────────┘
                     │                  │
                     ▼                  ▼
            ┌──────────────────┐   ┌──────────────────┐
            │  Set isAuthTrue   │   │ Redirect to      │
            │  Show Dashboard   │   │ /login           │
            └──────────────────┘   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │   LoginPage      │
                                   │  (user enters    │
                                   │   credentials)   │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │ Validate         │
                                   │ Email/Password   │
                                   └───┬──────────┬───┘
                                       │          │
                        ┌──────────────┘          └──────────────┐
                        │                                        │
                        ▼                                        ▼
                ┌───────────────────┐              ┌──────────────────┐
                │  Valid            │              │ Invalid          │
                │  Generate token   │              │ Show error       │
                │  Save to storage  │              │ Stay on page     │
                │  Set isAuthTrue   │              └──────────────────┘
                │  Redirect to /    │
                └───────────────────┘

*/

/**
 * ============================================
 * PROTECTED ROUTE CHECK
 * ============================================
 */

/*

Route: /alerts

┌─────────────────────────────────────────────────┐
│        ProtectedRoute Component                 │
│    (checks isAuthenticated from context)        │
└────────────────────┬────────────────────────────┘
                     │
                  ┌──┴──┐
                  │     │
                  ▼     ▼
         ┌─────────────┐  ┌──────────────┐
         │ Checking    │  │ isLoading?   │
         │ isLoading   │  └──────┬───────┘
         └─────────────┘         │
                              ┌──┴──┐
                              │     │
                              ▼     ▼
                       ┌────────┐  ┌──────────┐
                       │ Show   │  │isAuth?   │
                       │Spinner │  └──┬───┬──┘
                       └────────┘     │   │
                                  ┌───┘   └──┐
                                  │           │
                                  ▼           ▼
                            ┌─────────┐  ┌──────────┐
                            │ Render  │  │ Redirect │
                            │ Content │  │ to /login│
                            └─────────┘  └──────────┘

*/

/**
 * ============================================
 * LOGOUT FLOW
 * ============================================
 */

/*

┌──────────────────────────────┐
│  User clicks Logout Button   │
│   (in Layout sidebar menu)   │
└──────────────┬───────────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Call logout()       │
    │  from useAuth hook   │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  AuthProvider.logout()       │
    │  - Clear localStorage        │
    │  - Dispatch LOGOUT action    │
    │  - Clear user/token state    │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  useNavigate() redirects     │
    │  to /login                   │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  Back at LoginPage           │
    │  isAuthenticated = false     │
    │  localStorage cleared        │
    └──────────────────────────────┘

*/

/**
 * ============================================
 * STATE MANAGEMENT (AuthProvider)
 * ============================================
 */

/*

Initial State:
{
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false
}

After login dispatch LOGIN_SUCCESS:
{
  user: { id: 1, email: "...", name: "Teacher One", role: "teacher" },
  token: "eyJ...",
  isLoading: false,
  error: null,
  isAuthenticated: true
}

After logout dispatch LOGOUT:
{
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false
}

*/

/**
 * ============================================
 * COMPONENT HIERARCHY
 * ============================================
 */

/*

<App>
  │
  └─ <BrowserRouter>
     │
     └─ <AuthProvider>                    (provides context)
        │
        ├─ <Route path="/login">
        │  └─ <LoginPage>                 (uses useAuth to login)
        │     └─ (renders login form)
        │
        └─ <Route path="/">
           │
           └─ <ProtectedRoute>            (checks isAuthenticated)
              │
              └─ <Layout>                 (uses useAuth to display profile + logout)
                 │
                 ├─ Sidebar
                 │  ├─ Navigation Links
                 │  └─ User Profile        (shows user.name and user.role)
                 │     └─ Logout Menu
                 │
                 └─ <Outlet>               (renders nested routes)
                    ├─ <OverviewPage>
                    ├─ <AlertsFeature>
                    └─ <StudentDetailFeature>

*/

/**
 * ============================================
 * DATA FLOW - LOGIN
 * ============================================
 */

/*

User Input
   │
   ├─ email
   └─ password
   
   │
   ▼
LoginPage Component
   │
   └─ validateForm()
      ├─ Check not empty
      ├─ Check email format
      └─ Display errors if invalid
   
   │
   ▼
call useAuth().login(credentials)
   │
   ▼
AuthProvider.login()
   │
   ├─ dispatch LOGIN_START
   ├─ call api.login(credentials)
   │
   ▼
api.ts (mock mode)
   │
   ├─ Find user in mockUsers
   ├─ Validate password
   └─ Generate token
   
   │
   ▼
localStorage updated
   ├─ auth_token: token
   └─ user: user object
   
   │
   ▼
dispatch LOGIN_SUCCESS
   │
   ├─ Set user in state
   ├─ Set token in state
   ├─ Set isAuthenticated = true
   └─ Clear errors
   
   │
   ▼
useAuth() hook returns updated context
   │
   ▼
LoginPage useEffect detects isAuthenticated = true
   │
   ▼
navigate('/') redirects to dashboard
   │
   ▼
ProtectedRoute allows access
   │
   ▼
Layout renders with user profile
   │
   └─ Shows user.name and user.role in sidebar

*/

/**
 * ============================================
 * LOCAL STORAGE STRUCTURE
 * ============================================
 */

/*

After Login:

localStorage = {
  "auth_token": "eyJpZCI6MSwiZW1haWwiOiJ0ZWFjaGVyMUBzY2hvb2wuY29tIiwiZXhwIjoxNjk5NjAwMDAwfQ==",
  "user": "{\"id\":1,\"email\":\"teacher1@school.com\",\"name\":\"Teacher One\",\"role\":\"teacher\"}"
}

After Logout:

localStorage = {}

(Both keys are removed)

*/

/**
 * ============================================
 * ERROR HANDLING FLOW
 * ============================================
 */

/*

LoginPage renders
   │
   └─ state: { email: "", password: "", validationError: "", error: "" }
   
   User clicks Sign In
   │
   └─ handleSubmit() called
      │
      ├─ clearError() - clears context error
      ├─ validateForm()
      │
      ├─ if invalid
      │  └─ setValidationError("message")
      │     └─ displayed as validation error
      │
      └─ if valid
         └─ call login()
            │
            ├─ if success
            │  └─ navigate to /
            │
            └─ if error
               └─ Error from context displayed
                  (via error state)

*/
