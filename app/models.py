from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from decimal import Decimal
from enum import Enum


# Enums for status fields
class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    PRODUCTION = "production"
    INVENTORY = "inventory"


class ProductType(str, Enum):
    RAW_MATERIAL = "raw_material"
    FINISHED_GOOD = "finished_good"
    COMPONENT = "component"


class StockMovementType(str, Enum):
    IN = "in"
    OUT = "out"
    ADJUSTMENT = "adjustment"
    PRODUCTION_IN = "production_in"
    PRODUCTION_OUT = "production_out"


class ProductionOrderStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SalesOrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PRODUCTION = "production"
    READY = "ready"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    UNPAID = "unpaid"
    PARTIAL = "partial"
    PAID = "paid"
    REFUNDED = "refunded"


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    SICK = "sick"
    LEAVE = "leave"


class Marketplace(str, Enum):
    TOKOPEDIA = "tokopedia"
    SHOPEE = "shopee"
    LAZADA = "lazada"
    BUKALAPAK = "bukalapak"
    OFFLINE = "offline"


# User Management
class User(SQLModel, table=True):
    __tablename__ = "users"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, max_length=50)
    email: str = Field(unique=True, max_length=255)
    password_hash: str = Field(max_length=255)
    full_name: str = Field(max_length=100)
    role: UserRole = Field(default=UserRole.EMPLOYEE)
    phone: Optional[str] = Field(default=None, max_length=20)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    attendance_records: List["Attendance"] = Relationship(back_populates="user")
    created_orders: List["SalesOrder"] = Relationship(back_populates="created_by")
    production_orders: List["ProductionOrder"] = Relationship(back_populates="assigned_to")


# Product Catalog
class Product(SQLModel, table=True):
    __tablename__ = "products"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(unique=True, max_length=50)
    name: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    product_type: ProductType
    unit: str = Field(max_length=20)  # pcs, meter, kg, etc.
    cost_price: Decimal = Field(decimal_places=2, default=Decimal("0"))
    selling_price: Optional[Decimal] = Field(default=None, decimal_places=2)
    minimum_stock: Decimal = Field(decimal_places=2, default=Decimal("0"))
    current_stock: Decimal = Field(decimal_places=2, default=Decimal("0"))
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    stock_movements: List["StockMovement"] = Relationship(back_populates="product")
    bom_items: List["BOMItem"] = Relationship(back_populates="product")
    bom_materials: List["BOMItem"] = Relationship(back_populates="material")
    order_items: List["SalesOrderItem"] = Relationship(back_populates="product")
    production_materials: List["ProductionMaterial"] = Relationship(back_populates="material")


# Bill of Materials
class BOM(SQLModel, table=True):
    __tablename__ = "boms"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id")
    version: str = Field(max_length=20, default="1.0")
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    product: Product = Relationship()
    items: List["BOMItem"] = Relationship(back_populates="bom")


class BOMItem(SQLModel, table=True):
    __tablename__ = "bom_items"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    bom_id: int = Field(foreign_key="boms.id")
    material_id: int = Field(foreign_key="products.id")
    quantity: Decimal = Field(decimal_places=4)
    unit: str = Field(max_length=20)

    # Relationships
    bom: BOM = Relationship(back_populates="items")
    material: Product = Relationship(back_populates="bom_materials")
    product: Product = Relationship(back_populates="bom_items")


# Inventory Management
class StockMovement(SQLModel, table=True):
    __tablename__ = "stock_movements"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id")
    movement_type: StockMovementType
    quantity: Decimal = Field(decimal_places=4)
    unit_cost: Decimal = Field(decimal_places=2, default=Decimal("0"))
    total_cost: Decimal = Field(decimal_places=2, default=Decimal("0"))
    reference_type: Optional[str] = Field(default=None, max_length=50)  # sales_order, production_order, adjustment
    reference_id: Optional[int] = Field(default=None)
    notes: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: int = Field(foreign_key="users.id")

    # Relationships
    product: Product = Relationship(back_populates="stock_movements")


