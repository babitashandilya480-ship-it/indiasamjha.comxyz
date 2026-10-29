# Samjha AI — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Default-Deny Catch-All**: All paths not explicitly matched (`/{document=**}`) deny all `read` and `write` operations (`if false`).
2. **Verified Authentication Gate**: All writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **Path Variable Hardening (`isValidId`)**: Every single-document operation (`get`, `create`, `update`, `delete`) validates path IDs (`userId`, `conversationId`, `messageId`, `feedbackId`, `memoryId`) against `^[a-zA-Z0-9_\-]+$` with length `1..128`.
4. **Master Gate Relational Sync**: A `ChatMessage` in `/conversations/{conversationId}/messages/{messageId}` cannot be read, created, updated, or deleted unless the parent `/conversations/{conversationId}` document exists and its `ownerId == request.auth.uid`.
5. **Strict Key & Schema Blueprint (`isValid[Entity]`)**: Every `create` and `update` call validates exact keys (`hasAll` + `hasOnly`), field types, string `.size()` bounds, enum memberships, and owner identity (`ownerId == request.auth.uid` or `uid == request.auth.uid`).
6. **Temporal & Immortal Fields**: `createdAt` must equal `request.time` on `create` and remain immutable (`incoming().createdAt == existing().createdAt`) on `update`. `updatedAt` must equal `request.time` on `create` and `update`. `ownerId`, `uid`, and `conversationId` are immutable on `update`.
7. **Secure List Queries**: Every `allow list` rule enforces `resource.data.ownerId == request.auth.uid` (without `get()`/`exists()` inside `list`) so clients cannot scrape other users' conversations, feedback, or memories.

## 2. The "Dirty Dozen" Payloads (Adversarial Test Vectors)

1. **Shadow Field Injection on `UserProfile`**: `{ uid: "user_1", displayName: "Aman", language: "Hinglish", preferredMode: "standard", isAdmin: true, createdAt: SERVER_TIME, updatedAt: SERVER_TIME }` -> Rejected by `hasOnly()`.
2. **Unverified Email Write**: Authenticated user with `email_verified: false` attempting `create` on `/conversations/conv_1` -> Rejected by `isVerifiedUser()`.
3. **Identity Spoofing on `Conversation`**: Authenticated `user_1` creating `/conversations/conv_1` with `ownerId: "user_2"` -> Rejected by `data.ownerId == request.auth.uid`.
4. **ID Poisoning Attack**: Creating `/memories/invalid$id!with*spaces` -> Rejected by `isValidId(memoryId)`.
5. **Orphaned Subcollection Message Write**: Creating `/conversations/non_existent_conv/messages/msg_1` -> Rejected by Master Gate `exists()` and `get().data.ownerId == request.auth.uid`.
6. **Cross-Tenant Subcollection Read**: `user_2` attempting `get` on `/conversations/conv_owned_by_user_1/messages/msg_1` -> Rejected by Master Gate parent owner check.
7. **Value Poisoning on Update**: Updating `Conversation.title` with a 5,000-character string or boolean -> Rejected by `isValidConversation(incoming())` wrapping `allow update`.
8. **Immortal Field Mutation**: Updating `Conversation.ownerId` or `Conversation.createdAt` -> Rejected by `incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt` and `affectedKeys().hasOnly(...)`.
9. **Client Timestamp Forgery**: Creating a `MemoryItem` with `createdAt: Timestamp.fromMillis(1000)` instead of `request.time` -> Rejected by `incoming().createdAt == request.time`.
10. **Unauthorized Blanket List Query**: Running an unfiltered `list` query on `/conversations` or `/memories` across all users -> Rejected by `resource.data.ownerId == request.auth.uid`.
11. **Invalid Enum Injection**: Creating a `FeedbackItem` with `approvalStatus: "auto_deployed"` or `rating: 999` -> Rejected by enum allowlist and integer range check `1 <= rating <= 5`.
12. **Terminal State / Action Bypass on Feedback**: Attempting to mutate `promptText` or `ownerId` during a status update on `/feedback/{feedbackId}` -> Rejected by action-based `affectedKeys().hasOnly(['approvalStatus', 'consentForTraining', 'rating', 'updatedAt'])`.
