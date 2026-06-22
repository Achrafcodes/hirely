# Hustl — Messaging System

Read DESIGN_SYSTEM.md before writing a single line of code.
Every color, font, radius, and spacing decision comes from there.

---

## What we're building

A real-time messaging system between employers and candidates.
Employers can message candidates from the applicant pipeline.
Candidates can message employers from the job detail page.
Both parties manage conversations from a shared inbox UI.

---

## Tech stack

- Next.js App Router (all new files go in /src/app)
- Supabase (database + Supabase Realtime for live messages)
- Tailwind CSS (design tokens from DESIGN_SYSTEM.md)
- Clerk (auth — user ID comes from Clerk, already set up)

---

## Database schema

Create these tables in Supabase:

```sql
-- Conversations between one employer and one candidate
create table conversations (
  id uuid primary key default gen_random_uuid(),
  employer_id text not null,       -- Clerk user ID
  candidate_id text not null,      -- Clerk user ID
  job_id uuid references jobs(id), -- optional: context job
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(employer_id, candidate_id, job_id)
);

-- Individual messages inside a conversation
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id text not null,         -- Clerk user ID
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Indexes for performance
create index on messages(conversation_id, created_at);
create index on conversations(employer_id);
create index on conversations(candidate_id);
```

Enable Realtime on the messages table in Supabase dashboard:
Database → Replication → enable messages table.

---

## File structure to create

```
src/
  app/
    messages/
      page.tsx                  -- inbox layout (conversation list + thread)
      loading.tsx               -- skeleton loader
    api/
      conversations/
        route.ts                -- GET list, POST create
      messages/
        route.ts                -- GET history, POST send
  components/
    messaging/
      InboxLayout.tsx           -- two-panel wrapper
      ConversationList.tsx      -- left sidebar
      ConversationItem.tsx      -- single row in list
      MessageThread.tsx         -- right panel, message history
      MessageBubble.tsx         -- individual message
      MessageInput.tsx          -- textarea + send button
      UnreadBadge.tsx           -- red dot on nav icon
  lib/
    supabase/
      messaging.ts              -- all DB query functions
```

---

## API routes

### GET /api/conversations
Returns all conversations for the current user (employer or candidate).
Include last message preview and unread count.

```ts
// Returns:
[
  {
    id: string,
    job: { id, title, company },
    participant: { id, name, avatar },  -- the other person
    lastMessage: { content, created_at, sender_id },
    unreadCount: number
  }
]
```

### POST /api/conversations
Create a new conversation or return existing one.

```ts
// Body:
{ recipientId: string, jobId?: string }

// Returns:
{ conversationId: string }
```

### GET /api/messages?conversationId=xxx
Returns paginated message history for a conversation.
Mark all messages as read where sender_id !== current user.
Limit 50 messages, ordered by created_at asc.

### POST /api/messages
Send a new message.

```ts
// Body:
{ conversationId: string, content: string }

// Returns:
{ message: Message }
```

---

## Components

### InboxLayout.tsx
Two-panel layout. Left panel is conversation list (320px fixed width).
Right panel fills remaining space with the active thread.
On mobile: show list OR thread, not both. Use a back button to return
to list.

```tsx
<div className="flex h-[calc(100vh-64px)]">
  <ConversationList />
  <MessageThread />
</div>
```

No card wrapper on the outer container — it fills the viewport.
Use border-right: 1px #2A2A2A to divide panels.

### ConversationList.tsx
Scrollable list of conversations.
Header: "Messages" in text-h2 DM Sans 500.
Search input at top to filter by name or job title.
Each row is a ConversationItem.
Active conversation: bg #1C1C1C, border-left 2px #E8A030.
Supabase Realtime subscription here to refresh unread counts live.

### ConversationItem.tsx
```
[Avatar 36px] [Name + job title]        [Time]
              [Last message preview...]  [Unread badge]
```
Avatar: initials circle, bg #1C1C1C, border 1px #2A2A2A, radius 4px
        (not circle — square with radius 4px, matches design system)
