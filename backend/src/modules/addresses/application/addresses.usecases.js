const addressesRepository = require("../infrastructure/addresses.repository");
const { withTransaction } = require("../../../shared/database/transaction");
const { generateId } = require("../../../shared/database/ids");
const { ApiError } = require("../../../shared/http/api-error");

const normalizeLabel = (label) => {
  if (label == null) return null;
  const trimmed = String(label);
  return /^(Home|Work)$/.test(trimmed) ? trimmed : label;
};

const createAddress = async ({ userId, body }) => {
  const requestedDefault = body.isDefault === true;
  return withTransaction(async (client) => {
    const addressCount = await addressesRepository.countByUser(userId, client);
    let isDefault = requestedDefault;
    if (!requestedDefault && addressCount === 0) isDefault = true;

    if (isDefault && addressCount > 0) {
      await addressesRepository.setAllDefaultFalse(userId, null, client);
    }

    return addressesRepository.create(
      {
        id: generateId(),
        userId,
        fullAddress: body.fullAddress,
        phoneNumber: body.phoneNumber,
        firstName: body.firstName,
        lastName: body.lastName,
        label: normalizeLabel(body.label),
        isDefault,
      },
      client,
    );
  });
};

const findAllForUser = async (userId) => addressesRepository.findByUser(userId);

const findOneForUser = async ({ userId, addressId, isAdmin, targetUserId }) => {
  const scopeUserId = isAdmin ? targetUserId : userId;
  const address = await addressesRepository.findForUserById(scopeUserId, addressId);
  if (!address) throw ApiError.notFound("Address not found");
  return address;
};

const findDefaultAddress = async ({ userId, isAdmin, targetUserId }) => {
  const scopeUserId = isAdmin ? targetUserId : userId;
  const address = await addressesRepository.findDefault(scopeUserId);
  if (!address) throw ApiError.notFound("No default address found");
  return address;
};

const updateAddress = async ({ userId, addressId, body }) => {
  return withTransaction(async (client) => {
    const address = await addressesRepository.findForUserById(userId, addressId, client);
    if (!address) throw ApiError.notFound("Address not found");

    const addressCount = await addressesRepository.countByUser(userId, client);

    if (addressCount === 1 && body.isDefault === false) {
      throw ApiError.badRequest("Cannot unset default for the only address");
    }

    let updated;
    if (body.isDefault && addressCount > 1) {
      await addressesRepository.setAllDefaultFalse(userId, null, client);
      updated = await addressesRepository.update(
        addressId,
        { ...body, label: normalizeLabel(body.label), isDefault: true },
        client,
      );
    } else if (address.isDefault && !body.isDefault) {
      updated = await addressesRepository.update(
        addressId,
        { ...body, label: normalizeLabel(body.label), isDefault: false },
        client,
      );
      await addressesRepository.setDefault(
        (await addressesRepository.findNewestOther(userId, addressId, client))._id,
        true,
        client,
      );
    } else {
      updated = await addressesRepository.update(
        addressId,
        { ...body, label: normalizeLabel(body.label) },
        client,
      );
    }

    return updated;
  });
};

const deleteAddress = async ({ userId, addressId }) => {
  return withTransaction(async (client) => {
    const removed = await addressesRepository.remove(addressId, client);
    if (!removed) throw ApiError.notFound("Address not found");
    if (removed.userId !== userId) throw ApiError.notFound("Address not found");

    if (removed.isDefault) {
      const next = await addressesRepository.findEarliestOther(userId, addressId, client);
      if (next) await addressesRepository.setDefault(next._id, true, client);
    }

    const updatedAddresses = await addressesRepository.findByUser(userId, client);
    return { message: "Address deleted successfully", updatedAddresses };
  });
};

const setDefaultAddress = async ({ userId, addressId }) => {
  return withTransaction(async (client) => {
    const address = await addressesRepository.findForUserById(userId, addressId, client);
    if (!address) throw ApiError.notFound("Address not found");

    const addressCount = await addressesRepository.countByUser(userId, client);

    if (address.isDefault) {
      throw ApiError.badRequest("This address is already set as default");
    }

    let message;
    if (addressCount === 1) {
      await addressesRepository.setDefault(addressId, true, client);
      message = "Address set as default";
    } else {
      await addressesRepository.setAllDefaultFalse(userId, null, client);
      await addressesRepository.setDefault(addressId, true, client);
      message = "Default address updated successfully";
    }

    const addresses = await addressesRepository.findByUser(userId, client);
    return { message, addresses };
  });
};

module.exports = {
  createAddress,
  findAllForUser,
  findOneForUser,
  findDefaultAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};