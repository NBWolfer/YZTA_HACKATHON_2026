"""Seed the database with realistic Turkish SME data (cooperative scenario).

Generates time-distributed orders with seasonal trends so the AI
"Tahmin Gör" button can produce meaningful demand predictions.
"""

from datetime import datetime, timedelta
import random
import math

from app.models import (
    Product, Customer, Order, OrderItem, CargoTracking,
    OrderStatus, CargoProvider,
)


def seed_all(db):
    random.seed(42)  # Reproducible data for demo consistency

    # ── Products (50 items — Turkish food, cosmetics, handicraft cooperative) ──
    products_data = [
        # (name, category, price, initial_stock, unit, threshold, popularity_weight)
        # popularity_weight: higher = sells more often (1-10 scale)
        ("Lavanta Sabunu", "Kozmetik", 12.50, 450, "Adet", 50, 9),
        ("Organik Zeytinyağı (1L)", "Gıda", 185.00, 120, "Adet", 20, 8),
        ("Gül Suyu (250ml)", "Kozmetik", 45.00, 80, "Adet", 15, 6),
        ("El Dokuma Kilim (60x90)", "El Sanatları", 1250.00, 8, "Adet", 5, 2),
        ("Organik Çiçek Balı (500g)", "Gıda", 320.00, 85, "Adet", 30, 7),
        ("Keçi Sütü Sabunu", "Kozmetik", 18.00, 320, "Adet", 50, 8),
        ("Kurutulmuş Domates (250g)", "Gıda", 65.00, 150, "Adet", 40, 6),
        ("Lavanta Yağı (50ml)", "Kozmetik", 95.00, 60, "Adet", 20, 5),
        ("Seramik Kase (El Yapımı)", "El Sanatları", 180.00, 25, "Adet", 10, 3),
        ("Tulum Peyniri (500g)", "Gıda", 210.00, 40, "Adet", 15, 6),
        ("Doğal Sünger", "Kozmetik", 35.00, 200, "Adet", 30, 4),
        ("Bergamot Reçeli (380g)", "Gıda", 85.00, 95, "Adet", 25, 5),
        ("Ahşap Kesme Tahtası", "El Sanatları", 145.00, 30, "Adet", 10, 3),
        ("Kekik Suyu (500ml)", "Gıda", 42.00, 180, "Adet", 40, 5),
        ("El Örgüsü Çorap", "El Sanatları", 75.00, 110, "Adet", 20, 4),
        ("Nar Ekşisi (330ml)", "Gıda", 55.00, 220, "Adet", 50, 7),
        ("Balmumu Mum (Set 3)", "El Sanatları", 120.00, 45, "Adet", 15, 3),
        ("Karakovan Balı (1kg)", "Gıda", 650.00, 18, "Adet", 10, 4),
        ("Ardıç Katranı Sabunu", "Kozmetik", 22.00, 280, "Adet", 40, 6),
        ("Antep Fıstığı (500g)", "Gıda", 380.00, 65, "Adet", 20, 5),
        ("Seramik Tabak (25cm)", "El Sanatları", 220.00, 15, "Adet", 8, 2),
        ("Sumak (250g)", "Gıda", 35.00, 300, "Adet", 50, 4),
        ("Doğal Lif Kesesi", "Kozmetik", 28.00, 190, "Adet", 30, 5),
        ("Çam Balı (500g)", "Gıda", 290.00, 55, "Adet", 20, 6),
        ("Bakır Cezve", "El Sanatları", 350.00, 20, "Adet", 8, 3),
        ("Defne Sabunu", "Kozmetik", 25.00, 400, "Adet", 60, 8),
        ("Kurutulmuş İncir (500g)", "Gıda", 120.00, 130, "Adet", 30, 5),
        ("El Boyaması Bardak", "El Sanatları", 95.00, 35, "Adet", 10, 2),
        ("Ihlamur (100g)", "Gıda", 48.00, 250, "Adet", 40, 4),
        ("Argan Yağı (50ml)", "Kozmetik", 110.00, 70, "Adet", 20, 5),
        ("Pekmez (700ml)", "Gıda", 75.00, 160, "Adet", 35, 6),
        ("Seramik Vazo", "El Sanatları", 280.00, 12, "Adet", 5, 2),
        ("Tarçın (Tüp 100g)", "Gıda", 30.00, 340, "Adet", 50, 4),
        ("Gül Sabunu", "Kozmetik", 15.00, 500, "Adet", 60, 9),
        ("Çörek Otu Yağı (100ml)", "Gıda", 88.00, 90, "Adet", 25, 5),
        ("Oymalı Ahşap Kaşık Set", "El Sanatları", 160.00, 22, "Adet", 8, 2),
        ("Kuru Kayısı (500g)", "Gıda", 95.00, 175, "Adet", 40, 6),
        ("Kantaron Yağı (100ml)", "Kozmetik", 72.00, 80, "Adet", 20, 4),
        ("Tahin (300g)", "Gıda", 58.00, 210, "Adet", 45, 5),
        ("Hasır Sepet (Orta)", "El Sanatları", 195.00, 18, "Adet", 8, 2),
        ("Organik Ceviz (500g)", "Gıda", 240.00, 50, "Adet", 15, 4),
        ("Kükürt Sabunu", "Kozmetik", 20.00, 350, "Adet", 50, 6),
        ("Dut Pekmezi (500ml)", "Gıda", 68.00, 140, "Adet", 30, 5),
        ("Seramik Çaydanlık", "El Sanatları", 420.00, 7, "Adet", 5, 1),
        ("Zencefil Tozu (100g)", "Gıda", 38.00, 270, "Adet", 40, 4),
        ("Doğal Taş Bileklik", "El Sanatları", 65.00, 90, "Adet", 20, 3),
        ("Salep (200g)", "Gıda", 195.00, 35, "Adet", 10, 3),
        ("Badem Yağı (100ml)", "Kozmetik", 85.00, 100, "Adet", 25, 4),
        ("Pul Biber (250g)", "Gıda", 45.00, 290, "Adet", 50, 7),
        ("İpek Fular", "El Sanatları", 380.00, 14, "Adet", 5, 2),
    ]

    products = []
    popularity_weights = []
    for name, cat, price, stock, unit, threshold, popularity in products_data:
        p = Product(
            name=name, category=cat, unit_price=price,
            stock_quantity=stock, stock_unit=unit,
            low_stock_threshold=threshold,
        )
        db.add(p)
        products.append(p)
        popularity_weights.append(popularity)
    db.flush()

    # ── Customers (80 profiles — Turkish names and cities) ──
    first_names = [
        "Ayşe", "Mehmet", "Fatma", "Ali", "Zeynep", "Mustafa", "Elif", "Ahmet",
        "Emine", "Hasan", "Merve", "Hüseyin", "Hatice", "İbrahim", "Esra",
        "Ömer", "Selin", "Yusuf", "Büşra", "Kemal", "Derya", "Emre", "Gizem",
        "Burak", "Nazlı", "Cem", "Aslı", "Tolga", "İrem", "Serkan", "Pınar",
        "Onur", "Damla", "Ufuk", "Ceren", "Volkan", "Melis", "Berk", "Deniz",
        "Kaan",
    ]
    last_names = [
        "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Öztürk", "Aydın",
        "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara",
        "Koç", "Kurt", "Özkan", "Yıldırım", "Erdoğan", "Polat",
    ]
    cities = [
        "İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Adana",
        "Konya", "Gaziantep", "Mersin", "Eskişehir", "Trabzon", "Samsun",
        "Denizli", "Muğla", "Aydın", "Hatay",
    ]

    # Turkify email helper
    def _ascii(s: str) -> str:
        for src, dst in [("ı", "i"), ("ö", "o"), ("ü", "u"), ("ş", "s"),
                         ("ç", "c"), ("ğ", "g"), ("İ", "i")]:
            s = s.replace(src, dst)
        return s.lower()

    # Demo customer linked to WhatsApp LID for live demo
    demo_customer = Customer(
        name="Enes Mahmut",
        phone="167182256349303",
        email="enes.mahmut@email.com",
        city="İstanbul",
    )
    db.add(demo_customer)

    customers = [demo_customer]
    used_names = {"Enes Mahmut"}
    while len(customers) < 80:
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        full = f"{fn} {ln}"
        if full in used_names:
            continue
        used_names.add(full)

        c = Customer(
            name=full,
            phone=f"+90 5{random.randint(30, 59):02d} {random.randint(100, 999)} {random.randint(10, 99)} {random.randint(10, 99)}",
            email=f"{_ascii(fn)}.{_ascii(ln)}@email.com",
            city=random.choice(cities),
        )
        db.add(c)
        customers.append(c)
    db.flush()

    # ── Helper: day-of-week sales multiplier (weekdays busier) ──
    def _day_multiplier(dt: datetime) -> float:
        """Mon-Fri have higher sales; Saturday moderate; Sunday low."""
        dow = dt.weekday()  # 0=Mon, 6=Sun
        return [1.2, 1.3, 1.1, 1.0, 1.4, 0.7, 0.4][dow]

    # ── Helper: weekly trend (gradual growth over 90 days) ──
    def _trend_multiplier(days_ago: int) -> float:
        """Simulate gradual business growth — recent days have ~30% more orders."""
        return 0.7 + 0.3 * (1 - days_ago / 90)

    # ── Generate 90 days of orders with realistic distribution ──
    now = datetime.utcnow()
    cargo_providers = list(CargoProvider)
    orders = []
    total_stock_sold = {p.id: 0 for p in products}

    for days_ago in range(90, -1, -1):
        day = now - timedelta(days=days_ago)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)

        # Base orders per day: ~3-6, modified by day-of-week and trend
        base_orders = random.uniform(3, 6)
        effective_orders = base_orders * _day_multiplier(day) * _trend_multiplier(days_ago)
        num_orders = max(1, int(round(effective_orders)))

        # Today gets a guaranteed 12-18 orders for demo visibility
        if days_ago == 0:
            num_orders = random.randint(12, 18)

        for _ in range(num_orders):
            # Random time within the business day (08:00 - 22:00)
            hour = random.randint(8, 21)
            minute = random.randint(0, 59)
            order_date = day_start + timedelta(hours=hour, minutes=minute)

            # For today, spread across real elapsed hours
            if days_ago == 0:
                hours_elapsed = min(now.hour, 21)
                hour = random.randint(8, max(8, hours_elapsed))
                order_date = day_start + timedelta(hours=hour, minutes=minute)

            cust = random.choice(customers)

            # Determine order status based on age
            if days_ago == 0:
                status = random.choice([
                    OrderStatus.HAZIRLANIYOR,
                    OrderStatus.HAZIRLANIYOR,
                    OrderStatus.KARGOYA_VERILDI,
                    OrderStatus.YOLDA,
                ])
            elif days_ago <= 3:
                status = random.choice([
                    OrderStatus.HAZIRLANIYOR,
                    OrderStatus.KARGOYA_VERILDI,
                    OrderStatus.YOLDA,
                    OrderStatus.TESLIM_EDILDI,
                ])
            else:
                status = random.choices(
                    [OrderStatus.TESLIM_EDILDI, OrderStatus.IPTAL],
                    weights=[0.92, 0.08],
                )[0]

            order = Order(
                customer_id=cust.id,
                status=status,
                created_at=order_date,
                updated_at=order_date + timedelta(
                    hours=random.randint(1, 48) if days_ago > 0 else 0
                ),
            )
            db.add(order)
            db.flush()

            # 1-4 items per order, weighted by product popularity
            num_items = random.randint(1, 4)
            chosen_products = random.choices(
                products, weights=popularity_weights, k=num_items
            )
            # Deduplicate (same product can't appear twice in one order)
            seen_ids = set()
            unique_products = []
            for prod in chosen_products:
                if prod.id not in seen_ids:
                    seen_ids.add(prod.id)
                    unique_products.append(prod)

            total = 0.0
            for prod in unique_products:
                qty = random.randint(1, 5)
                item = OrderItem(
                    order_id=order.id,
                    product_id=prod.id,
                    quantity=qty,
                    unit_price=prod.unit_price,
                )
                db.add(item)
                total += prod.unit_price * qty
                total_stock_sold[prod.id] = total_stock_sold.get(prod.id, 0) + qty

            order.total_amount = round(total, 2)

            # Add cargo tracking for shipped/delivered orders
            if status in (OrderStatus.KARGOYA_VERILDI, OrderStatus.YOLDA, OrderStatus.TESLIM_EDILDI):
                provider = random.choice(cargo_providers)
                if status == OrderStatus.TESLIM_EDILDI:
                    cargo_status = "Teslim Edildi"
                elif status == OrderStatus.KARGOYA_VERILDI:
                    cargo_status = "Transfer Merkezinde"
                else:
                    cargo_status = "Kurye Dağıtımda"

                cargo = CargoTracking(
                    order_id=order.id,
                    provider=provider,
                    tracking_number=f"TR-{random.randint(100000000, 999999999)}",
                    status=cargo_status,
                    estimated_delivery=(order_date + timedelta(days=random.randint(2, 5))).strftime("%d/%m/%Y"),
                )
                db.add(cargo)

            orders.append(order)

    # ── Dedicated orders for demo customer (Enes Mahmut) ──
    demo_orders_spec = [
        # (days_ago, status, items: [(product_index, qty), ...])
        (15, OrderStatus.TESLIM_EDILDI, [(0, 3), (5, 2)]),          # Lavanta Sabunu x3, Keçi Sütü Sabunu x2
        (10, OrderStatus.TESLIM_EDILDI, [(1, 1), (4, 2)]),          # Zeytinyağı x1, Çiçek Balı x2
        (5,  OrderStatus.IPTAL,         [(19, 1)]),                  # Antep Fıstığı x1 (cancelled)
        (3,  OrderStatus.YOLDA,         [(15, 4), (30, 2)]),        # Nar Ekşisi x4, Pekmez x2
        (1,  OrderStatus.KARGOYA_VERILDI, [(25, 5), (33, 3)]),     # Defne Sabunu x5, Gül Sabunu x3
        (0,  OrderStatus.HAZIRLANIYOR,  [(23, 2), (48, 1), (6, 3)]), # Çam Balı x2, Pul Biber x1, Kurutulmuş Domates x3
    ]

    for days_ago, status, items_spec in demo_orders_spec:
        order_date = (now - timedelta(days=days_ago)).replace(
            hour=random.randint(9, 18), minute=random.randint(0, 59), second=0, microsecond=0
        )
        order = Order(
            customer_id=demo_customer.id,
            status=status,
            created_at=order_date,
            updated_at=order_date + timedelta(hours=random.randint(1, 24)),
        )
        db.add(order)
        db.flush()

        total = 0.0
        for prod_idx, qty in items_spec:
            prod = products[prod_idx]
            item = OrderItem(
                order_id=order.id,
                product_id=prod.id,
                quantity=qty,
                unit_price=prod.unit_price,
            )
            db.add(item)
            total += prod.unit_price * qty
            total_stock_sold[prod.id] = total_stock_sold.get(prod.id, 0) + qty

        order.total_amount = round(total, 2)

        if status in (OrderStatus.KARGOYA_VERILDI, OrderStatus.YOLDA, OrderStatus.TESLIM_EDILDI):
            cargo_status_map = {
                OrderStatus.TESLIM_EDILDI: "Teslim Edildi",
                OrderStatus.KARGOYA_VERILDI: "Transfer Merkezinde",
                OrderStatus.YOLDA: "Kurye Dağıtımda",
            }
            cargo = CargoTracking(
                order_id=order.id,
                provider=random.choice(cargo_providers),
                tracking_number=f"TR-{random.randint(100000000, 999999999)}",
                status=cargo_status_map[status],
                estimated_delivery=(order_date + timedelta(days=random.randint(2, 5))).strftime("%d/%m/%Y"),
            )
            db.add(cargo)

        orders.append(order)

    # ── Adjust stock levels based on actual sales ──
    # Deduct sold quantities so stock reflects real sales history
    for p in products:
        sold = total_stock_sold.get(p.id, 0)
        # Start with a higher initial stock, then deduct sales
        original_stock = p.stock_quantity
        p.stock_quantity = max(0, original_stock - int(sold * 0.3))

    # Force a few products into critical/out-of-stock for demo visibility
    critical_indices = [2, 3, 17, 31, 43]  # Gül Suyu, Kilim, Karakovan, Vazo, Çaydanlık
    for idx in critical_indices:
        if idx < len(products):
            products[idx].stock_quantity = random.randint(0, 3)

    low_stock_indices = [9, 20, 39, 46]  # Tulum, Seramik Tabak, Hasır Sepet, Salep
    for idx in low_stock_indices:
        if idx < len(products):
            products[idx].stock_quantity = random.randint(
                max(1, products[idx].low_stock_threshold - 5),
                products[idx].low_stock_threshold,
            )

    db.commit()
    print(f"Seeded: {len(products)} products, {len(customers)} customers, {len(orders)} orders")
    print(f"  Today's orders: {sum(1 for o in orders if (now - o.created_at).days == 0)}")
    print(f"  Critical stock items: {sum(1 for p in products if p.stock_quantity <= p.low_stock_threshold)}")