# Stock Opname
class StockOpname(SQLModel, table=True):
    __tablename__ = "stock_opnames"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    opname_date: date
    notes: Optional[str] = Field(default=None, max_length=500)
    status: str = Field(max_length=20, default="draft")  # draft, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: int = Field(foreign_key="users.id")

    # Relationships
    items: List["StockOpnameItem"] = Relationship(back_populates="stock_opname")


class StockOpnameItem(SQLModel, table=True):
    __tablename__ = "stock_opname_items"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    stock_opname_id: int = Field(foreign_key="stock_opnames.id")
    product_id: int = Field(foreign_key="products.id")
    system_stock: Decimal = Field(decimal_places=4)
    physical_stock: Decimal = Field(decimal_places=4)
    difference: Decimal = Field(decimal_places=4)
    notes: Optional[str] = Field(default=None, max_length=200)

    # Relationships
    stock_opname: StockOpname = Relationship(back_populates="items")
    product: Product = Relationship()


# Production Management
class ProductionOrder(SQLModel, table=True):
    __tablename__ = "production_orders"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    order_number: str = Field(unique=True, max_length=50)
    product_id: int = Field(foreign_key="products.id")
    quantity: Decimal = Field(decimal_places=4)
    target_date: date
    status: ProductionOrderStatus = Field(default=ProductionOrderStatus.PENDING)
    assigned_to: Optional[int] = Field(default=None, foreign_key="users.id")
    actual_quantity: Optional[Decimal] = Field(default=None, decimal_places=4)
    start_date: Optional[date] = Field(default=None)
    completion_date: Optional[date] = Field(default=None)
    notes: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    product: Product = Relationship()
    assigned_user: Optional[User] = Relationship(back_populates="production_orders")
    materials: List["ProductionMaterial"] = Relationship(back_populates="production_order")


class ProductionMaterial(SQLModel, table=True):
    __tablename__ = "production_materials"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    production_order_id: int = Field(foreign_key="production_orders.id")
    material_id: int = Field(foreign_key="products.id")
    required_quantity: Decimal = Field(decimal_places=4)
    used_quantity: Optional[Decimal] = Field(default=None, decimal_places=4)
    unit_cost: Decimal = Field(decimal_places=2, default=Decimal("0"))

    # Relationships
    production_order: ProductionOrder = Relationship(back_populates="materials")
    material: Product = Relationship(back_populates="production_materials")


# Sales Management
class Customer(SQLModel, table=True):
    __tablename__ = "customers"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=200)
    email: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None, max_length=500)
    city: Optional[str] = Field(default=None, max_length=100)
    marketplace: Marketplace = Field(default=Marketplace.OFFLINE)
    marketplace_username: Optional[str] = Field(default=None, max_length=100)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    orders: List["SalesOrder"] = Relationship(back_populates="customer")


class SalesOrder(SQLModel, table=True):
    __tablename__ = "sales_orders"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    order_number: str = Field(unique=True, max_length=50)
    customer_id: int = Field(foreign_key="customers.id")
    order_date: date
    delivery_date: Optional[date] = Field(default=None)
    status: SalesOrderStatus = Field(default=SalesOrderStatus.PENDING)
    payment_status: PaymentStatus = Field(default=PaymentStatus.UNPAID)
    marketplace: Marketplace = Field(default=Marketplace.OFFLINE)
    marketplace_order_id: Optional[str] = Field(default=None, max_length=100)
    subtotal: Decimal = Field(decimal_places=2, default=Decimal("0"))
    shipping_cost: Decimal = Field(decimal_places=2, default=Decimal("0"))
    total_amount: Decimal = Field(decimal_places=2, default=Decimal("0"))
    paid_amount: Decimal = Field(decimal_places=2, default=Decimal("0"))
    notes: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: int = Field(foreign_key="users.id")

    # Relationships
    customer: Customer = Relationship(back_populates="orders")
    created_by_user: User = Relationship(back_populates="created_orders")
    items: List["SalesOrderItem"] = Relationship(back_populates="sales_order")
    delivery_orders: List["DeliveryOrder"] = Relationship(back_populates="sales_order")


