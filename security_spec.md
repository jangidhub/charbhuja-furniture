# Security Specification — Charbhuja Furniture

## 1. Data Invariants
1. **User PII Isolation**: Documents in `/users/{userId}` can only be read or written by the authenticated owner (`request.auth.uid == userId`) or authorized administrators. Users cannot self-escalate to `role: 'admin'`.
2. **Catalog Integrity**: Documents in `/products/{productId}` are readable by anyone (public catalog), but can strictly be created, updated, or deleted only by administrators (`isAdmin()`).
3. **Idea & Quotation Privacy**: Documents in `/customRequests/{requestId}` can only be read by the submitting user (`resource.data.userId == request.auth.uid`) or administrators (`isAdmin()`). Normal users cannot see or query requests from other users.
4. **Order Ownership**: Documents in `/orders/{orderId}` are readable strictly by the ordering customer (`resource.data.userId == request.auth.uid`) or administrators.
5. **Admin Master Gate**: An admin is verified either via the bootstrapped administrator email (`sudhanshujangid143@gmail.com`) or membership in `/admins/{adminId}`. Client-side claims are never trusted.
6. **Path Hardening**: All document keys must satisfy `isValidId(id)` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).

## 2. The "Dirty Dozen" Threat Payloads
1. **Ghost Admin Escalation**: Attacker attempts to update `/users/{attackerUid}` with `{ role: 'admin' }`. Rejected.
2. **Cross-Tenant Product Write**: Unauthenticated or normal customer attempts `create` or `delete` on `/products/sofa-01`. Rejected.
3. **Custom Idea Snooping**: User B attempts `get` or `list` on `/customRequests/req-from-user-A`. Rejected.
4. **Order Hijacking**: User B attempts to view or update status on `/orders/order-from-user-A`. Rejected.
5. **Payload Flooding (Denial of Wallet)**: Attacker sends a 5MB base64 string in description or name. Rejected by size limits.
6. **ID Injection Attack**: Attacker attempts path variable with non-alphanumeric chars or ../ traversal. Rejected by `isValidId()`.
7. **Orphaned Custom Request**: Request created without `request.auth.uid` matching `incoming().userId`. Rejected.
8. **Negative Product Price**: Attacker attempts to set product price `< 0` or NaN. Rejected.
9. **Direct Status Tampering**: Customer attempts to directly transition order status to 'delivered' or 'paid'. Rejected.
10. **Unauthenticated Idea Listing**: Anonymous visitor attempts `getDocs(collection(db, 'customRequests'))`. Rejected.
11. **Spoofed Email Write**: Attacker sends request with fabricated email header without `email_verified`. Blocked.
12. **Admin Lockdown Prevention**: Verified admin `sudhanshujangid143@gmail.com` retains override update capabilities across all operational records.
