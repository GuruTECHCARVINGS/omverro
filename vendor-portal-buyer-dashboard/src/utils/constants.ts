export const API_BASE_URL = "https://api.vendorportal.com/v1";

export const DASHBOARD_TILES = {
  PURCHASE_ORDERS: {
    title: "Purchase Orders",
    icon: "fas fa-file-invoice",
    dataKey: "purchaseOrders",
  },
  PENDING_APPROVALS: {
    title: "Pending Approvals",
    icon: "fas fa-check-circle",
    dataKey: "pendingApprovals",
  },
  TOTAL_SPEND: {
    title: "Total Spend",
    icon: "fas fa-chart-bar",
    dataKey: "totalSpend",
  },
  OPEN_INQUIRIES: {
    title: "Open Inquiries",
    icon: "fas fa-question-circle",
    dataKey: "openInquiries",
  },
};

export const SPEND_CATEGORIES = [
  { name: "Equipment", percentage: 30 },
  { name: "Services", percentage: 25 },
  { name: "Supplies", percentage: 30 },
  { name: "Other", percentage: 15 },
];

export const SAMPLE_DATA = {
  purchaseOrders: [
    { id: 1034, item: "Office chairs", amount: 4500 },
    { id: 1023, item: "Software licenses", amount: 12000 },
    { id: 1031, item: "Office supplies", amount: 1200 },
    { id: 1030, item: "IT equipment", amount: 25500 },
    { id: 1029, item: "Consulting services", amount: 8000 },
  ],
  pendingApprovals: 14,
  totalSpend: 560240,
  openInquiries: 5,
};