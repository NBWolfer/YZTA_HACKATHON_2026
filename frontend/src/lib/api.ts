// ───── API Config ─────
// Next.js requires NEXT_PUBLIC_ prefix for client-side env vars
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Simple in-memory cache for GET requests
const apiCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 15000; // 15 seconds

export async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const isGet = !options || !options.method || options.method.toUpperCase() === "GET";
  
  if (isGet) {
    const cached = apiCache.get(path);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

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
  
  const data = await res.json();
  if (isGet) {
    apiCache.set(path, { data, timestamp: Date.now() });
  }
  return data;
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

export const createProduct = (data: { name: string, category: string, unit_price: number, stock_quantity: number, stock_unit: string, low_stock_threshold: number }) =>
  fetchAPI<{success: boolean, message: string, product_id: number}>("/api/inventory/products", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const importProductsCSV = async (file: File): Promise<{success: boolean, message: string}> => {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${API_URL}/api/inventory/products/import`, {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) {
    let errStr = "HTTP Hata " + res.status;
    try {
      const errJson = await res.json();
      errStr = errJson.detail || errStr;
    } catch { }
    throw new Error(errStr);
  }
  
  return res.json();
};

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

// ── Agent Logs ──
export interface AgentLogEntry {
  time: string;
  agent: string;
  message: string;
  level?: "info" | "warn" | "error";
}
export const getAgentLogs = (since: number = 0) =>
  fetchAPI<{ logs: AgentLogEntry[]; next_index: number }>(`/api/agents/logs?since=${since}`);

// ── Predictions ──
export interface PredictionResult {
  product: {
    id: number;
    name: string;
    category: string;
    stock_quantity: number;
    stock_unit: string;
    unit_price: number;
  };
  analysis: {
    total_sold_90d: number;
    daily_velocity: number;
    trend_direction: "up" | "down" | "stable";
    trend_percent: number;
    last_7_days_total: number;
    prev_7_days_total: number;
  };
  forecast: {
    daily: number[];
    weekly_total: number;
    days_until_stockout: number | null;
  };
  insight: string;
  reorder: {
    suggested_quantity: number;
    estimated_cost: number;
  };
}
export const getPrediction = (productId: number) =>
  fetchAPI<PredictionResult>(`/api/inventory/predict/${productId}`);

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