class SalesOrderItem(SQLModel, table=True):
    __tablename__ = "sales_order_items"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    sales_order_id: int = Field(foreign_key="sales_orders.id")
    product_id: int = Field(foreign_key="products.id")
    quantity: Decimal = Field(decimal_places=4)
    unit_price: Decimal = Field(decimal_places=2)
    discount: Decimal = Field(decimal_places=2, default=Decimal("0"))
    total_price: Decimal = Field(decimal_places=2)

    # Relationships
    sales_order: SalesOrder = Relationship(back_populates="items")
    product: Product = Relationship(back_populates="order_items")


# Delivery Management
class DeliveryOrder(SQLModel, table=True):
    __tablename__ = "delivery_orders"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    delivery_number: str = Field(unique=True, max_length=50)
    sales_order_id: int = Field(foreign_key="sales_orders.id")
    delivery_date: date
    recipient_name: str = Field(max_length=200)
    recipient_phone: Optional[str] = Field(default=None, max_length=20)
    delivery_address: str = Field(max_length=500)
    courier: Optional[str] = Field(default=None, max_length=100)
    tracking_number: Optional[str] = Field(default=None, max_length=100)
    status: str = Field(max_length=20, default="pending")  # pending, shipped, delivered
    notes: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    sales_order: SalesOrder = Relationship(back_populates="delivery_orders")
    items: List["DeliveryOrderItem"] = Relationship(back_populates="delivery_order")


class DeliveryOrderItem(SQLModel, table=True):
    __tablename__ = "delivery_order_items"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    delivery_order_id: int = Field(foreign_key="delivery_orders.id")
    product_id: int = Field(foreign_key="products.id")
    quantity: Decimal = Field(decimal_places=4)

    # Relationships
    delivery_order: DeliveryOrder = Relationship(back_populates="items")
    product: Product = Relationship()


# Financial Management
class COGSCalculation(SQLModel, table=True):
    __tablename__ = "cogs_calculations"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id")
    calculation_date: date
    material_cost: Decimal = Field(decimal_places=2, default=Decimal("0"))
    labor_cost: Decimal = Field(decimal_places=2, default=Decimal("0"))
    overhead_cost: Decimal = Field(decimal_places=2, default=Decimal("0"))
    total_cogs: Decimal = Field(decimal_places=2, default=Decimal("0"))
    quantity: Decimal = Field(decimal_places=4)
    unit_cogs: Decimal = Field(decimal_places=2, default=Decimal("0"))
    notes: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    product: Product = Relationship()


class FinancialReport(SQLModel, table=True):
    __tablename__ = "financial_reports"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    report_date: date
    report_type: str = Field(max_length=20)  # daily, monthly
    revenue: Decimal = Field(decimal_places=2, default=Decimal("0"))
    cogs: Decimal = Field(decimal_places=2, default=Decimal("0"))
    gross_profit: Decimal = Field(decimal_places=2, default=Decimal("0"))
    operating_expenses: Decimal = Field(decimal_places=2, default=Decimal("0"))
    net_profit: Decimal = Field(decimal_places=2, default=Decimal("0"))
    inventory_value: Decimal = Field(decimal_places=2, default=Decimal("0"))
    data: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Employee Attendance
class Attendance(SQLModel, table=True):
    __tablename__ = "attendance"  # type: ignore[assignment]

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    attendance_date: date
    check_in: Optional[datetime] = Field(default=None)
    check_out: Optional[datetime] = Field(default=None)
    status: AttendanceStatus = Field(default=AttendanceStatus.PRESENT)
    working_hours: Optional[Decimal] = Field(default=None, decimal_places=2)
    overtime_hours: Optional[Decimal] = Field(default=None, decimal_places=2)
    notes: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: User = Relationship(back_populates="attendance_records")


