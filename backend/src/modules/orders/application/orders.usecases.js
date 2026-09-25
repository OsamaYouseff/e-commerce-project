const ordersRepository = require("../infrastructure/orders.repository");
const { withTransaction } = require("../../../shared/database/transaction");
const { generateId } = require("../../../shared/database/ids");
const { ApiError } = require("../../../shared/http/api-error");

const VALID_STATUSES = ["pending", "processing", "delivered", "canceled"];

const createOrder = async ({ userId, body }) => {
  return withTransaction(async (client) => {
    const items = Array.isArray(body.items) ? body.items : [];
    const snapshots = await ordersRepository.getProductSnapshots(
      items.map((i) => i.productId).filter(Boolean),
      client,
    );
    const itemRows = items.map((item) => {
      const snapshot = snapshots.get(item.productId);
      return {
        productId: item.productId,
        title: snapshot ? snapshot.title : null,
        img: snapshot ? snapshot.img : null,
        quantity: item.quantity,
        priceAtOrderInCents: item.priceAtOrderInCents,
      };
    });
    return ordersRepository.create(
      { id: generateId(), userId, body, itemRows },
      client,
    );
  });
};

const updateOrder = async ({ orderId, body }) => {
  return withTransaction(async (client) => {
    const order = await ordersRepository.findById(orderId, client);
    if (!order) return null;
    const items = Array.isArray(body.items) ? body.items : null;
    if (items) {
      const snapshots = await ordersRepository.getProductSnapshots(
        items.map((i) => i.productId).filter(Boolean),
        client,
      );
      body.items = items.map((item) => {
        const snapshot = snapshots.get(item.productId);
        return {
          productId: item.productId,
          title: snapshot ? snapshot.title : null,
          img: snapshot ? snapshot.img : null,
          quantity: item.quantity,
          priceAtOrderInCents: item.priceAtOrderInCents,
        };
      });
    }
    return ordersRepository.update(orderId, body, client);
  });
};

const setOrderStatus = async ({ orderId, status }) => {
  if (!VALID_STATUSES.includes(status)) {
    throw ApiError.badRequest("Invalid order status");
  }
  const order = await ordersRepository.setStatus(orderId, status);
  if (!order) throw ApiError.notFound("Order not found");
  return order;
};

const deleteOrder = async ({ orderId, userId, isAdmin, strict = true }) => {
  const removed = isAdmin
    ? await ordersRepository.deleteById(orderId)
    : await ordersRepository.deleteScoped(orderId, userId);
  if (strict && !removed) throw ApiError.notFound("Order not found");
  return "Order has been deleted successfully.";
};

const findUserOrders = async (userId) => ordersRepository.findByUser(userId);

const detailedOrder = async ({ orderId, targetUserId, isAdmin }) => {
  const order = await ordersRepository.detailedById(orderId, isAdmin ? null : targetUserId);
  if (!order) throw ApiError.notFound("Order not found for this user");
  return order;
};

const minimizedAdmin = async ({ page, limit, sorting }) => {
  const ascending = String(sorting).toLowerCase() === "asc";
  return ordersRepository.listPaginatedAdmin({ page, limit, ascending });
};

const minimizedUser = async (userId) => ordersRepository.minimizedForUser(userId);

const searchOrder = async (orderId) => {
  const order = await ordersRepository.searchById(orderId);
  if (!order) {
    throw ApiError.notFound(`Cannot find order with id: ${orderId}`);
  }
  return order;
};

module.exports = {
  createOrder,
  updateOrder,
  setOrderStatus,
  deleteOrder,
  findUserOrders,
  detailedOrder,
  minimizedAdmin,
  minimizedUser,
  searchOrder,
};