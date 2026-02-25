export type ServiceType =
  | "cleaning"
  | "landscaping"
  | "pool"
  | "handyman"
  | "pressure"
  | "pest"
  | "moving"
  | "other";

export type PaymentMethod =
  | "Venmo"
  | "Zelle"
  | "Credit Card"
  | "Check"
  | "Cash";

export type JobStatus = "scheduled" | "completed" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: string;
  rate: number;
  payType?: "hourly" | "perJob";
  color: string;
  avatar: string;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email?: string;
  address: string;
  frequency: "Weekly" | "Bi-weekly" | "Monthly" | "One-time";
  paymentMethod: PaymentMethod;
  notes: string;
  serviceType: ServiceType;
  serviceRate?: number;
  serviceRateType?: "flat" | "hourly";
}

export interface Job {
  id: string;
  clientId: string;
  employeeIds: string[];
  date: string;
  time: string;
  duration: number;
  status: JobStatus;
  amount: number;
  rateType?: "flat" | "hourly";
  paymentStatus: PaymentStatus;
  paymentVia?: PaymentMethod;
  invoiceSentAt?: string;
  // Recurring job fields
  isRecurring?: boolean;
  recurrenceRule?: "weekly" | "biweekly" | "monthly";
  recurrenceEndDate?: string;
  parentJobId?: string | null;
  seriesId?: string | null;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
}

export interface BusinessSettings {
  venmoHandle: string;
  zelleEmail: string;
  stripeConnected: boolean;
  employeeSelfLog: boolean;
  hidePayroll: boolean;
  referralCode: string;
  referralsCount: number;
  referralCredit: number;
  businessName?: string;
  businessPhone?: string;
  businessEmail?: string;
  trialEndsAt?: string;
  subscriptionStatus?: SubscriptionStatus;
}

export interface BusinessType {
  id: ServiceType;
  label: string;
  emoji: string;
  color: string;
}

export interface PaymentInfo {
  bg: string;
  color: string;
  icon: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface ExpenseCategory {
  id: string;
  businessId: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface Expense {
  id: string;
  businessId: string;
  date: string;
  description: string;
  amount: number;
  categoryId: string | null;
  vendor: string;
  jobId: string | null;
  receiptUrl: string | null;
  notes: string;
}