# Non-persistent schemas for validation and API
class UserCreate(SQLModel, table=False):
    username: str = Field(max_length=50)
    email: str = Field(max_length=255)
    password: str = Field(min_length=6)
    full_name: str = Field(max_length=100)
    role: UserRole = Field(default=UserRole.EMPLOYEE)
    phone: Optional[str] = Field(default=None, max_length=20)


class UserUpdate(SQLModel, table=False):
    email: Optional[str] = Field(default=None, max_length=255)
    full_name: Optional[str] = Field(default=None, max_length=100)
    role: Optional[UserRole] = Field(default=None)
    phone: Optional[str] = Field(default=None, max_length=20)
    is_active: Optional[bool] = Field(default=None)


class ProductCreate(SQLModel, table=False):
    code: str = Field(max_length=50)
    name: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    product_type: ProductType
    unit: str = Field(max_length=20)
    cost_price: Decimal = Field(decimal_places=2, default=Decimal("0"))
    selling_price: Optional[Decimal] = Field(default=None, decimal_places=2)
    minimum_stock: Decimal = Field(decimal_places=2, default=Decimal("0"))


class ProductUpdate(SQLModel, table=False):
    name: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    unit: Optional[str] = Field(default=None, max_length=20)
    cost_price: Optional[Decimal] = Field(default=None, decimal_places=2)
    selling_price: Optional[Decimal] = Field(default=None, decimal_places=2)
    minimum_stock: Optional[Decimal] = Field(default=None, decimal_places=2)
    is_active: Optional[bool] = Field(default=None)


class StockMovementCreate(SQLModel, table=False):
    product_id: int
    movement_type: StockMovementType
    quantity: Decimal = Field(decimal_places=4)
    unit_cost: Decimal = Field(decimal_places=2, default=Decimal("0"))
    reference_type: Optional[str] = Field(default=None, max_length=50)
    reference_id: Optional[int] = Field(default=None)
    notes: Optional[str] = Field(default=None, max_length=500)


class SalesOrderCreate(SQLModel, table=False):
    customer_id: int
    order_date: date
    delivery_date: Optional[date] = Field(default=None)
    marketplace: Marketplace = Field(default=Marketplace.OFFLINE)
    marketplace_order_id: Optional[str] = Field(default=None, max_length=100)
    shipping_cost: Decimal = Field(decimal_places=2, default=Decimal("0"))
    notes: Optional[str] = Field(default=None, max_length=500)


class SalesOrderItemCreate(SQLModel, table=False):
    product_id: int
    quantity: Decimal = Field(decimal_places=4)
    unit_price: Decimal = Field(decimal_places=2)
    discount: Decimal = Field(decimal_places=2, default=Decimal("0"))


class ProductionOrderCreate(SQLModel, table=False):
    product_id: int
    quantity: Decimal = Field(decimal_places=4)
    target_date: date
    assigned_to: Optional[int] = Field(default=None)
    notes: Optional[str] = Field(default=None, max_length=500)


class AttendanceCreate(SQLModel, table=False):
    user_id: int
    attendance_date: date
    check_in: Optional[datetime] = Field(default=None)
    check_out: Optional[datetime] = Field(default=None)
    status: AttendanceStatus = Field(default=AttendanceStatus.PRESENT)
    notes: Optional[str] = Field(default=None, max_length=500)


class CustomerCreate(SQLModel, table=False):
    name: str = Field(max_length=200)
    email: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None, max_length=500)
    city: Optional[str] = Field(default=None, max_length=100)
    marketplace: Marketplace = Field(default=Marketplace.OFFLINE)
    marketplace_username: Optional[str] = Field(default=None, max_length=100)
