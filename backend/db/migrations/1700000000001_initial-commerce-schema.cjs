/**
 * Initial commerce schema (data model selected in Section 10 of the plan).
 *
 * - IDs are 24-char lowercase hex (preserved Mongo ObjectIds); validated by CHECK.
 * - Mutable arrays are normalized into child tables; order shipping/prices are snapshots.
 * - status accepts both "cancelled" and "canceled" during the transition period.
 */
exports.up = async (pgm) => {
  const idCheck = (table) =>
    pgm.createConstraint(table, `${table}_id_hex_check`, {
      check: "id ~ '^[a-f0-9]{24}$'",
    });

  // ---- users ----
  pgm.createTable("users", {
    id: { type: "varchar(24)", primaryKey: true },
    firstname: { type: "text", notNull: false },
    lastname: { type: "text", notNull: false },
    username: { type: "text", notNull: true, unique: true },
    email: { type: "text", notNull: true, unique: true },
    password_hash: { type: "text", notNull: true },
    is_admin: { type: "boolean", notNull: true, default: false },
    gender: { type: "text", notNull: false },
    phone: { type: "text", notNull: true, unique: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  idCheck("users");

  // ---- user_password_history ----
  pgm.createTable("user_password_history", {
    user_id: {
      type: "varchar(24)",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    position: { type: "smallint", notNull: true },
    password_hash: { type: "text", notNull: true },
  });
  pgm.createConstraint("user_password_history", "user_password_history_pkey", {
    primaryKey: ["user_id", "position"],
  });

  // ---- products ----
  pgm.createTable("products", {
    id: { type: "varchar(24)", primaryKey: true },
    title: { type: "text", notNull: true, unique: true },
    description: { type: "text", notNull: true },
    image_url: { type: "text", notNull: true },
    categories: { type: "text[]" },
    size: { type: "text" },
    color: { type: "text" },
    price: { type: "numeric(12,2)", notNull: true },
    rating: { type: "numeric(3,2)", notNull: true, default: 0 },
    stock_quantity: { type: "integer", notNull: true },
    is_deleted: { type: "boolean", notNull: true, default: false },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  idCheck("products");
  pgm.createConstraint("products", "products_price_nonnegative_check", {
    check: "price >= 0",
  });
  pgm.createConstraint("products", "products_rating_range_check", {
    check: "rating >= 0 AND rating <= 5",
  });
  pgm.createConstraint("products", "products_stock_nonnegative_check", {
    check: "stock_quantity >= 0",
  });

  // ---- addresses ----
  pgm.createTable("addresses", {
    id: { type: "varchar(24)", primaryKey: true },
    user_id: { type: "varchar(24)", notNull: true, references: "users", onDelete: "CASCADE" },
    full_address: { type: "text", notNull: true },
    phone_number: { type: "text", notNull: true },
    first_name: { type: "text", notNull: true },
    last_name: { type: "text", notNull: true },
    label: { type: "text" },
    is_default: { type: "boolean", notNull: true, default: false },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  idCheck("addresses");
  pgm.createConstraint("addresses", "addresses_label_check", {
    check: "label IS NULL OR label IN ('Home', 'Work')",
  });
  pgm.createIndex("addresses", ["user_id"]);
  pgm.createIndex("addresses", ["user_id"], {
    unique: true,
    where: "is_default = true",
    name: "addresses_one_default_per_user",
  });

  // ---- carts / cart_items ----
  pgm.createTable("carts", {
    id: { type: "varchar(24)", primaryKey: true },
    user_id: { type: "varchar(24)", notNull: true, unique: true, references: "users", onDelete: "CASCADE" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  idCheck("carts");

  pgm.createTable("cart_items", {
    cart_id: { type: "varchar(24)", notNull: true, references: "carts", onDelete: "CASCADE" },
    product_id: { type: "varchar(24)", notNull: true, references: "products", onDelete: "CASCADE" },
    quantity: { type: "integer", notNull: true },
    position: { type: "integer", notNull: true },
  });
  pgm.createConstraint("cart_items", "cart_items_pkey", {
    primaryKey: ["cart_id", "position"],
  });
  pgm.createConstraint("cart_items", "cart_items_quantity_positive_check", {
    check: "quantity > 0",
  });
  pgm.createConstraint("cart_items", "cart_items_unique_product", {
    unique: ["cart_id", "product_id"],
  });
  pgm.createIndex("cart_items", ["product_id"]);

  // ---- wishlists / wishlist_items ----
  pgm.createTable("wishlists", {
    id: { type: "varchar(24)", primaryKey: true },
    user_id: { type: "varchar(24)", notNull: true, unique: true, references: "users", onDelete: "CASCADE" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  idCheck("wishlists");

  pgm.createTable("wishlist_items", {
    wishlist_id: { type: "varchar(24)", notNull: true, references: "wishlists", onDelete: "CASCADE" },
    product_id: { type: "varchar(24)", notNull: true, references: "products", onDelete: "CASCADE" },
    position: { type: "integer", notNull: true },
  });
  pgm.createConstraint("wishlist_items", "wishlist_items_pkey", {
    primaryKey: ["wishlist_id", "position"],
  });
  pgm.createConstraint("wishlist_items", "wishlist_items_unique_product", {
    unique: ["wishlist_id", "product_id"],
  });
  pgm.createIndex("wishlist_items", ["product_id"]);

  // ---- orders / order_items ----
  pgm.createTable("orders", {
    id: { type: "varchar(24)", primaryKey: true },
    user_id: { type: "varchar(24)", notNull: true, references: "users", onDelete: "CASCADE" },
    subtotal_in_cents: { type: "bigint", notNull: true },
    discount_in_cents: { type: "bigint", notNull: true },
    shipping_cost_in_cents: { type: "bigint", notNull: true },
    total_amount_in_cents: { type: "bigint", notNull: true },
    currency: { type: "char(3)", notNull: true, default: "USD" },
    status: { type: "text", notNull: true, default: "pending" },
    payment_method: { type: "text", notNull: true },
    tracking_number: { type: "text" },
    estimated_delivery_at: { type: "timestamptz" },
    ship_to_full_address: { type: "text", notNull: true },
    ship_to_phone_number: { type: "text", notNull: true },
    ship_to_first_name: { type: "text", notNull: true },
    ship_to_last_name: { type: "text", notNull: true },
    ship_to_label: { type: "text" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  idCheck("orders");
  pgm.createConstraint("orders", "orders_financials_nonnegative_check", {
    check:
      "subtotal_in_cents >= 0 AND discount_in_cents >= 0 AND shipping_cost_in_cents >= 0 AND total_amount_in_cents >= 0",
  });
  pgm.createConstraint("orders", "orders_status_check", {
    check: "status IN ('pending', 'processing', 'delivered', 'cancelled', 'canceled')",
  });
  pgm.createConstraint("orders", "orders_ship_label_check", {
    check: "ship_to_label IS NULL OR ship_to_label IN ('Home', 'Work')",
  });

  pgm.createTable("order_items", {
    order_id: { type: "varchar(24)", notNull: true, references: "orders", onDelete: "CASCADE" },
    line_number: { type: "integer", notNull: true },
    product_id: { type: "varchar(24)", references: "products", onDelete: "SET NULL" },
    product_title_snapshot: { type: "text" },
    product_image_snapshot: { type: "text" },
    quantity: { type: "integer", notNull: true },
    price_at_order_in_cents: { type: "bigint", notNull: true },
  });
  pgm.createConstraint("order_items", "order_items_pkey", {
    primaryKey: ["order_id", "line_number"],
  });
  pgm.createConstraint("order_items", "order_items_quantity_positive_check", {
    check: "quantity > 0",
  });
  pgm.createConstraint("order_items", "order_items_price_nonnegative_check", {
    check: "price_at_order_in_cents >= 0",
  });
  pgm.createIndex("order_items", ["product_id"]);

  // ---- query-support indexes (Section 22) ----
  pgm.createIndex("products", [{ name: "created_at", sort: "DESC" }, { name: "id" }]);
  pgm.createIndex("products", ["categories"], { method: "gin" });
  pgm.createIndex("orders", [{ name: "user_id" }, { name: "created_at", sort: "DESC" }, { name: "id" }]);
  pgm.createIndex("orders", [{ name: "created_at", sort: "DESC" }, { name: "id" }]);
};

exports.down = async (pgm) => {
  const tables = [
    "user_password_history",
    "order_items",
    "orders",
    "wishlist_items",
    "wishlists",
    "cart_items",
    "carts",
    "addresses",
    "products",
    "users",
  ];
  for (const table of tables) {
    pgm.dropTable(table, { ifExists: true });
  }
};