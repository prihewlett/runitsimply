// ─── Translation Dictionaries ───────────────────────────────────────
// Flat key → string maps for English and Spanish.
// Components use t("key") or t("key", { count: n }) for interpolation.

export type TranslationKey = keyof typeof en;

const en = {
  // ── Navbar ──
  "nav.features": "Features",
  "nav.industries": "Industries",
  "nav.pricing": "Pricing",
  "nav.openDashboard": "Open Dashboard",

  // ── Hero ──
  "hero.badge": "NEW",
  "hero.badgeText": "Now for all home service businesses",
  "hero.headline1": "Run your service",
  "hero.headline2": "business simply",
  "hero.subtitle":
    "Scheduling, team management, client tracking, and payments \u2014 all in one place. Built for small teams that do big work.",
  "hero.cta": "Try the Dashboard",
  "hero.ctaSecondary": "Watch Demo",

  // ── Features ──
  "features.title1": "Everything you need.",
  "features.title2": "Nothing you don\u2019t.",
  "features.smartScheduling": "Smart Scheduling",
  "features.smartSchedulingDesc":
    "Weekly calendar. Assign jobs, recurring schedules, avoid double-bookings.",
  "features.timeTracking": "Time Tracking",
  "features.timeTrackingDesc":
    "One-tap clock in/out. GPS verification, overtime alerts, payroll export.",
  "features.teamManagement": "Team Management",
  "features.teamManagementDesc":
    "Track hours, availability, pay rates. Staff see daily schedule on mobile.",
  "features.clientDatabase": "Client Database",
  "features.clientDatabaseDesc":
    "Addresses, access codes, preferences, service history \u2014 all searchable.",
  "features.payments": "Payments",
  "features.paymentsDesc":
    "Venmo, Zelle, cards, cash. Auto-invoices and payment links.",
  "features.communication": "Communication",
  "features.communicationDesc":
    "Automated reminders, on-the-way alerts, completion confirmations.",

  // ── Industries ──
  "industries.title": "Built for your trade",
  "industries.subtitle": "Whatever service you provide, RunItSimply adapts.",

  // ── Business types ──
  "businessType.cleaning": "Home Cleaning",
  "businessType.landscaping": "Landscaping",
  "businessType.pool": "Pool Service",
  "businessType.handyman": "Handyman",
  "businessType.pressure": "Pressure Washing",
  "businessType.pest": "Pest Control",
  "businessType.moving": "Moving & Hauling",
  "businessType.other": "Other Services",

  // ── Testimonial ──
  "testimonial.quote":
    "\u201CI managed everything in spreadsheets and texts. RunItSimply replaced all of it in one afternoon.\u201D",
  "testimonial.author": "Maria R.",
  "testimonial.company": "Sparkle & Shine Cleaning, Austin TX",

  // ── Pricing ──
  "pricing.title": "Simple pricing",
  "pricing.subtitle": "Try free for 14 days. No credit card required.",
  "pricing.starter": "Starter",
  "pricing.free": "Free",
  "pricing.freeTrial": "Free Trial",
  "pricing.trialDuration": "14 days, all features included",
  "pricing.upTo15": "Up to 15 clients",
  "pricing.pro": "Pro",
  "pricing.perMonth": "/mo",
  "pricing.unlimited": "Unlimited everything",
  "pricing.popular": "POPULAR",
  "pricing.getStarted": "Get Started",
  "pricing.startFreeTrial": "Start Free Trial",
  "pricing.startTrial": "Start Free Trial",
  "pricing.signUp": "Sign Up Now!",
  "pricing.scheduling": "Scheduling",
  "pricing.team3": "Team (3 members)",
  "pricing.clientDb": "Client database",
  "pricing.basicInvoicing": "Basic invoicing",
  "pricing.messaging": "Messaging",
  "pricing.everythingStarter": "Everything in Starter",
  "pricing.unlimitedClients": "Unlimited clients",
  "pricing.venmoZelle": "Venmo & Zelle links",
  "pricing.stripeAuto": "Stripe auto-charge",
  "pricing.smsReminders": "SMS reminders",
  "pricing.gpsVerification": "GPS verification",

  // ── CTA ──
  "cta.title": "Ready to ditch the spreadsheets?",
  "cta.subtitle": "Set up in 5 minutes. No credit card required.",
  "cta.button": "Get Started Free",

  // ── Footer ──
  "footer.copyright": "\u00A9 2026 RunItSimply",
  "footer.contactTitle": "Get in Touch",
  "footer.contactSubtitle": "Questions or need help? Send us a message and we\u2019ll get back to you shortly.",
  "footer.nameLabel": "NAME",
  "footer.namePlaceholder": "Your name",
  "footer.emailLabel": "EMAIL",
  "footer.emailPlaceholder": "you@example.com",
  "footer.messageLabel": "MESSAGE",
  "footer.messagePlaceholder": "How can we help?",
  "footer.send": "Send Message",
  "footer.sending": "Sending...",
  "footer.successTitle": "Message sent!",
  "footer.successMessage": "Thanks for reaching out. We\u2019ll get back to you within 24 hours.",
  "footer.sendAnother": "Send another message",
  "footer.required": "Please fill in all fields.",

  // ── Sidebar ──
  "sidebar.businessManager": "Business Manager",
  "sidebar.dashboard": "Dashboard",
  "sidebar.schedule": "Schedule",
  "sidebar.team": "Team",
  "sidebar.clients": "Clients",
  "sidebar.messages": "Messages",
  "sidebar.payments": "Payments",
  "sidebar.settings": "Settings",
  "sidebar.homepage": "Homepage",

  // ── Dashboard page ──
  "dashboard.title": "Dashboard",
  "dashboard.subtitle": "Here\u2019s your week at a glance",

  // ── KPI Cards ──
  "kpi.jobsThisWeek": "JOBS THIS WEEK",
  "kpi.completed": "{{count}} completed",
  "kpi.hours": "HOURS",
  "kpi.thisWeek": "this week",
  "kpi.revenue": "REVENUE",
  "kpi.estimated": "estimated",
  "kpi.teamLabel": "TEAM",
  "kpi.clientsCount": "{{count}} clients",

  // ── Today's Schedule ──
  "todaysSchedule.title": "Today\u2019s Schedule",
  "todaysSchedule.noJobs": "No jobs today",

  // ── Team Availability ──
  "teamAvailability.title": "Team Availability",

  // ── Schedule page ──
  "schedule.title": "Schedule",
  "schedule.subtitle": "Manage and assign jobs",
  "schedule.newJob": "New Job",
  "schedule.today": "Today",
  "schedule.week": "Week",
  "schedule.month": "Month",
  "schedule.noJobs": "No jobs",
  "schedule.newJobTitle": "New Job",
  "schedule.client": "CLIENT",
  "schedule.selectClient": "Select a client",
  "schedule.date": "DATE",
  "schedule.time": "TIME",
  "schedule.duration": "DURATION (HOURS)",
  "schedule.assignEmployees": "ASSIGN EMPLOYEES",
  "schedule.amount": "AMOUNT ($)",
  "schedule.saveJob": "Save Job",
  "schedule.jobAdded": "Job added!",
  "schedule.jobDetails": "Job Details",
  "schedule.editJob": "Edit",
  "schedule.updateJob": "Save Changes",
  "schedule.jobUpdated": "Job updated!",
  "schedule.status": "STATUS",
  "schedule.markComplete": "Mark Complete",
  "schedule.markScheduled": "Mark Scheduled",
  "schedule.address": "ADDRESS",
  "schedule.paymentStatus": "PAYMENT",

  // ── Team page ──
  "team.title": "Team Members",
  "team.subtitle": "Your service crew",
  "team.addMember": "Add Member",
  "team.rate": "Rate",
  "team.jobsThisWeek": "Jobs this week",
  "team.scheduledHours": "Scheduled hours",
  "team.loggedHours": "Logged hours",
  "team.capacity": "{{pct}}% capacity",
  "team.clockInHistory": "Clock-In History",
  "team.noTimeEntries": "No time entries recorded yet.",
  "team.date": "Date",
  "team.clockIn": "Clock In",
  "team.clockOut": "Clock Out",
  "team.hoursCol": "Hours",
  "team.jobsWeek": "Jobs This Week ({{count}})",
  "team.noJobsWeek": "No jobs scheduled this week.",

  // ── Clients page ──
  "clients.title": "Clients",
  "clients.subtitle": "Manage properties & clients",
  "clients.addClient": "Add Client",
  "clients.searchPlaceholder": "Search clients, addresses...",
  "clients.property": "PROPERTY",
  "clients.contact": "CONTACT",
  "clients.address": "ADDRESS",
  "clients.service": "SERVICE",
  "clients.frequency": "FREQUENCY",
  "clients.payment": "PAYMENT",
  "clients.noResults": "No clients found matching \u201C{{query}}\u201D",
  "clients.serviceType": "SERVICE TYPE",
  "clients.paymentMethod": "PAYMENT METHOD",
  "clients.notes": "NOTES",
  "clients.serviceHistory": "Service History ({{count}} jobs)",
  "clients.noHistory": "No service history yet.",

  // ── Messages page ──
  "messages.title": "Messages",
  "messages.subtitle": "Team & client communication",
  "messages.all": "All",
  "messages.clientsTab": "Clients",
  "messages.teamTab": "Team",
  "messages.client": "Client",
  "messages.teamMember": "Team Member",
  "messages.placeholder": "Type a message...",
  "messages.selectConvo": "Select a conversation to start messaging",
  "messages.newMessage": "New Message",
  "messages.existingConvo": "Open existing conversation",

  // ── Payments page ──
  "payments.title": "Payments & Invoicing",
  "payments.subtitle": "Track revenue and invoices",
  "payments.totalRevenue": "TOTAL REVENUE",
  "payments.collected": "COLLECTED",
  "payments.pending": "PENDING",
  "payments.invoicesCount": "{{count}} invoices",
  "payments.all": "all",
  "payments.pendingTab": "pending",
  "payments.paidTab": "paid",
  "payments.invoiceCol": "INVOICE",
  "payments.clientCol": "CLIENT",
  "payments.dateCol": "DATE",
  "payments.amountCol": "AMOUNT",
  "payments.statusCol": "STATUS",
  "payments.methodCol": "METHOD",
  "payments.collectPayment": "Collect Payment",
  "payments.markAsPaid": "Mark as paid",
  "payments.paymentReceived": "Payment received",
  "payments.paidVia": "Paid via {{method}}",
  "payments.recorded": "Payment recorded!",
  "payments.duration": "DURATION",
  "payments.time": "TIME",
  "payments.hours": "{{count}} hours",

  // ── Settings page ──
  "settings.title": "Settings",
  "settings.subtitle": "Configure your business preferences",
  "settings.paymentSetup": "Payment Setup",
  "settings.paymentSetupDesc":
    "Configure your payment methods so clients can pay you.",
  "settings.venmoHandle": "VENMO HANDLE",
  "settings.zelleEmail": "ZELLE EMAIL / PHONE",
  "settings.stripeAutoCharge": "Stripe auto-charge",
  "settings.connected": "Connected",
  "settings.notConnected": "Not connected",
  "settings.businessInfo": "Business Information",
  "settings.businessInfoDesc": "Update your business details.",
  "settings.businessName": "BUSINESS NAME",
  "settings.phone": "PHONE",
  "settings.email": "EMAIL",

  // ── Reports page ──
  "sidebar.reports": "Reports",
  "reports.title": "Reports",
  "reports.subtitle": "Print and save business reports",
  "reports.clientsTab": "Clients",
  "reports.revenueTab": "Revenue",
  "reports.employeeHoursTab": "Employee Hours",
  "reports.printSavePdf": "Print / Save PDF",
  "reports.clientInfoReport": "Client Information Report",
  "reports.monthlyRevenueReport": "Monthly Revenue Report",
  "reports.employeeHoursReport": "Employee Hours Report",
  "reports.totalRevenue": "Total Revenue",
  "reports.byClient": "Revenue by Client",
  "reports.paymentSummary": "Payment Status Summary",
  "reports.paid": "Paid",
  "reports.pending": "Pending",
  "reports.employee": "Employee",
  "reports.role": "Role",
  "reports.totalHours": "Total Hours",
  "reports.generatedOn": "Generated on {{date}}",
  "reports.noTimeEntries": "No time entries recorded.",
  "reports.jobCount": "Jobs",
  "reports.totalAmount": "Total Amount",
  "reports.status": "Status",

  // ── Settings: Employee Self-Log ──
  "settings.employeeLogging": "Employee Hour Logging",
  "settings.employeeSelfLog": "Allow employees to log hours",
  "settings.employeeSelfLogDesc": "When enabled, a form appears on the Team page to log clock-in/out times.",
  "settings.enabled": "Enabled",
  "settings.disabled": "Disabled",

  // ── Team: Log Hours ──
  "team.logHours": "Log Hours",
  "team.logHoursTitle": "Log Employee Hours",
  "team.selectEmployee": "EMPLOYEE",
  "team.entryDate": "DATE",
  "team.clockInTime": "CLOCK-IN TIME",
  "team.clockOutTime": "CLOCK-OUT TIME",
  "team.saveEntry": "Save Entry",

  // ── Clients: Service Rate ──
  "clients.serviceRate": "RATE",
  "clients.serviceRateLabel": "SERVICE RATE",
  "clients.perVisit": "per visit",
  "clients.editRate": "Edit",
  "clients.saveRate": "Save",
  "clients.rateType": "RATE TYPE",
  "clients.flatRate": "Flat Rate",
  "clients.hourlyRate": "Hourly",
  "clients.perHour": "per hour",

  // ── Team: Earnings ──
  "team.earnings": "Earnings",
  "team.totalEarnings": "Total Earnings",
  "team.perJob": "per job",

  // ── Reports: Earnings ──
  "reports.earnings": "Earnings",

  // ── Reports: Profit/Loss ──
  "reports.profitLossTab": "Profit/Loss",
  "reports.profitLossReport": "Profit & Loss Report",
  "reports.netProfit": "Net Profit",
  "reports.totalExpenses": "Total Expenses",
  "reports.expensesByCategory": "Expenses by Category",
  "reports.profitMargin": "Profit Margin",
  "reports.noExpensesYet": "No expenses recorded yet.",
  "reports.uncategorized": "Uncategorized",
  "reports.expenseSingular": "expense",
  "reports.expensePlural": "expenses",

  // ── Expenses ──
  "sidebar.expenses": "Expenses",
  "expenses.title": "Expenses",
  "expenses.subtitle": "Track business expenses and costs",
  "expenses.addExpense": "Add Expense",
  "expenses.totalThisMonth": "Total This Month",
  "expenses.topCategory": "Top Category",
  "expenses.avgPerJob": "Avg Per Job",
  "expenses.all": "All",
  "expenses.description": "DESCRIPTION",
  "expenses.amount": "AMOUNT ($)",
  "expenses.category": "CATEGORY",
  "expenses.vendor": "VENDOR",
  "expenses.date": "DATE",
  "expenses.notes": "NOTES",
  "expenses.linkedJob": "LINKED JOB (optional)",
  "expenses.noLinkedJob": "No linked job",
  "expenses.saveExpense": "Save Expense",
  "expenses.expenseAdded": "Expense added!",
  "expenses.deleteExpense": "Delete",
  "expenses.expenseDeleted": "Expense deleted!",
  "expenses.noExpenses": "No expenses yet",

  // ── Settings: Payroll Privacy ──
  "settings.payrollPrivacy": "Hide payroll from employees",
  "settings.payrollPrivacyDesc": "When enabled, only the business owner can see earnings and pay rates. Employees only see their hours.",

  // ── Settings: Referral Program ──
  "settings.referralProgram": "Referral Program",
  "settings.referralDesc": "Share your code. You both get $25 credit \u2014 you earn $25 when they sign up, and they get $25 off. Each person can only be referred once.",
  "settings.yourReferralCode": "YOUR REFERRAL CODE",
  "settings.copyCode": "Copy",
  "settings.codeCopied": "Copied!",
  "settings.shareLink": "SHARE LINK",
  "settings.referralStats": "REFERRAL STATS",
  "settings.totalReferrals": "Successful Referrals",
  "settings.creditEarned": "Credit Earned",

  // ── Pricing: Referral ──
  "pricing.haveReferralCode": "Have a referral code?",
  "pricing.enterCode": "Enter referral code",
  "pricing.applyCode": "Apply",
  "pricing.codeApplied": "Code applied! You\u2019ll get $25 credit on your account.",
  "pricing.codeAlreadyUsed": "You\u2019ve already applied a referral code.",

  // ── Schedule: Delete Job ──
  "schedule.deleteJob": "Delete Job",
  "schedule.jobDeleted": "Job deleted!",
  "schedule.confirmDelete": "Are you sure? This cannot be undone.",

  // ── Schedule: Recurring Jobs ──
  "schedule.recurring": "Recurring",
  "schedule.repeatEvery": "REPEAT EVERY",
  "schedule.none": "None (one-time)",
  "schedule.weekly": "Weekly",
  "schedule.biweekly": "Every 2 Weeks",
  "schedule.monthly": "Monthly",
  "schedule.endDate": "END DATE (optional)",
  "schedule.recurringBadge": "Recurring",
  "schedule.editSeries": "Edit All Future",
  "schedule.editInstance": "Edit This Only",
  "schedule.cancelSeries": "Cancel Series",
  "schedule.seriesCancelled": "Series cancelled!",
  "schedule.previousWeek": "Previous week",
  "schedule.nextWeek": "Next week",

  // ── Clients: Add Client ──
  "clients.clientAdded": "Client added!",
  "clients.contactName": "CONTACT NAME",
  "clients.phone": "PHONE",
  "clients.email": "EMAIL",
  "clients.emailPlaceholder": "client@example.com",

  // ── Team: Add Member ──
  "team.memberAdded": "Member added!",
  "team.name": "NAME",
  "team.phone": "PHONE",
  "team.roleLabel": "ROLE",
  "team.rateLabel": "PAY RATE ($)",
  "team.payType": "PAY TYPE",
  "team.hourly": "Hourly",
  "team.saveMember": "Save Member",

  // ── Settings: Saved ──
  "settings.saved": "Saved!",

  // ── Auth / Role Switcher ──
  "auth.owner": "Owner",
  "auth.employee": "Employee",
  "auth.switchRole": "Switch Role",
  "auth.viewingAs": "Viewing as:",
  "auth.selectEmployee": "Select employee",

  // ── Auth Pages ──
  "auth.login": "Sign In",
  "auth.signup": "Create Account",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.businessName": "Business Name",
  "auth.fullName": "Full Name",
  "auth.signIn": "Sign In",
  "auth.signUp": "Sign Up",
  "auth.signingIn": "Signing in\u2026",
  "auth.signingUp": "Creating account\u2026",
  "auth.signOut": "Sign Out",
  "auth.noAccount": "Don't have an account?",
  "auth.hasAccount": "Already have an account?",
  "auth.loginSubtitle": "Welcome back to RunItSimply",
  "auth.signupSubtitle": "Start managing your business",
  "auth.inviteTitle": "Accept Invitation",
  "auth.inviteSubtitle": "Set up your employee account",
  "auth.inviteAccept": "Accept & Create Account",
  "auth.inviteInvalid": "This invite link is invalid or has expired.",
  "auth.loginError": "Invalid email or password",
  "auth.signupError": "Could not create account. Please try again.",
  "auth.passwordMinLength": "Password must be at least 6 characters",
  "auth.inviteEmployee": "Invite",
  "auth.inviteModalTitle": "Invite Employee",
  "auth.inviteEmail": "Employee's Email",
  "auth.sendInvite": "Send Invite",
  "auth.inviteSent": "Invite sent!",
  "auth.invitePending": "Invited",

  // ── Auth: Password Reset ──
  "auth.forgotPassword": "Forgot password?",
  "auth.forgotPasswordSubtitle": "Enter your email and we'll send you a reset link",
  "auth.sendResetLink": "Send Reset Link",
  "auth.sendingReset": "Sending\u2026",
  "auth.checkEmail": "Check Your Email",
  "auth.resetEmailSent": "We sent you a password reset link",
  "auth.resetEmailSentDetail": "Check your inbox for a link to reset your password. It may take a minute to arrive.",
  "auth.backToLogin": "Back to Sign In",
  "auth.resetPassword": "Reset Password",
  "auth.resetPasswordSubtitle": "Enter your new password below",
  "auth.newPassword": "New Password",
  "auth.confirmPassword": "Confirm Password",
  "auth.passwordsNoMatch": "Passwords do not match",
  "auth.resettingPassword": "Resetting\u2026",
  "auth.resetSuccessTitle": "Password Updated!",
  "auth.resetSuccessMessage": "Your password has been reset successfully. Redirecting you to the dashboard\u2026",
  "auth.redirectingToDashboard": "Redirecting\u2026",
  "auth.resetLinkInvalid": "This reset link is invalid or has expired. Please request a new one.",
  "auth.requestNewLink": "Request a new reset link",
  "auth.resetError": "Something went wrong. Please try again.",

  // ── Dashboard: Employee View ──
  "dashboard.mySubtitle": "Your overview for this week",

  // ── KPI: Employee View ──
  "kpi.myJobs": "MY JOBS",
  "kpi.myHours": "MY HOURS",
  "kpi.myEarnings": "MY EARNINGS",
  "kpi.upcoming": "UPCOMING",

  // ── Common ──
  "common.completed": "completed",
  "common.scheduled": "scheduled",
  "common.unknown": "Unknown",
  "common.confirmDelete": "Are you sure? This cannot be undone.",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.search": "Search...",
  "common.requiredFields": "Please fill in all required fields.",

  // ── Delete actions ──
  "clients.deleteClient": "Delete Client",
  "clients.clientDeleted": "Client deleted!",
  "clients.editClient": "Edit",
  "clients.clientUpdated": "Client updated!",
  "clients.saveClient": "Save Changes",
  "team.removeMember": "Remove Member",
  "team.memberRemoved": "Member removed!",
  "team.memberUpdated": "Member updated!",
  "team.editMember": "Edit",
  "team.noMembers": "No team members yet. Add your first member!",
  "expenses.confirmDeleteExpense": "Delete this expense?",
  "clients.noClients": "No clients yet. Add your first client to get started!",
  "expenses.noExpensesEmpty": "No expenses yet. Track your first expense!",
  "expenses.searchExpenses": "Search expenses",

  // ── Days of Week (short) ──
  "common.sun": "Sun",
  "common.mon": "Mon",
  "common.tue": "Tue",
  "common.wed": "Wed",
  "common.thu": "Thu",
  "common.fri": "Fri",
  "common.sat": "Sat",

  // ── Schedule: Validation ──
  "schedule.formError": "Please fill in all required fields (client, date, time, duration).",

  // ── Schedule: SMS Reminders ──
  "schedule.sendReminders": "Send Reminders",
  "schedule.sendingReminders": "Sending...",
  "schedule.remindersSent": "{{count}} reminder(s) sent!",
  "schedule.noTomorrowJobs": "No jobs scheduled for tomorrow.",
  "schedule.remindersNoPhones": "No client phone numbers on file for tomorrow's jobs.",
  "schedule.reminderFailed": "Failed to send reminders. Check Twilio configuration.",

  // ── Clients: Frequency Options ──
  "clients.weekly": "Weekly",
  "clients.biweekly": "Bi-weekly",
  "clients.monthly": "Monthly",
  "clients.oneTime": "One-time",

  // ── Clients: Placeholders ──
  "clients.placeholderProperty": "Thompson Residence",
  "clients.placeholderContact": "Linda Thompson",

  // ── Payment Method Labels ──
  "payments.venmo": "Venmo",
  "payments.zelle": "Zelle",
  "payments.creditCard": "Credit Card",
  "payments.cash": "Cash",
  "payments.check": "Check",

  // ── Settings ──
  "settings.settingsTitle": "Settings",

  // ── Team: Placeholders ──
  "team.placeholderName": "John Smith",
  "team.placeholderRole": "Technician",

  // ── Team: GPS Verification ──
  "team.clockInNow": "Clock In Now",
  "team.clockOutNow": "Clock Out Now",
  "team.gpsVerified": "GPS Verified",
  "team.gpsCapturing": "Capturing location...",
  "team.gpsPermissionDenied": "Location access denied. Entry saved without GPS.",
  "team.gpsNotAvailable": "GPS not available on this device.",
  "team.viewOnMap": "View on Map",
  "team.activeShift": "Active Shift",
  "team.clockedInAt": "Clocked in at {{time}}",
  "team.noActiveShift": "No active shift",

  // ── Invoice Sending ──
  "invoice.sendInvoice": "Send Invoice",
  "invoice.resendInvoice": "Resend Invoice",
  "invoice.invoiceSent": "Invoice Sent",
  "invoice.invoiceSentAt": "Sent {{date}}",
  "invoice.sendViaEmail": "Send via Email",
  "invoice.sendViaSMS": "Send via SMS",
  "invoice.copyLink": "Copy Link",
  "invoice.linkCopied": "Link copied!",
  "invoice.invoiceSentSuccess": "Invoice sent!",
  "invoice.paymentInstructions": "Payment Instructions",
  "invoice.invoiceFor": "Invoice from {{business}}",
  "invoice.amountDue": "AMOUNT DUE",
  "invoice.serviceDate": "SERVICE DATE",
  "invoice.from": "FROM",
  "invoice.emailPreview": "Email Preview",
  "invoice.smsPreview": "SMS Preview",
  "invoice.sendMethod": "SEND METHOD",
  "invoice.invoiceLink": "INVOICE LINK",
  "invoice.hi": "Hi",
  "invoice.invoiceBody": "This is an invoice for",
  "invoice.thankYou": "Thank you!",

  // ── Invoice Delivery ──
  "invoice.sending": "Sending...",
  "invoice.sendFailed": "Failed to send. Please try again.",
  "invoice.delivered": "Delivered",
  "invoice.deliveryHistory": "Delivery History",
  "invoice.noDeliveries": "No delivery history yet.",
  "invoice.sentViaEmail": "Sent via Email",
  "invoice.sentViaSMS": "Sent via SMS",

  // ── Trial / Subscription ──
  "trial.daysLeft": "{{count}} day(s) left in your free trial",
  "trial.expired": "Your free trial has expired.",
  "trial.expiredDesc": "Subscribe to continue creating and editing data.",
  "trial.subscribeNow": "Subscribe Now",
  "trial.upgradeNow": "Upgrade Now",
  "trial.readOnlyNotice": "Read-only mode \u2014 upgrade to make changes",

  // ── Settings: Subscription ──
  "settings.subscription": "Subscription",
  "settings.subscriptionDesc": "Manage your RunItSimply subscription plan.",
  "settings.currentPlan": "CURRENT PLAN",
  "settings.trialPlan": "Free Trial",
  "settings.proPlan": "Pro Plan",
  "settings.trialDaysLeft": "{{count}} day(s) remaining",
  "settings.trialExpired": "Trial Expired",
  "settings.proActive": "Active",
  "settings.proCancelled": "Cancelled",
  "settings.upgradeToPro": "Upgrade to Pro \u2014 $19.99/mo",
  "settings.upgrading": "Redirecting to checkout...",
  "settings.manageBilling": "Manage Billing",
  "settings.upgradeSuccess": "Welcome to Pro! Your subscription is now active.",
  "settings.stripeNotConfigured": "Payment system is being set up. Please try again later.",
} as const;

