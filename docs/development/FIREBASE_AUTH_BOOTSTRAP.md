# Firebase Auth Bootstrap — Operator Procedure

This procedure creates the first internal application user without Cloud Functions or Admin SDK.

## 1. Enable Email/Password provider

In Firebase Console for `nocschedule1`:

```text
Authentication
→ Sign-in method
→ Email/Password
→ Enable
```

Do not enable public application self-registration. Firebase Console user creation remains an
operator action.

## 2. Create Firebase Authentication user

Create the internal user in Firebase Console and copy the generated Firebase UID.

The application never stores the user's password.

## 3. Create role document

In Firestore Console create:

```text
roles/ADMINISTRATOR
```

Fields:

```text
roleId = "ADMINISTRATOR"
label  = "Administrator"
active = true
grants = [
  "auth.login:SELF",
  "auth.logout:SELF",
  "profile.view_self:SELF",
  "dashboard.view:ALL",
  "access.view:ALL"
]
```

WP-F07+ expands the operational permission set as owning features become real. Deny-by-default
remains safer than pre-granting capabilities whose persistence rules do not exist yet.

## 4. Create access document

Create:

```text
access/<FIREBASE_UID>
```

Fields:

```text
uid        = "<FIREBASE_UID>"
employeeId = "employee-bootstrap-001"
roleId     = "ADMINISTRATOR"
status     = "ACTIVE"
revision   = 0
```

The Firebase UID in the field and document ID must match.

The Employee record itself is introduced in WP-F07. The stable employeeId is reserved now so Auth
identity remains separate from business identity.

## 5. Deploy Firestore Rules

After WP-F06 repository QA is green:

```powershell
npm run firebase:deploy:firestore
```

## 6. Manual acceptance

Validate:

1. unknown/not-signed-in browser opens Login;
2. valid Firebase user without `access/{uid}` is denied;
3. valid ACTIVE user with valid role can enter;
4. changing access status to INACTIVE and refreshing blocks the app;
5. browser client cannot write `access/**` or `roles/**`;
6. logout returns to Login.

Do not create production test users from CI.
