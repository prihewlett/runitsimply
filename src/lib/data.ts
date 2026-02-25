import type {
  Employee,
  Client,
  Job,
  TimeEntry,
  BusinessSettings,
  BusinessType,
  PaymentMethod,
  PaymentInfo,
} from "@/types";

// --- Date helpers ---

export function getWeekDates(offset: number = 0): Date[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatDateShort(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function formatDayName(date: Date): string {
  return DAYS[date.getDay()];
}

export function isToday(date: Date): boolean {
  return date.toDateString() === new Date().toDateString();
}

export function getMonthDates(monthOffset: number = 0): Date[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + monthOffset;
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0 = Sunday
  const start = new Date(first);
  start.setDate(1 - startDay); // back to Sunday before the 1st
  const last = new Date(year, month + 1, 0); // last day of month
  const endDay = last.getDay();
  const totalDays = startDay + last.getDate() + (6 - endDay);
  return Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function formatMonthYear(monthOffset: number = 0): string {
  const today = new Date();
  const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const fullMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${fullMonths[d.getMonth()]} ${d.getFullYear()}`;
}

export function isSameMonth(date: Date, monthOffset: number = 0): boolean {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  return date.getMonth() === target.getMonth() && date.getFullYear() === target.getFullYear();
}

// --- Business types ---

export const BUSINESS_TYPES: BusinessType[] = [
  { id: "cleaning", label: "Home Cleaning", emoji: "\u{1F9F9}", color: "#3B82F6" },
  { id: "landscaping", label: "Landscaping", emoji: "\u{1F33F}", color: "#16A34A" },
  { id: "pool", label: "Pool Service", emoji: "\u{1F3CA}", color: "#0EA5E9" },
  { id: "handyman", label: "Handyman", emoji: "\u{1F527}", color: "#F59E0B" },
  { id: "pressure", label: "Pressure Washing", emoji: "\u{1F4A6}", color: "#6366F1" },
  { id: "pest", label: "Pest Control", emoji: "\u{1F6E1}\uFE0F", color: "#EF4444" },
  { id: "moving", label: "Moving & Hauling", emoji: "\u{1F4E6}", color: "#8B5CF6" },
  { id: "other", label: "Other Services", emoji: "\u26A1", color: "#EC4899" },
];

// --- Payment display info ---

export const PAYMENT_INFO: Record<PaymentMethod, PaymentInfo> = {
  Venmo: { bg: "#E8F5FE", color: "#008CFF", icon: "V" },
  Zelle: { bg: "#F3E8FF", color: "#6D28D9", icon: "Z" },
  "Credit Card": { bg: "#E0F2FE", color: "#0369A1", icon: "\u{1F4B3}" },
  Check: { bg: "#FEF3C7", color: "#92400E", icon: "\u{1F4C4}" },
  Cash: { bg: "#DCFCE7", color: "#166534", icon: "$" },
};

// --- Sample data ---

export const EMPLOYEES: Employee[] = [
  { id: "emp-001", name: "Maria Santos", phone: "(555) 234-5678", role: "Team Lead", rate: 22, color: "#3B82F6", avatar: "MS" },
  { id: "emp-002", name: "James Wilson", phone: "(555) 345-6789", role: "Technician", rate: 18, color: "#10B981", avatar: "JW" },
  { id: "emp-003", name: "Sarah Chen", phone: "(555) 456-7890", role: "Technician", rate: 18, color: "#F59E0B", avatar: "SC" },
  { id: "emp-004", name: "David Park", phone: "(555) 567-8901", role: "Specialist", rate: 25, payType: "perJob", color: "#8B5CF6", avatar: "DP" },
];

export const CLIENTS: Client[] = [
  { id: "cli-001", name: "Thompson Residence", contact: "Linda Thompson", phone: "(555) 111-2222", address: "1420 Oak Valley Dr, Austin, TX", frequency: "Weekly", paymentMethod: "Credit Card", notes: "2-story. Has a dog.", serviceType: "cleaning", serviceRate: 180, serviceRateType: "flat" },
  { id: "cli-002", name: "Garcia Property", contact: "Roberto Garcia", phone: "(555) 222-3333", address: "887 Elm St, Austin, TX", frequency: "Bi-weekly", paymentMethod: "Venmo", notes: "Front & back yard.", serviceType: "landscaping", serviceRate: 150, serviceRateType: "flat" },
  { id: "cli-003", name: "Park Place Condo", contact: "Jessica Kim", phone: "(555) 333-4444", address: "200 Congress Ave #14B, Austin, TX", frequency: "Weekly", paymentMethod: "Credit Card", notes: "Rooftop pool.", serviceType: "pool", serviceRate: 120, serviceRateType: "flat" },
  { id: "cli-004", name: "Miller Family", contact: "Tom Miller", phone: "(555) 444-5555", address: "3201 Barton Creek Blvd, Austin, TX", frequency: "Monthly", paymentMethod: "Check", notes: "Large property.", serviceType: "handyman", serviceRate: 350, serviceRateType: "flat" },
  { id: "cli-005", name: "Nguyen Apt", contact: "Mai Nguyen", phone: "(555) 555-6666", address: "1100 S Lamar #203, Austin, TX", frequency: "Bi-weekly", paymentMethod: "Zelle", notes: "Key under mat.", serviceType: "cleaning", serviceRate: 90, serviceRateType: "hourly" },
];

const weekDates = getWeekDates(0);
const ds = (d: Date) => toDateString(d);

export const JOBS: Job[] = [
  { id: "job-001", clientId: "cli-001", employeeIds: ["emp-001", "emp-002"], date: ds(weekDates[1]), time: "9:00 AM", duration: 3, status: "completed", amount: 180, paymentStatus: "paid", paymentVia: "Credit Card" },
  { id: "job-002", clientId: "cli-003", employeeIds: ["emp-003"], date: ds(weekDates[2]), time: "10:00 AM", duration: 2, status: "completed", amount: 120, paymentStatus: "paid", paymentVia: "Credit Card" },
  { id: "job-003", clientId: "cli-002", employeeIds: ["emp-001"], date: ds(weekDates[3]), time: "1:00 PM", duration: 2.5, status: "scheduled", amount: 150, paymentStatus: "pending" },
  { id: "job-004", clientId: "cli-005", employeeIds: ["emp-002"], date: ds(weekDates[4]), time: "9:00 AM", duration: 1.5, status: "scheduled", amount: 90, paymentStatus: "pending" },
  { id: "job-005", clientId: "cli-004", employeeIds: ["emp-001", "emp-004"], date: ds(weekDates[5]), time: "8:00 AM", duration: 5, status: "scheduled", amount: 350, paymentStatus: "pending" },
  { id: "job-006", clientId: "cli-001", employeeIds: ["emp-003", "emp-002"], date: ds(weekDates[6]), time: "11:00 AM", duration: 3, status: "scheduled", amount: 180, paymentStatus: "pending" },
];

export const TIME_ENTRIES: TimeEntry[] = [
  { id: "te-001", employeeId: "emp-001", date: ds(weekDates[1]), clockIn: "8:45 AM", clockOut: "12:15 PM", hours: 3.5 },
  { id: "te-002", employeeId: "emp-002", date: ds(weekDates[1]), clockIn: "8:50 AM", clockOut: "12:10 PM", hours: 3.33 },
  { id: "te-003", employeeId: "emp-003", date: ds(weekDates[2]), clockIn: "9:55 AM", clockOut: "12:05 PM", hours: 2.17 },
];

export const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  venmoHandle: "RunItSimply",
  zelleEmail: "pay@runitsimply.com",
  stripeConnected: false,
  employeeSelfLog: false,
  hidePayroll: false,
  referralCode: "RIS-7K2M",
  referralsCount: 3,
  referralCredit: 75,
  businessName: "RunItSimply",
  businessPhone: "(555) 123-4567",
  businessEmail: "hello@runitsimply.com",
  subscriptionStatus: "trial",
  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
};

// --- Sample messages ---

export interface Message {
  id: string;
  contactName: string;
  contactType: "client" | "team";
  avatar: string;
  color: string;
  messages: { from: "me" | "them"; text: string; time: string }[];
  unread: number;
}

export const MESSAGES: Message[] = [
  {
    id: "msg-001",
    contactName: "Linda Thompson",
    contactType: "client",
    avatar: "LT",
    color: "#3B82F6",
    messages: [
      { from: "them", text: "Hi! Can we move Thursday's cleaning to Friday this week?", time: "10:32 AM" },
      { from: "me", text: "Sure thing, Linda! I'll reschedule for Friday at the same time. Does 9 AM still work?", time: "10:45 AM" },
      { from: "them", text: "Perfect, thank you!", time: "10:47 AM" },
    ],
    unread: 0,
  },
  {
    id: "msg-002",
    contactName: "Maria Santos",
    contactType: "team",
    avatar: "MS",
    color: "#3B82F6",
    messages: [
      { from: "them", text: "Just finished the Thompson job. Everything looks great!", time: "12:20 PM" },
      { from: "me", text: "Awesome work, Maria! Head to the Garcia property next.", time: "12:25 PM" },
      { from: "them", text: "On my way now. Should be there in 15 min.", time: "12:27 PM" },
    ],
    unread: 1,
  },
  {
    id: "msg-003",
    contactName: "Roberto Garcia",
    contactType: "client",
    avatar: "RG",
    color: "#16A34A",
    messages: [
      { from: "them", text: "The backyard looks amazing after last visit! Can we add hedge trimming?", time: "Yesterday" },
      { from: "me", text: "Glad you're happy! Hedge trimming would be $45 extra per visit. Want me to add it?", time: "Yesterday" },
      { from: "them", text: "Yes please, starting next visit.", time: "Yesterday" },
    ],
    unread: 0,
  },
  {
    id: "msg-004",
    contactName: "James Wilson",
    contactType: "team",
    avatar: "JW",
    color: "#10B981",
    messages: [
      { from: "them", text: "Running about 10 minutes late for the Nguyen job tomorrow", time: "5:15 PM" },
      { from: "me", text: "No worries, I'll let Mai know. Thanks for the heads up!", time: "5:18 PM" },
    ],
    unread: 0,
  },
  {
    id: "msg-005",
    contactName: "Jessica Kim",
    contactType: "client",
    avatar: "JK",
    color: "#0EA5E9",
    messages: [
      { from: "them", text: "The pool pH was a bit high last time. Can you check the chemicals?", time: "Monday" },
      { from: "me", text: "Absolutely, we'll do an extra chemical balance check on your next visit.", time: "Monday" },
    ],
    unread: 1,
  },
];