const es: Record<TranslationKey, string> = {
  // ── Navbar ──
  "nav.features": "Funciones",
  "nav.industries": "Industrias",
  "nav.pricing": "Precios",
  "nav.openDashboard": "Abrir Panel",

  // ── Hero ──
  "hero.badge": "NUEVO",
  "hero.badgeText": "Ahora para todos los negocios de servicio a domicilio",
  "hero.headline1": "Administra tu negocio",
  "hero.headline2": "de servicio f\u00E1cilmente",
  "hero.subtitle":
    "Programaci\u00F3n, gesti\u00F3n de equipos, seguimiento de clientes y pagos \u2014 todo en un solo lugar. Hecho para equipos peque\u00F1os que hacen un gran trabajo.",
  "hero.cta": "Probar el Panel",
  "hero.ctaSecondary": "Ver Demo",

  // ── Features ──
  "features.title1": "Todo lo que necesitas.",
  "features.title2": "Nada que no.",
  "features.smartScheduling": "Programaci\u00F3n Inteligente",
  "features.smartSchedulingDesc":
    "Calendario semanal. Asigna trabajos, horarios recurrentes, evita reservas dobles.",
  "features.timeTracking": "Control de Tiempo",
  "features.timeTrackingDesc":
    "Entrada/salida con un toque. Verificaci\u00F3n GPS, alertas de horas extra, exportar n\u00F3mina.",
  "features.teamManagement": "Gesti\u00F3n de Equipo",
  "features.teamManagementDesc":
    "Horas, disponibilidad, tarifas. El personal ve su horario diario en el m\u00F3vil.",
  "features.clientDatabase": "Base de Clientes",
  "features.clientDatabaseDesc":
    "Direcciones, c\u00F3digos de acceso, preferencias, historial de servicios \u2014 todo buscable.",
  "features.payments": "Pagos",
  "features.paymentsDesc":
    "Venmo, Zelle, tarjetas, efectivo. Facturas autom\u00E1ticas y enlaces de pago.",
  "features.communication": "Comunicaci\u00F3n",
  "features.communicationDesc":
    "Recordatorios autom\u00E1ticos, alertas en camino, confirmaciones de finalizaci\u00F3n.",

  // ── Industries ──
  "industries.title": "Hecho para tu oficio",
  "industries.subtitle": "Sea cual sea tu servicio, RunItSimply se adapta.",

  // ── Business types ──
  "businessType.cleaning": "Limpieza del Hogar",
  "businessType.landscaping": "Jardiner\u00EDa",
  "businessType.pool": "Servicio de Piscinas",
  "businessType.handyman": "Mantenimiento",
  "businessType.pressure": "Lavado a Presi\u00F3n",
  "businessType.pest": "Control de Plagas",
  "businessType.moving": "Mudanzas y Carga",
  "businessType.other": "Otros Servicios",

  // ── Testimonial ──
  "testimonial.quote":
    "\u201CManejaba todo con hojas de c\u00E1lculo y mensajes de texto. RunItSimply reemplaz\u00F3 todo en una tarde.\u201D",
  "testimonial.author": "Maria R.",
  "testimonial.company": "Sparkle & Shine Cleaning, Austin TX",

  // ── Pricing ──
  "pricing.title": "Precios simples",
  "pricing.subtitle": "Prueba gratis por 14 días. Sin tarjeta de crédito.",
  "pricing.starter": "Básico",
  "pricing.free": "Gratis",
  "pricing.freeTrial": "Prueba Gratis",
  "pricing.trialDuration": "14 días, todas las funciones incluidas",
  "pricing.upTo15": "Hasta 15 clientes",
  "pricing.pro": "Pro",
  "pricing.perMonth": "/mes",
  "pricing.unlimited": "Todo ilimitado",
  "pricing.popular": "POPULAR",
  "pricing.getStarted": "Comenzar",
  "pricing.startFreeTrial": "Iniciar Prueba Gratis",
  "pricing.startTrial": "Prueba Gratuita",
  "pricing.signUp": "Regístrate Ahora",
  "pricing.scheduling": "Programación",
  "pricing.team3": "Equipo (3 miembros)",
  "pricing.clientDb": "Base de clientes",
  "pricing.basicInvoicing": "Facturaci\u00F3n b\u00E1sica",
  "pricing.messaging": "Mensajer\u00EDa",
  "pricing.everythingStarter": "Todo del B\u00E1sico",
  "pricing.unlimitedClients": "Clientes ilimitados",
  "pricing.venmoZelle": "Enlaces Venmo y Zelle",
  "pricing.stripeAuto": "Cobro autom\u00E1tico Stripe",
  "pricing.smsReminders": "Recordatorios SMS",
  "pricing.gpsVerification": "Verificaci\u00F3n GPS",

  // ── CTA ──
  "cta.title": "\u00BFListo para dejar las hojas de c\u00E1lculo?",
  "cta.subtitle":
    "Configura en 5 minutos. No se requiere tarjeta de cr\u00E9dito.",
  "cta.button": "Comenzar Gratis",

  // ── Footer ──
  "footer.copyright": "\u00A9 2026 RunItSimply",
  "footer.contactTitle": "Cont\u00E1ctanos",
  "footer.contactSubtitle": "\u00BFPreguntas o necesitas ayuda? Env\u00EDanos un mensaje y te responderemos pronto.",
  "footer.nameLabel": "NOMBRE",
  "footer.namePlaceholder": "Tu nombre",
  "footer.emailLabel": "CORREO",
  "footer.emailPlaceholder": "tu@ejemplo.com",
  "footer.messageLabel": "MENSAJE",
  "footer.messagePlaceholder": "\u00BFEn qu\u00E9 podemos ayudarte?",
  "footer.send": "Enviar Mensaje",
  "footer.sending": "Enviando...",
  "footer.successTitle": "\u00A1Mensaje enviado!",
  "footer.successMessage": "Gracias por escribirnos. Te responderemos en 24 horas.",
  "footer.sendAnother": "Enviar otro mensaje",
  "footer.required": "Por favor completa todos los campos.",

  // ── Sidebar ──
  "sidebar.businessManager": "Gestor de Negocios",
  "sidebar.dashboard": "Panel",
  "sidebar.schedule": "Horario",
  "sidebar.team": "Equipo",
  "sidebar.clients": "Clientes",
  "sidebar.messages": "Mensajes",
  "sidebar.payments": "Pagos",
  "sidebar.settings": "Configuración",
  "sidebar.homepage": "Inicio",

  // ── Dashboard page ──
  "dashboard.title": "Panel",
  "dashboard.subtitle": "Tu semana de un vistazo",

  // ── KPI Cards ──
  "kpi.jobsThisWeek": "TRABAJOS ESTA SEMANA",
  "kpi.completed": "{{count}} completados",
  "kpi.hours": "HORAS",
  "kpi.thisWeek": "esta semana",
  "kpi.revenue": "INGRESOS",
  "kpi.estimated": "estimado",
  "kpi.teamLabel": "EQUIPO",
  "kpi.clientsCount": "{{count}} clientes",

  // ── Today's Schedule ──
  "todaysSchedule.title": "Horario de Hoy",
  "todaysSchedule.noJobs": "Sin trabajos hoy",

  // ── Team Availability ──
  "teamAvailability.title": "Disponibilidad del Equipo",

  // ── Schedule page ──
  "schedule.title": "Horario",
  "schedule.subtitle": "Administra y asigna trabajos",
  "schedule.newJob": "Nuevo Trabajo",
  "schedule.today": "Hoy",
  "schedule.week": "Semana",
  "schedule.month": "Mes",
  "schedule.noJobs": "Sin trabajos",
  "schedule.newJobTitle": "Nuevo Trabajo",
  "schedule.client": "CLIENTE",
  "schedule.selectClient": "Selecciona un cliente",
  "schedule.date": "FECHA",
  "schedule.time": "HORA",
  "schedule.duration": "DURACI\u00D3N (HORAS)",
  "schedule.assignEmployees": "ASIGNAR EMPLEADOS",
  "schedule.amount": "MONTO ($)",
  "schedule.saveJob": "Guardar Trabajo",
  "schedule.jobAdded": "\u00A1Trabajo agregado!",
  "schedule.jobDetails": "Detalles del Trabajo",
  "schedule.editJob": "Editar",
  "schedule.updateJob": "Guardar Cambios",
  "schedule.jobUpdated": "\u00A1Trabajo actualizado!",
  "schedule.status": "ESTADO",
  "schedule.markComplete": "Marcar Completado",
  "schedule.markScheduled": "Marcar Programado",
  "schedule.address": "DIRECCI\u00D3N",
  "schedule.paymentStatus": "PAGO",

  // ── Team page ──
  "team.title": "Miembros del Equipo",
  "team.subtitle": "Tu equipo de servicio",
  "team.addMember": "Agregar Miembro",
  "team.rate": "Tarifa",
  "team.jobsThisWeek": "Trabajos esta semana",
  "team.scheduledHours": "Horas programadas",
  "team.loggedHours": "Horas registradas",
  "team.capacity": "{{pct}}% capacidad",
  "team.clockInHistory": "Historial de Entrada",
  "team.noTimeEntries": "Sin registros de tiempo a\u00FAn.",
  "team.date": "Fecha",
  "team.clockIn": "Entrada",
  "team.clockOut": "Salida",
  "team.hoursCol": "Horas",
  "team.jobsWeek": "Trabajos Esta Semana ({{count}})",
  "team.noJobsWeek": "Sin trabajos programados esta semana.",

  // ── Clients page ──
  "clients.title": "Clientes",
  "clients.subtitle": "Administra propiedades y clientes",
  "clients.addClient": "Agregar Cliente",
  "clients.searchPlaceholder": "Buscar clientes, direcciones...",
  "clients.property": "PROPIEDAD",
  "clients.contact": "CONTACTO",
  "clients.address": "DIRECCI\u00D3N",
  "clients.service": "SERVICIO",
  "clients.frequency": "FRECUENCIA",
  "clients.payment": "PAGO",
  "clients.noResults": "No se encontraron clientes para \u201C{{query}}\u201D",
  "clients.serviceType": "TIPO DE SERVICIO",
  "clients.paymentMethod": "M\u00C9TODO DE PAGO",
  "clients.notes": "NOTAS",
  "clients.serviceHistory": "Historial de Servicio ({{count}} trabajos)",
  "clients.noHistory": "Sin historial de servicio a\u00FAn.",

  // ── Messages page ──
  "messages.title": "Mensajes",
  "messages.subtitle": "Comunicaci\u00F3n con equipo y clientes",
  "messages.all": "Todos",
  "messages.clientsTab": "Clientes",
  "messages.teamTab": "Equipo",
  "messages.client": "Cliente",
  "messages.teamMember": "Miembro del Equipo",
  "messages.placeholder": "Escribe un mensaje...",
  "messages.selectConvo": "Selecciona una conversaci\u00F3n para comenzar",
  "messages.newMessage": "Nuevo Mensaje",
  "messages.existingConvo": "Abrir conversaci\u00F3n existente",

  // ── Payments page ──
  "payments.title": "Pagos y Facturaci\u00F3n",
  "payments.subtitle": "Rastrear ingresos y facturas",
  "payments.totalRevenue": "INGRESOS TOTALES",
  "payments.collected": "COBRADO",
  "payments.pending": "PENDIENTE",
  "payments.invoicesCount": "{{count}} facturas",
  "payments.all": "todos",
  "payments.pendingTab": "pendiente",
  "payments.paidTab": "pagado",
  "payments.invoiceCol": "FACTURA",
  "payments.clientCol": "CLIENTE",
  "payments.dateCol": "FECHA",
  "payments.amountCol": "MONTO",
  "payments.statusCol": "ESTADO",
  "payments.methodCol": "M\u00C9TODO",
  "payments.collectPayment": "Cobrar Pago",
  "payments.markAsPaid": "Marcar como pagado",
  "payments.paymentReceived": "Pago recibido",
  "payments.paidVia": "Pagado v\u00EDa {{method}}",
  "payments.recorded": "\u00A1Pago registrado!",
  "payments.duration": "DURACI\u00D3N",
  "payments.time": "HORA",
  "payments.hours": "{{count}} horas",

  // ── Settings page ──
  "settings.title": "Configuraci\u00F3n",
  "settings.subtitle": "Configura las preferencias de tu negocio",
  "settings.paymentSetup": "Configuraci\u00F3n de Pagos",
  "settings.paymentSetupDesc":
    "Configura tus m\u00E9todos de pago para que los clientes puedan pagarte.",
  "settings.venmoHandle": "USUARIO VENMO",
  "settings.zelleEmail": "EMAIL / TEL\u00C9FONO ZELLE",
  "settings.stripeAutoCharge": "Cobro autom\u00E1tico Stripe",
  "settings.connected": "Conectado",
  "settings.notConnected": "No conectado",
  "settings.businessInfo": "Informaci\u00F3n del Negocio",
  "settings.businessInfoDesc": "Actualiza los datos de tu negocio.",
  "settings.businessName": "NOMBRE DEL NEGOCIO",
  "settings.phone": "TEL\u00C9FONO",
  "settings.email": "CORREO",

  // ── Reports page ──
  "sidebar.reports": "Reportes",
  "reports.title": "Reportes",
  "reports.subtitle": "Imprimir y guardar reportes del negocio",
  "reports.clientsTab": "Clientes",
  "reports.revenueTab": "Ingresos",
  "reports.employeeHoursTab": "Horas de Empleados",
  "reports.printSavePdf": "Imprimir / Guardar PDF",
  "reports.clientInfoReport": "Reporte de Información de Clientes",
  "reports.monthlyRevenueReport": "Reporte Mensual de Ingresos",
  "reports.employeeHoursReport": "Reporte de Horas de Empleados",
  "reports.totalRevenue": "Ingresos Totales",
  "reports.byClient": "Ingresos por Cliente",
  "reports.paymentSummary": "Resumen de Estado de Pago",
  "reports.paid": "Pagado",
  "reports.pending": "Pendiente",
  "reports.employee": "Empleado",
  "reports.role": "Rol",
  "reports.totalHours": "Horas Totales",
  "reports.generatedOn": "Generado el {{date}}",
  "reports.noTimeEntries": "Sin registros de tiempo.",
  "reports.jobCount": "Trabajos",
  "reports.totalAmount": "Monto Total",
  "reports.status": "Estado",

  // ── Settings: Employee Self-Log ──
  "settings.employeeLogging": "Registro de Horas de Empleados",
  "settings.employeeSelfLog": "Permitir a empleados registrar horas",
  "settings.employeeSelfLogDesc": "Cuando está habilitado, aparece un formulario en la página de Equipo para registrar entrada/salida.",
  "settings.enabled": "Habilitado",
  "settings.disabled": "Deshabilitado",

  // ── Team: Log Hours ──
  "team.logHours": "Registrar Horas",
  "team.logHoursTitle": "Registrar Horas de Empleado",
  "team.selectEmployee": "EMPLEADO",
  "team.entryDate": "FECHA",
  "team.clockInTime": "HORA DE ENTRADA",
  "team.clockOutTime": "HORA DE SALIDA",
  "team.saveEntry": "Guardar Registro",

  // ── Clients: Service Rate ──
  "clients.serviceRate": "TARIFA",
  "clients.serviceRateLabel": "TARIFA DE SERVICIO",
  "clients.perVisit": "por visita",
  "clients.editRate": "Editar",
  "clients.saveRate": "Guardar",
  "clients.rateType": "TIPO DE TARIFA",
  "clients.flatRate": "Tarifa Fija",
  "clients.hourlyRate": "Por Hora",
  "clients.perHour": "por hora",

  // ── Team: Earnings ──
  "team.earnings": "Ganancias",
  "team.totalEarnings": "Ganancias Totales",
  "team.perJob": "por trabajo",

  // ── Reports: Earnings ──
  "reports.earnings": "Ganancias",

  // ── Reports: Profit/Loss ──
  "reports.profitLossTab": "Ganancias/P\u00E9rdidas",
  "reports.profitLossReport": "Reporte de Ganancias y P\u00E9rdidas",
  "reports.netProfit": "Ganancia Neta",
  "reports.totalExpenses": "Total de Gastos",
  "reports.expensesByCategory": "Gastos por Categor\u00EDa",
  "reports.profitMargin": "Margen de Ganancia",
  "reports.noExpensesYet": "No hay gastos registrados a\u00FAn.",
  "reports.uncategorized": "Sin categor\u00EDa",
  "reports.expenseSingular": "gasto",
  "reports.expensePlural": "gastos",

  // ── Expenses ──
  "sidebar.expenses": "Gastos",
  "expenses.title": "Gastos",
  "expenses.subtitle": "Registra gastos y costos del negocio",
  "expenses.addExpense": "Agregar Gasto",
  "expenses.totalThisMonth": "Total Este Mes",
  "expenses.topCategory": "Categor\u00EDa Principal",
  "expenses.avgPerJob": "Promedio por Trabajo",
  "expenses.all": "Todos",
  "expenses.description": "DESCRIPCI\u00D3N",
  "expenses.amount": "MONTO ($)",
  "expenses.category": "CATEGOR\u00CDA",
  "expenses.vendor": "PROVEEDOR",
  "expenses.date": "FECHA",
  "expenses.notes": "NOTAS",
  "expenses.linkedJob": "TRABAJO VINCULADO (opcional)",
  "expenses.noLinkedJob": "Sin trabajo vinculado",
  "expenses.saveExpense": "Guardar Gasto",
  "expenses.expenseAdded": "\u00A1Gasto agregado!",
  "expenses.deleteExpense": "Eliminar",
  "expenses.expenseDeleted": "\u00A1Gasto eliminado!",
  "expenses.noExpenses": "Sin gastos a\u00FAn",

  // ── Settings: Payroll Privacy ──
  "settings.payrollPrivacy": "Ocultar nómina de empleados",
  "settings.payrollPrivacyDesc": "Cuando está habilitado, solo el dueño puede ver ganancias y tarifas. Los empleados solo ven sus horas.",

  // ── Settings: Referral Program ──
  "settings.referralProgram": "Programa de Referidos",
  "settings.referralDesc": "Comparte tu código. Ambos reciben $25 de crédito \u2014 tú ganas $25 cuando se registren, y ellos obtienen $25 de descuento. Cada persona solo puede ser referida una vez.",
  "settings.yourReferralCode": "TU CÓDIGO DE REFERIDO",
  "settings.copyCode": "Copiar",
  "settings.codeCopied": "¡Copiado!",
  "settings.shareLink": "ENLACE PARA COMPARTIR",
  "settings.referralStats": "ESTADÍSTICAS DE REFERIDOS",
  "settings.totalReferrals": "Referidos Exitosos",
  "settings.creditEarned": "Crédito Ganado",

  // ── Pricing: Referral ──
  "pricing.haveReferralCode": "¿Tienes un código de referido?",
  "pricing.enterCode": "Ingresa código de referido",
  "pricing.applyCode": "Aplicar",
  "pricing.codeApplied": "¡Código aplicado! Recibirás $25 de crédito en tu cuenta.",
  "pricing.codeAlreadyUsed": "Ya aplicaste un código de referido.",

  // ── Schedule: Delete Job ──
  "schedule.deleteJob": "Eliminar Trabajo",
  "schedule.jobDeleted": "\u00A1Trabajo eliminado!",
  "schedule.confirmDelete": "\u00BFEst\u00E1s seguro? Esto no se puede deshacer.",

  // ── Schedule: Recurring Jobs ──
  "schedule.recurring": "Recurrente",
  "schedule.repeatEvery": "REPETIR CADA",
  "schedule.none": "Ninguno (una vez)",
  "schedule.weekly": "Semanal",
  "schedule.biweekly": "Cada 2 Semanas",
  "schedule.monthly": "Mensual",
  "schedule.endDate": "FECHA FIN (opcional)",
  "schedule.recurringBadge": "Recurrente",
  "schedule.editSeries": "Editar Todos los Futuros",
  "schedule.editInstance": "Editar Solo Este",
  "schedule.cancelSeries": "Cancelar Serie",
  "schedule.seriesCancelled": "\u00A1Serie cancelada!",
  "schedule.previousWeek": "Semana anterior",
  "schedule.nextWeek": "Semana siguiente",

  // ── Clients: Add Client ──
  "clients.clientAdded": "¡Cliente agregado!",
  "clients.contactName": "NOMBRE DE CONTACTO",
  "clients.phone": "TELÉFONO",
  "clients.email": "CORREO ELECTRÓNICO",
  "clients.emailPlaceholder": "cliente@ejemplo.com",

  // ── Team: Add Member ──
  "team.memberAdded": "¡Miembro agregado!",
  "team.name": "NOMBRE",
  "team.phone": "TELÉFONO",
  "team.roleLabel": "ROL",
  "team.rateLabel": "TARIFA ($)",
  "team.payType": "TIPO DE PAGO",
  "team.hourly": "Por Hora",
  "team.saveMember": "Guardar Miembro",

  // ── Settings: Saved ──
  "settings.saved": "¡Guardado!",

  // ── Auth / Role Switcher ──
  "auth.owner": "Due\u00F1o",
  "auth.employee": "Empleado",
  "auth.switchRole": "Cambiar Rol",
  "auth.viewingAs": "Viendo como:",
  "auth.selectEmployee": "Seleccionar empleado",

  // ── Auth Pages ──
  "auth.login": "Iniciar Sesi\u00F3n",
  "auth.signup": "Crear Cuenta",
  "auth.email": "Correo electr\u00F3nico",
  "auth.password": "Contrase\u00F1a",
  "auth.businessName": "Nombre del Negocio",
  "auth.fullName": "Nombre Completo",
  "auth.signIn": "Iniciar Sesi\u00F3n",
  "auth.signUp": "Registrarse",
  "auth.signingIn": "Iniciando sesi\u00F3n\u2026",
  "auth.signingUp": "Creando cuenta\u2026",
  "auth.signOut": "Cerrar Sesi\u00F3n",
  "auth.noAccount": "\u00BFNo tienes cuenta?",
  "auth.hasAccount": "\u00BFYa tienes cuenta?",
  "auth.loginSubtitle": "Bienvenido de nuevo a RunItSimply",
  "auth.signupSubtitle": "Comienza a gestionar tu negocio",
  "auth.inviteTitle": "Aceptar Invitaci\u00F3n",
  "auth.inviteSubtitle": "Configura tu cuenta de empleado",
  "auth.inviteAccept": "Aceptar y Crear Cuenta",
  "auth.inviteInvalid": "Este enlace de invitaci\u00F3n es inv\u00E1lido o ha expirado.",
  "auth.loginError": "Correo o contrase\u00F1a inv\u00E1lidos",
  "auth.signupError": "No se pudo crear la cuenta. Int\u00E9ntalo de nuevo.",
  "auth.passwordMinLength": "La contrase\u00F1a debe tener al menos 6 caracteres",
  "auth.inviteEmployee": "Invitar",
  "auth.inviteModalTitle": "Invitar Empleado",
  "auth.inviteEmail": "Correo del Empleado",
  "auth.sendInvite": "Enviar Invitaci\u00F3n",
  "auth.inviteSent": "\u00A1Invitaci\u00F3n enviada!",
  "auth.invitePending": "Invitado",

  // ── Auth: Password Reset ──
  "auth.forgotPassword": "\u00BFOlvidaste tu contrase\u00F1a?",
  "auth.forgotPasswordSubtitle": "Ingresa tu correo y te enviaremos un enlace para restablecer",
  "auth.sendResetLink": "Enviar Enlace",
  "auth.sendingReset": "Enviando\u2026",
  "auth.checkEmail": "Revisa Tu Correo",
  "auth.resetEmailSent": "Te enviamos un enlace para restablecer tu contrase\u00F1a",
  "auth.resetEmailSentDetail": "Revisa tu bandeja de entrada. El enlace puede tardar un minuto en llegar.",
  "auth.backToLogin": "Volver a Iniciar Sesi\u00F3n",
  "auth.resetPassword": "Restablecer Contrase\u00F1a",
  "auth.resetPasswordSubtitle": "Ingresa tu nueva contrase\u00F1a",
  "auth.newPassword": "Nueva Contrase\u00F1a",
  "auth.confirmPassword": "Confirmar Contrase\u00F1a",
  "auth.passwordsNoMatch": "Las contrase\u00F1as no coinciden",
  "auth.resettingPassword": "Restableciendo\u2026",
  "auth.resetSuccessTitle": "\u00A1Contrase\u00F1a Actualizada!",
  "auth.resetSuccessMessage": "Tu contrase\u00F1a ha sido restablecida exitosamente. Redirigiendo al panel\u2026",
  "auth.redirectingToDashboard": "Redirigiendo\u2026",
  "auth.resetLinkInvalid": "Este enlace es inv\u00E1lido o ha expirado. Solicita uno nuevo.",
  "auth.requestNewLink": "Solicitar un nuevo enlace",
  "auth.resetError": "Algo sali\u00F3 mal. Int\u00E9ntalo de nuevo.",

  // ── Dashboard: Employee View ──
  "dashboard.mySubtitle": "Tu resumen de esta semana",

  // ── KPI: Employee View ──
  "kpi.myJobs": "MIS TRABAJOS",
  "kpi.myHours": "MIS HORAS",
  "kpi.myEarnings": "MIS GANANCIAS",
  "kpi.upcoming": "PR\u00D3XIMOS",

  // ── Common ──
  "common.completed": "completado",
  "common.scheduled": "programado",
  "common.unknown": "Desconocido",
  "common.confirmDelete": "\u00BFEst\u00E1s seguro? Esto no se puede deshacer.",
  "common.cancel": "Cancelar",
  "common.confirm": "Confirmar",
  "common.search": "Buscar...",
  "common.requiredFields": "Por favor completa todos los campos requeridos.",

  // ── Delete actions ──
  "clients.deleteClient": "Eliminar Cliente",
  "clients.clientDeleted": "\u00A1Cliente eliminado!",
  "clients.editClient": "Editar",
  "clients.clientUpdated": "\u00A1Cliente actualizado!",
  "clients.saveClient": "Guardar Cambios",
  "team.removeMember": "Eliminar Miembro",
  "team.memberRemoved": "\u00A1Miembro eliminado!",
  "team.memberUpdated": "\u00A1Miembro actualizado!",
  "team.editMember": "Editar",
  "team.noMembers": "\u00A1A\u00FAn no hay miembros. Agrega tu primer miembro!",
  "expenses.confirmDeleteExpense": "\u00BFEliminar este gasto?",
  "clients.noClients": "\u00A1A\u00FAn no hay clientes. Agrega tu primer cliente!",
  "expenses.noExpensesEmpty": "\u00A1A\u00FAn no hay gastos. Registra tu primer gasto!",
  "expenses.searchExpenses": "Buscar gastos",

  // ── Days of Week (short) ──
  "common.sun": "Dom",
  "common.mon": "Lun",
  "common.tue": "Mar",
  "common.wed": "Mi\u00E9",
  "common.thu": "Jue",
  "common.fri": "Vie",
  "common.sat": "S\u00E1b",

  // ── Schedule: Validation ──
  "schedule.formError": "Por favor completa todos los campos requeridos (cliente, fecha, hora, duraci\u00F3n).",

  // ── Schedule: SMS Reminders ──
  "schedule.sendReminders": "Enviar Recordatorios",
  "schedule.sendingReminders": "Enviando...",
  "schedule.remindersSent": "\u00A1{{count}} recordatorio(s) enviado(s)!",
  "schedule.noTomorrowJobs": "No hay trabajos programados para ma\u00F1ana.",
  "schedule.remindersNoPhones": "No hay n\u00FAmeros de tel\u00E9fono para los trabajos de ma\u00F1ana.",
  "schedule.reminderFailed": "Error al enviar recordatorios. Verifica la configuraci\u00F3n de Twilio.",

  // ── Clients: Frequency Options ──
  "clients.weekly": "Semanal",
  "clients.biweekly": "Quincenal",
  "clients.monthly": "Mensual",
  "clients.oneTime": "Una vez",

  // ── Clients: Placeholders ──
  "clients.placeholderProperty": "Residencia Thompson",
  "clients.placeholderContact": "Linda Thompson",

  // ── Payment Method Labels ──
  "payments.venmo": "Venmo",
  "payments.zelle": "Zelle",
  "payments.creditCard": "Tarjeta de Cr\u00E9dito",
  "payments.cash": "Efectivo",
  "payments.check": "Cheque",

  // ── Settings ──
  "settings.settingsTitle": "Configuraci\u00F3n",

  // ── Team: Placeholders ──
  "team.placeholderName": "Juan Garc\u00EDa",
  "team.placeholderRole": "T\u00E9cnico",

  // ── Team: GPS Verification ──
  "team.clockInNow": "Registrar Entrada",
  "team.clockOutNow": "Registrar Salida",
  "team.gpsVerified": "GPS Verificado",
  "team.gpsCapturing": "Capturando ubicaci\u00F3n...",
  "team.gpsPermissionDenied": "Acceso a ubicaci\u00F3n denegado. Registro guardado sin GPS.",
  "team.gpsNotAvailable": "GPS no disponible en este dispositivo.",
  "team.viewOnMap": "Ver en Mapa",
  "team.activeShift": "Turno Activo",
  "team.clockedInAt": "Entrada a las {{time}}",
  "team.noActiveShift": "Sin turno activo",

  // ── Invoice Sending ──
  "invoice.sendInvoice": "Enviar Factura",
  "invoice.resendInvoice": "Reenviar Factura",
  "invoice.invoiceSent": "Factura Enviada",
  "invoice.invoiceSentAt": "Enviada el {{date}}",
  "invoice.sendViaEmail": "Enviar por Email",
  "invoice.sendViaSMS": "Enviar por SMS",
  "invoice.copyLink": "Copiar Enlace",
  "invoice.linkCopied": "\u00A1Enlace copiado!",
  "invoice.invoiceSentSuccess": "\u00A1Factura enviada!",
  "invoice.paymentInstructions": "Instrucciones de Pago",
  "invoice.invoiceFor": "Factura de {{business}}",
  "invoice.amountDue": "MONTO ADEUDADO",
  "invoice.serviceDate": "FECHA DE SERVICIO",
  "invoice.from": "DE",
  "invoice.emailPreview": "Vista Previa de Email",
  "invoice.smsPreview": "Vista Previa de SMS",
  "invoice.sendMethod": "M\u00C9TODO DE ENV\u00CDO",
  "invoice.invoiceLink": "ENLACE DE FACTURA",
  "invoice.hi": "Hola",
  "invoice.invoiceBody": "Esta es una factura por",
  "invoice.thankYou": "\u00A1Gracias!",

  // ── Invoice Delivery ──
  "invoice.sending": "Enviando...",
  "invoice.sendFailed": "Error al enviar. Int\u00E9ntalo de nuevo.",
  "invoice.delivered": "Entregado",
  "invoice.deliveryHistory": "Historial de Env\u00EDos",
  "invoice.noDeliveries": "Sin historial de env\u00EDos a\u00FAn.",
  "invoice.sentViaEmail": "Enviado por Email",
  "invoice.sentViaSMS": "Enviado por SMS",

  // ── Trial / Subscription ──
  "trial.daysLeft": "{{count}} d\u00EDa(s) restante(s) en tu prueba gratuita",
  "trial.expired": "Tu prueba gratuita ha expirado.",
  "trial.expiredDesc": "Suscr\u00EDbete para seguir creando y editando datos.",
  "trial.subscribeNow": "Suscribirse Ahora",
  "trial.upgradeNow": "Actualizar Ahora",
  "trial.readOnlyNotice": "Modo solo lectura \u2014 actualiza para hacer cambios",

  // ── Settings: Subscription ──
  "settings.subscription": "Suscripci\u00F3n",
  "settings.subscriptionDesc": "Administra tu plan de suscripci\u00F3n de RunItSimply.",
  "settings.currentPlan": "PLAN ACTUAL",
  "settings.trialPlan": "Prueba Gratuita",
  "settings.proPlan": "Plan Pro",
  "settings.trialDaysLeft": "{{count}} d\u00EDa(s) restante(s)",
  "settings.trialExpired": "Prueba Expirada",
  "settings.proActive": "Activo",
  "settings.proCancelled": "Cancelado",
  "settings.upgradeToPro": "Actualizar a Pro \u2014 $19.99/mes",
  "settings.upgrading": "Redirigiendo al pago...",
  "settings.manageBilling": "Administrar Facturaci\u00F3n",
  "settings.upgradeSuccess": "\u00A1Bienvenido a Pro! Tu suscripci\u00F3n est\u00E1 activa.",
  "settings.stripeNotConfigured": "El sistema de pagos est\u00E1 en configuraci\u00F3n. Int\u00E9ntalo m\u00E1s tarde.",
};

export const dictionaries = { en, es } as const;
export type Language = keyof typeof dictionaries;
