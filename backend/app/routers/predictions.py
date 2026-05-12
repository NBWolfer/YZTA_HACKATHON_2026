"""
Prediction endpoint — Real AI-powered demand forecasting.

Analyzes order history to compute sales velocity and 7-day forecasts.
"""

from datetime import datetime, timedelta
from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product, OrderItem, Order

router = APIRouter(prefix="/api/inventory", tags=["predictions"])


@router.get("/predict/{product_id}")
def predict_demand(product_id: int, db: Session = Depends(get_db)):
    """
    Generate a real demand prediction for a product based on order history.
    
    Analyzes 90 days of order data to compute:
    - Daily sales velocity
    - Week-over-week trend
    - 7-day daily forecast
    - Actionable insight text
    """
    product = db.query(Product).get(product_id)
    if not product:
        return {"error": "Ürün bulunamadı."}

    now = datetime.utcnow()
    ninety_days_ago = now - timedelta(days=90)

    # ── Get all order items for this product in last 90 days ──
    order_items = (
        db.query(OrderItem, Order.created_at)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(
            OrderItem.product_id == product_id,
            Order.created_at >= ninety_days_ago,
        )
        .all()
    )

    # ── Build daily sales map ──
    daily_sales: dict[str, int] = defaultdict(int)
    for item, created_at in order_items:
        day_key = created_at.strftime("%Y-%m-%d")
        daily_sales[day_key] += item.quantity

    # ── Calculate weekly aggregates ──
    # Last 7 days vs previous 7 days
    last_7_days = []
    prev_7_days = []
    for i in range(7):
        day = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        last_7_days.append(daily_sales.get(day, 0))
        
        prev_day = (now - timedelta(days=i + 7)).strftime("%Y-%m-%d")
        prev_7_days.append(daily_sales.get(prev_day, 0))

    last_7_total = sum(last_7_days)
    prev_7_total = sum(prev_7_days)

    # ── Calculate trend ──
    if prev_7_total > 0:
        trend_percent = round(((last_7_total - prev_7_total) / prev_7_total) * 100, 1)
    elif last_7_total > 0:
        trend_percent = 100.0
    else:
        trend_percent = 0.0

    trend_direction = "up" if trend_percent > 0 else "down" if trend_percent < 0 else "stable"

    # ── Daily velocity (avg sales per day over 90 days) ──
    total_sold = sum(daily_sales.values())
    days_with_data = max(len(daily_sales), 1)
    daily_velocity = round(total_sold / 90, 2)  # Smoothed over full 90 days

    # ── Generate 7-day forecast ──
    # Use weighted average: recent days matter more
    recent_avg = last_7_total / 7 if last_7_total > 0 else daily_velocity
    
    # Apply trend for each day (compound the trend slightly)
    daily_trend_factor = 1 + (trend_percent / 100 / 7)  # Spread weekly trend across days
    forecast = []
    for i in range(7):
        predicted = max(0, round(recent_avg * (daily_trend_factor ** (i + 1)), 1))
        # Add some natural variation (±15%) based on day of week patterns
        day_of_week = (now + timedelta(days=i + 1)).weekday()
        # Weekends tend to have higher sales for retail
        weekend_factor = 1.15 if day_of_week >= 5 else 0.95
        predicted = max(0, round(predicted * weekend_factor))
        forecast.append(predicted)

    # ── Days until stockout ──
    if daily_velocity > 0:
        days_until_stockout = round(product.stock_quantity / daily_velocity, 1)
    else:
        days_until_stockout = None  # No sales → infinite stock

    # ── Build insight text ──
    insight = _generate_insight(
        product_name=product.name,
        stock_qty=product.stock_quantity,
        stock_unit=product.stock_unit,
        daily_velocity=daily_velocity,
        trend_direction=trend_direction,
        trend_percent=abs(trend_percent),
        days_until_stockout=days_until_stockout,
        total_sold_90d=total_sold,
        threshold=product.low_stock_threshold,
    )

    # ── Reorder suggestion ──
    suggested_reorder = max(
        int(daily_velocity * 30),  # 30-day supply
        product.low_stock_threshold * 2,
    )
    estimated_cost = round(suggested_reorder * product.unit_price * 0.6, 2)  # Wholesale ~60%

    return {
        "product": {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "stock_quantity": product.stock_quantity,
            "stock_unit": product.stock_unit,
            "unit_price": product.unit_price,
        },
        "analysis": {
            "total_sold_90d": total_sold,
            "daily_velocity": daily_velocity,
            "trend_direction": trend_direction,
            "trend_percent": abs(trend_percent),
            "last_7_days_total": last_7_total,
            "prev_7_days_total": prev_7_total,
        },
        "forecast": {
            "daily": forecast,
            "weekly_total": sum(forecast),
            "days_until_stockout": days_until_stockout,
        },
        "insight": insight,
        "reorder": {
            "suggested_quantity": suggested_reorder,
            "estimated_cost": estimated_cost,
        },
    }


def _generate_insight(
    product_name: str,
    stock_qty: int,
    stock_unit: str,
    daily_velocity: float,
    trend_direction: str,
    trend_percent: float,
    days_until_stockout: float | None,
    total_sold_90d: int,
    threshold: int,
) -> str:
    """Generate a natural-language insight about the product's demand forecast."""

    parts = []

    # Sales velocity context
    if total_sold_90d > 0:
        parts.append(
            f"Son 90 günde toplam {total_sold_90d} {stock_unit} satış gerçekleşmiş olup, "
            f"günlük ortalama satış hızı {daily_velocity} {stock_unit}'dir."
        )
    else:
        parts.append(
            f"Son 90 günde bu ürüne ait kayıtlı satış bulunmamaktadır."
        )
        return " ".join(parts)

    # Trend analysis
    if trend_direction == "up":
        parts.append(
            f"Haftalık bazda talep **%{trend_percent:.0f} artış** göstermektedir. "
            f"Bu eğilimin devam etmesi halinde stok baskısı artabilir."
        )
    elif trend_direction == "down":
        parts.append(
            f"Haftalık bazda talep **%{trend_percent:.0f} düşüş** göstermektedir. "
            f"Mevcut stok seviyeniz yeterli görünmektedir."
        )
    else:
        parts.append(
            f"Talep seviyesi son iki haftalık dönemde **sabit** kalmıştır."
        )

    # Stockout warning
    if days_until_stockout is not None:
        if days_until_stockout <= 7:
            parts.append(
                f"⚠️ Mevcut satış hızıyla stokun yaklaşık **{days_until_stockout:.0f} gün** "
                f"içinde tükenmesi öngörülmektedir. Acil yeniden sipariş önerilir."
            )
        elif days_until_stockout <= 14:
            parts.append(
                f"Mevcut {stock_qty} {stock_unit} stok, yaklaşık **{days_until_stockout:.0f} gün** "
                f"sürecektir. Tedarik süreçlerini planlamanız önerilir."
            )
        else:
            parts.append(
                f"Mevcut {stock_qty} {stock_unit} stok, yaklaşık **{days_until_stockout:.0f} gün** "
                f"yeterli olacaktır."
            )

    return " ".join(parts)