Name: 14px DM Sans 500 text-primary
Job title: 11px DM Mono all-caps text-secondary
Last message: 13px DM Sans text-secondary, truncate at 1 line
Time: 11px DM Mono text-secondary
Unread badge: bg #E8A030, text #0C0C0C, 18px circle, 11px font, 
              only show if unreadCount > 0
Hover: bg #1C1C1C transition 150ms

### MessageThread.tsx
Header: shows the other person's name + job context.
        "Mark as resolved" button (secondary style) top right.
Body: scrollable message history, auto-scroll to bottom on new message.
      Group messages by date (show date divider: "Today", "Yesterday",
      "June 20").
Footer: MessageInput component pinned to bottom.

Supabase Realtime subscription:
```ts
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    setMessages(prev => [...prev, payload.new])
  })
  .subscribe()
```

### MessageBubble.tsx
Sent (current user): aligned right, bg #3D2E0F, text #F5C76E,
                     radius 8px 8px 2px 8px
Received: aligned left, bg #1C1C1C, text text-primary,
          radius 8px 8px 8px 2px
Content: 14px DM Sans 400, line-height 1.5
Time: 10px DM Mono text-secondary, shown below bubble
No avatars on individual bubbles — too noisy.

### MessageInput.tsx
Textarea (auto-resize, max 4 lines) + send button on the right.
Placeholder: "Write a message..."
Send on Enter key (Shift+Enter for new line).
Send button: amber primary style, "Send →", disabled when empty.
Border-top: 1px #2A2A2A separating input from thread.
bg: #0C0C0C (inset surface)

### UnreadBadge.tsx
Small amber dot on the Messages nav icon.
Fetches total unread count across all conversations on mount.
Refreshes via Supabase Realtime subscription.
Show number if > 0, hide entirely if 0.

---

## Trigger points (where messaging starts)

### From employer side (applicant pipeline):
Add "Message" button to each applicant row:
```tsx
<button onClick={() => startConversation(candidateId, jobId)}>
  Message →
</button>
```
startConversation calls POST /api/conversations then redirects to
/messages?conversation=xxx

### From candidate side (job detail page):
Add "Message Employer" button below the Apply button.
Only show if candidate has already applied to this job.
Same flow: POST /api/conversations → redirect to /messages?conversation=xxx

---

## Loading states

Use existing Hustl skeleton system.
ConversationList skeleton: 5 rows of ConversationItem shape,
animate-pulse, bg #1C1C1C blocks.
MessageThread skeleton: alternating left/right bubble shapes,
3-4 bubbles, animate-pulse.

---

## Empty states

No conversations yet:
```
[icon: ti-message]
"No messages yet"
"Start a conversation from any job listing or applicant profile."
```

No conversation selected (desktop):
```
[icon: ti-message-2]
"Select a conversation"
"Choose from the list on the left to start reading."
```

---

## Notifications (stretch goal — build after core works)

Email notification when a new message arrives.
Use Resend (already likely in the stack) to send:
Subject: "New message from [Name] about [Job Title]"
Body: plain text, include message preview, link back to /messages

Only send if recipient hasn't read the message within 2 minutes.
Use a Supabase Edge Function or a cron job for this delay logic.

---

## Hard rules

- No rounded-full on any element — radius 4px or 8px max
- Sent bubbles: amber bg (#3D2E0F) — never indigo
- No emoji in the UI
- No read receipts (too complex for v1, adds noise)
- No file attachments in v1 — text only
- No group conversations — always exactly two participants
- Mobile: stack panels, don't try to show both at once
- Always unsubscribe from Supabase Realtime channels on component unmount

---

## Build order

1. Database schema + Supabase Realtime enabled
2. /api/conversations (GET + POST)
3. /api/messages (GET + POST)
4. InboxLayout + ConversationList (static, no realtime yet)
5. MessageThread + MessageBubble (static)
6. MessageInput + send functionality
7. Wire up Supabase Realtime (live updates)
8. UnreadBadge on nav
9. Trigger buttons on applicant pipeline + job detail page
10. Empty states + loading skeletons
11. Mobile layout
12. Email notifications (stretch)

Build in this exact order. Do not skip ahead.