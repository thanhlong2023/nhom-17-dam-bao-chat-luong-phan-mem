const assert = require("assert/strict");
const app = require("../src/app");
const { initializeDatabase } = require("../src/services/databaseInitializer");
const {
  sequelize,
  Category,
  Food,
  FoodTopping,
  Topping,
  User,
  UserAddress,
  Review,
  Order,
  OrderStatus,
} = require("../src/models");

const results = [];
const cleanup = {
  categoryId: null,
  foodId: null,
  toppingId: null,
  userId: null,
  addressId: null,
  reviewId: null,
  orderId: null,
};

const record = (name, detail = "OK") => {
  results.push({ name, detail });
  console.log(`PASS | ${name} | ${detail}`);
};

const request = async (base, method, path, { body, token, expected = 200 } = {}) => {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  assert.equal(
    response.status,
    expected,
    `${method} ${path}: expected ${expected}, got ${response.status}: ${text}`,
  );
  return json;
};

const login = async (base, phone, role) => {
  const json = await request(base, "POST", "/api/auth/login", {
    body: { phone, password: "123", role },
  });
  assert.ok(json.data?.token, `Missing ${role} token`);
  record(`Đăng nhập ${role}`);
  return json.data.token;
};

const verifySchema = async () => {
  const queryInterface = sequelize.getQueryInterface();
  const models = Object.values(require("../src/models")).filter(
    (value) => value && typeof value.getTableName === "function",
  );

  for (const model of models) {
    const rawName = model.getTableName();
    const tableName = typeof rawName === "string" ? rawName : rawName.tableName;
    const columns = await queryInterface.describeTable(tableName);
    for (const attribute of Object.values(model.rawAttributes)) {
      const field = attribute.field || attribute.fieldName;
      assert.ok(columns[field], `${tableName}.${field} is missing`);
    }
  }
  record("Schema Sequelize đồng bộ", `${models.length} models`);
};

