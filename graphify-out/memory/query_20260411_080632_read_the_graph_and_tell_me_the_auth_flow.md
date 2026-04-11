---
type: "query"
date: "2026-04-11T08:06:32.845824+00:00"
question: "Read the graph and tell me the auth flow"
contributor: "graphify"
source_nodes: ["useCurrentUser()", "apiGetUser()", "ClerkAuthGuard", "UsersController", "UsersService"]
---

# Q: Read the graph and tell me the auth flow

## Answer

Graph-backed auth flow: auth pages (SignIn, SignUp, SSO callback) lead into useCurrentUser/apiGetUser on web_v2; API v2 uses ClerkAuthGuard canActivate with ClerkService getClient/isConfigured; UsersController getMe and handleClerkWebhook delegate to UsersService getMe/upsertFromClerk.

## Source Nodes

- useCurrentUser()
- apiGetUser()
- ClerkAuthGuard
- UsersController
- UsersService