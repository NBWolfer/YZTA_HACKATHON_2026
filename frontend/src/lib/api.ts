// ───── API Config ─────
// ✅ CORRECT: Use the environment variable name from .env.local
const API_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let errorMsg = `API error: ${res.status}`;
    try {
      const data = await res.json();
      if (data.detail) errorMsg = data.detail;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return res.json();
}
// ── Auth ──
export const login = (data: any) => fetchAPI<{success: boolean, user: any}>("/api/auth/login", {
  method: "POST",
  body: JSON.stringify(data),
});

export const signup = (data: any) => fetchAPI<{success: boolean, user: any}>("/api/auth/signup", {
  method: "POST",
  body: JSON.stringify(data),
});

// ── Dashboard ──
export const getDashboardSummary = () => fetchAPI<DashboardSummary>("/api/dashboard/summary");
export const getRecentActivities = () => fetchAPI<RecentActivities>("/api/dashboard/recent-activities");

// ── Inventory ──
export const getProducts = (category?: string) =>
  fetchAPI<ProductList>(`/api/inventory/products${category ? `?category=${category}` : ""}`);
export const getLowStock = () => fetchAPI<LowStockList>("/api/inventory/low-stock");
export const getCategories = () => fetchAPI<{ categories: string[] }>("/api/inventory/categories");
export const restockProduct = (productId: number, amount: number = 50) => 
  fetchAPI<{success: boolean, message: string, new_stock: number}>(`/api/inventory/${productId}/restock`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

// ── Orders ──
export const getOrders = (status?: string) =>
  fetchAPI<OrderList>(`/api/orders/${status ? `?status=${status}` : ""}`);
export const getOrder = (id: number) => fetchAPI<OrderDetail>(`/api/orders/${id}`);

// ── Chat ──
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
export interface ChatResponse {
  response: string;
  tool_calls: { tool: string; args: Record<string, unknown>; result: Record<string, unknown> }[];
}
export const sendChat = (messages: ChatMessage[], provider?: string) =>
  fetchAPI<ChatResponse>("/api/chat/", {
    method: "POST",
    body: JSON.stringify({ messages, provider }),
  });

export const sendWhatsAppMessage = async (number: string, message: string) => {
  const res = await fetch("http://localhost:3001/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number, message }),
  });
  if (!res.ok) throw new Error(`WhatsApp API error: ${res.status}`);
  return res.json();
};

export const getWhatsAppHistory = () => fetchAPI<{ conversations: Record<string, ChatMessage[]> }>("/api/chat/whatsapp/history");

// ── Types ──
export interface DashboardSummary {
  todays_orders: number;
  todays_revenue: number;
  active_deliveries: number;
  low_stock_alerts: number;
  weekly_volumes: { day: string; count: number }[];
}

export interface RecentActivities {
  activities: {
    order_id: number;
    customer_name: string;
    product_summary: string;
    status: string;
    amount: number;
    created_at: string;
  }[];
}

export interface ProductList {
  total: number;
  products: {
    id: number;
    name: string;
    category: string;
    stock_quantity: number;
    stock_unit: string;
    unit_price: number;
    low_stock_threshold: number;
    status: string;
  }[];
}

export interface LowStockList {
  count: number;
  products: {
    id: number;
    name: string;
    category: string;
    stock_quantity: number;
    stock_unit: string;
    threshold: number;
    status: string;
  }[];
}

export interface OrderList {
  total: number;
  orders: {
    id: number;
    customer: { id: number; name: string; city: string };
    status: string;
    total_amount: number;
    items: { product: string; quantity: number; unit_price: number }[];
    cargo: {
      provider: string;
      tracking_number: string;
      status: string;
      estimated_delivery: string;
    } | null;
    created_at: string;
  }[];
}

export type OrderDetail = OrderList["orders"][0] & {
  updated_at: string;
};