const run = async () => {
  await initializeDatabase();
  await verifySchema();

  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    for (const path of [
      "/api/restaurants",
      "/api/categories",
      "/api/foods",
      "/api/reviews/restaurants/summary",
    ]) {
      await request(base, "GET", path);
      record(`Public GET ${path}`);
    }

    const customerToken = await login(base, "0901234567", "CUSTOMER");
    const merchantToken = await login(base, "0911111111", "MERCHANT");
    const driverToken = await login(base, "0981111111", "DRIVER");
    const adminToken = await login(base, "0905678901", "ADMIN");

    await request(base, "GET", "/api/users", { expected: 401 });
    await request(base, "POST", "/api/categories", {
      body: { restaurantId: 1, name: "Unauthorized" },
      expected: 401,
    });
    await request(base, "POST", "/api/categories", {
      token: customerToken,
      body: { restaurantId: 1, name: "Forbidden" },
      expected: 403,
    });
    record("Phân quyền API nhạy cảm");

    const category = await request(base, "POST", "/api/categories", {
      token: merchantToken,
      body: { restaurantId: 1, name: `Verify Category ${Date.now()}` },
      expected: 201,
    });
    cleanup.categoryId = category.data.id;

    const food = await request(base, "POST", "/api/foods", {
      token: merchantToken,
      body: {
        categoryId: cleanup.categoryId,
        name: "Verify Food",
        price: 25000,
        defaultQuantity: 10,
        currentQuantity: 10,
      },
      expected: 201,
    });
    cleanup.foodId = food.data.id;

    const topping = await request(base, "POST", "/api/restaurants/1/toppings", {
      token: merchantToken,
      body: {
        name: "Verify Topping",
        price: 5000,
        defaultQuantity: 10,
        currentQuantity: 10,
      },
      expected: 201,
    });
    cleanup.toppingId = topping.data.id;

    await request(base, "POST", `/api/foods/${cleanup.foodId}/toppings`, {
      token: merchantToken,
      body: { toppingIds: [cleanup.toppingId] },
    });
    await request(base, "GET", `/api/foods/${cleanup.foodId}/toppings`);
    record("CRUD danh mục, món ăn và topping");

    const user = await request(base, "POST", "/api/users", {
      token: adminToken,
      body: {
        fullName: "Verify User",
        phone: `03${String(Date.now()).slice(-8)}`,
        password: "Verify123",
        role: "CUSTOMER",
      },
      expected: 201,
    });
    cleanup.userId = user.data.id;
    const storedUser = await User.findByPk(cleanup.userId);
    assert.ok(String(storedUser.password).startsWith("scrypt$"), "Admin-created password is not hashed");
    record("Admin CRUD người dùng và hash mật khẩu");

    const savedAddress = await request(base, "POST", "/api/addresses/mine", {
      token: customerToken,
      body: {
        label: "Verify",
        formattedAddress: "1 Nguyễn Huệ, Quận 1, TP.HCM",
        latitude: 10.773,
        longitude: 106.704,
        provider: "test",
      },
      expected: 201,
    });
    cleanup.addressId = savedAddress.data.id;
    await request(base, "PUT", `/api/addresses/mine/${cleanup.addressId}`, {
      token: customerToken,
      body: {
        label: "Verify Updated",
        formattedAddress: "1 Nguyễn Huệ, Quận 1, TP.HCM",
        latitude: 10.773,
        longitude: 106.704,
        provider: "test",
      },
    });
    const mine = await request(base, "GET", "/api/addresses/mine", { token: customerToken });
    assert.ok(mine.data.some((item) => item.id === cleanup.addressId));
    record("CRUD địa chỉ người dùng");

    const completedStatus = await OrderStatus.findOne({ where: { code: "COMPLETED" } });
    const testOrder = await Order.create({
      orderCode: `VERIFY-${Date.now()}`,
      idempotencyKey: `VERIFY-${Date.now()}-${Math.random()}`,
      customerId: 1,
      restaurantId: 1,
      driverId: 9,
      receiverAddress: "Verify address",
      receiverLat: 10.77,
      receiverLng: 106.7,
      distanceKm: 1,
      subtotalAmount: 10000,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 25000,
      shippingFee: 15000,
      statusId: completedStatus.id,
      statusChangedAt: new Date(),
    });
    cleanup.orderId = testOrder.id;
    const review = await request(base, "POST", "/api/reviews", {
      token: customerToken,
      body: { orderId: testOrder.id, targetType: "RESTAURANT", rating: 5, comment: "Verify" },
      expected: 201,
    });
    cleanup.reviewId = review.data.id;
    record("Đánh giá đơn hoàn thành");

    for (const [path, token] of [
      ["/api/drivers/me/orders", driverToken],
      ["/api/drivers/me/metrics", driverToken],
      ["/api/drivers/me/completed?page=1&limit=5", driverToken],
      ["/api/restaurants/mine", merchantToken],
      ["/api/orders", merchantToken],
      ["/api/admin/vouchers", adminToken],
      ["/api/admin/settings", adminToken],
      ["/api/restaurants/admin/pending", adminToken],
      ["/api/applications/drivers/pending", adminToken],
    ]) {
      await request(base, "GET", path, { token });
      record(`Protected GET ${path}`);
    }

    const ownRestaurant = await request(base, "GET", "/api/restaurants/1");
    await request(base, "PATCH", "/api/restaurants/1/status", {
      token: merchantToken,
      body: { isOpen: ownRestaurant.data.isOpen },
    });
    await request(base, "PATCH", "/api/restaurants/1/status", {
      token: customerToken,
      body: { isOpen: ownRestaurant.data.isOpen },
      expected: 403,
    });
    record("Phân quyền chủ nhà hàng");
  } finally {
    if (cleanup.addressId) await UserAddress.destroy({ where: { id: cleanup.addressId }, force: true });
    if (cleanup.reviewId) await Review.destroy({ where: { id: cleanup.reviewId }, force: true });
    if (cleanup.orderId) await Order.destroy({ where: { id: cleanup.orderId }, force: true });
    if (cleanup.foodId) {
      await FoodTopping.destroy({ where: { foodId: cleanup.foodId } });
      await Food.destroy({ where: { id: cleanup.foodId }, force: true });
    }
    if (cleanup.toppingId) await Topping.destroy({ where: { id: cleanup.toppingId }, force: true });
    if (cleanup.categoryId) await Category.destroy({ where: { id: cleanup.categoryId } });
    if (cleanup.userId) await User.destroy({ where: { id: cleanup.userId } });
    await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  }

  console.log(`\nVERIFIED ${results.length} module checks (payment mock intentionally excluded).`);
};

run().catch(async (error) => {
  console.error("VERIFY FAILED:", error);
  try {
    await sequelize.close();
  } catch {
    // Ignore shutdown errors.
  }
  process.exit(1);
});
