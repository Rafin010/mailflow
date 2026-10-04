// Mock mailbox data. Replace `fetchFolder` with a real API call once the backend is running.

export type Folder = "inbox" | "sent" | "drafts" | "archive" | "spam" | "trash";
export type Category = "Primary" | "Promotions" | "Social" | "Updates";

export interface Message {
  id: number;
  from: string;
  email: string;
  to: string;
  subject: string;
  snippet: string;
  bodyHtml: string;
  date: string; // ISO display string
  unread: boolean;
  starred: boolean;
  category?: Category;
}

export const FOLDER_FROM_PATH: Record<string, Folder> = {
  "/": "inbox",
  "/sent": "sent",
  "/drafts": "drafts",
  "/archive": "archive",
  "/spam": "spam",
  "/trash": "trash",
};

export const FOLDER_LABEL: Record<Folder, string> = {
  inbox: "Inbox",
  sent: "Sent",
  drafts: "Drafts",
  archive: "Archive",
  spam: "Spam",
  trash: "Trash",
};

// Generate large dummy dataset for pagination
function generateInboxMessages(count: number): Message[] {
  const categories: Category[] = ["Primary", "Promotions", "Social", "Updates"];
  const senders = [
    { from: "Alex Morgan", email: "alex@example.com" },
    { from: "Support Team", email: "support@mailflow.app" },
    { from: "Google Cloud", email: "billing@google.com" },
    { from: "Twitter", email: "notify@twitter.com" },
    { from: "Amazon", email: "shipment@amazon.com" },
    { from: "GitHub", email: "noreply@github.com" },
    { from: "Marketing Team", email: "marketing@startup.io" }
  ];

  const messages: Message[] = [];
  const baseDate = new Date("2026-10-04T12:00:00Z");

  for (let i = 1; i <= count; i++) {
    const sender = senders[i % senders.length];
    
    // Assign category based on sender heuristically for realism
    let category: Category = "Primary";
    if (sender.from === "Twitter") category = "Social";
    else if (sender.from === "Amazon" || sender.from === "Marketing Team") category = "Promotions";
    else if (sender.from === "Google Cloud" || sender.from === "GitHub") category = "Updates";

    // Randomize time slightly going backwards
    const msgDate = new Date(baseDate.getTime() - i * 3600000 * 3.5); 

    messages.push({
      id: i + 100, // offset id
      from: sender.from,
      email: sender.email,
      to: "me",
      subject: `Dummy message ${i} from ${sender.from}`,
      snippet: `This is a generated snippet for message ${i} to test pagination...`,
      bodyHtml: `<p>This is a generated body for message ${i}. Used to test the 50-item pagination and category tabs.</p>`,
      date: msgDate.toISOString(),
      unread: i % 7 === 0,
      starred: i % 15 === 0,
      category: category,
    });
  }

  // Prepend the specific mock ones so they show at the top
  return [
    {
      id: 1,
      from: "Alex Morgan",
      email: "alex@example.com",
      to: "me",
      subject: "Project proposal",
      snippet: "Please review the attached project plan for Q3...",
      bodyHtml:
        "<p>Hi Team,</p><p>Please review the attached project plan for Q3. We need to finalize the roadmap by next Tuesday so we can start allocating resources.</p><p>Key highlights:</p><ul><li>Launch of the new Admin Console.</li><li>Integration with SendGrid for outbound emails.</li><li>MFA implementation for all tenant users.</li></ul><p>Let me know your thoughts.</p><p>Best regards,<br/>Alex Morgan</p>",
      date: "2026-10-04T10:42:00Z",
      unread: true,
      starred: false,
      category: "Primary"
    },
    {
      id: 2,
      from: "Support Team",
      email: "support@mailflow.app",
      to: "me",
      subject: "Your account is ready",
      snippet: "Your workspace has been successfully created. Welcome...",
      bodyHtml:
        "<p>Welcome to Mail Flow!</p><p>Your workspace has been successfully created. You can now add domains, invite users and start sending email.</p><p>— The Mail Flow Team</p>",
      date: "2026-10-04T09:18:00Z",
      unread: false,
      starred: true,
      category: "Primary"
    },
    {
      id: 5,
      from: "Google Cloud",
      email: "billing@google.com",
      to: "me",
      subject: "Billing Alert: Threshold Reached",
      snippet: "Your project has reached 80% of the billing threshold.",
      bodyHtml:
        "<p>Hello,</p><p>Your project <strong>mailflow-prod</strong> has reached <strong>80%</strong> of the configured billing threshold for this month.</p><p>You can review your usage in the Cloud Console.</p>",
      date: "2026-10-02T16:05:00Z",
      unread: true,
      starred: false,
      category: "Updates"
    },
    ...messages
  ];
}

export const initialMailbox: Record<Folder, Message[]> = {
  inbox: generateInboxMessages(245),
  sent: [
    {
      id: 3,
      from: "Sarah Wilson",
      email: "sarah@example.com",
      to: "Sarah Wilson",
      subject: "Meeting tomorrow",
      snippet: "Can we confirm the meeting time for our weekly sync?",
      bodyHtml: "<p>Hi Sarah,</p><p>Can we confirm the meeting time for our weekly sync? Does 11 AM work for you?</p><p>Thanks!</p>",
      date: "2026-10-03T18:30:00Z",
      unread: false,
      starred: false,
    },
  ],
  drafts: [
    {
      id: 6,
      from: "Draft",
      email: "",
      to: "team@example.com",
      subject: "Q4 planning notes",
      snippet: "Rough notes for the Q4 kickoff — still editing...",
      bodyHtml: "<p>Rough notes for the Q4 kickoff:</p><ul><li>Hiring plan</li><li>Infra budget</li></ul>",
      date: "2026-10-01T14:12:00Z",
      unread: false,
      starred: false,
    },
  ],
  archive: [
    {
      id: 4,
      from: "Billing",
      email: "billing@mailflow.app",
      to: "me",
      subject: "Invoice available",
      snippet: "Your latest invoice for Mail Flow Pro is now available.",
      bodyHtml: "<p>Your latest invoice for <strong>Mail Flow Pro</strong> is now available in the billing portal.</p>",
      date: "2026-10-03T08:00:00Z",
      unread: false,
      starred: false,
    },
  ],
  spam: [],
  trash: [],
};

/** Simulated network fetch for a folder. Swap for `fetch('/api/v1/messages?folder=...')`. */
export async function fetchFolder(current: Message[]): Promise<Message[]> {
  await new Promise((r) => setTimeout(r, 700));
  return [...current];
}
