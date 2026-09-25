const productsRepository = require("../infrastructure/products.repository");
const cloudinary = require("../infrastructure/cloudinary.provider");
const { generateId } = require("../../../shared/database/ids");
const { ApiError } = require("../../../shared/http/api-error");

const normalizeCategories = (categories) => {
  if (categories === undefined) return undefined;
  if (typeof categories === "string") return categories.split(",");
  if (Array.isArray(categories)) return categories;
  return categories;
};

const createProduct = async (input) => {
  let uploaded;
  let img = input.img;
  if (img && img.startsWith("data:image")) {
    uploaded = await cloudinary.uploadBase64Image(img);
    img = uploaded.secure_url;
  }
  try {
    return await productsRepository.create({
      id: generateId(),
      title: input.title,
      desc: input.desc,
      img,
      categories: normalizeCategories(input.categories),
      size: input.size,
      color: input.color,
      price: input.price,
      rating: input.rating,
      amount: input.amount,
      isDeleted: input.isDeleted,
    });
  } catch (err) {
    if (uploaded && uploaded.public_id) {
      try {
        await cloudinary.destroyImage(uploaded.public_id);
      } catch {
        // best-effort cleanup; original error is more useful
      }
    }
    throw err;
  }
};

const updateProduct = async (id, input) => {
  const existing = await productsRepository.findById(id);
  if (!existing) throw ApiError.notFound("Product not found");

  let uploaded;
  let img = input.img;
  if (img && img.startsWith("data:image")) {
    uploaded = await cloudinary.uploadBase64Image(img);
    img = uploaded.secure_url;
  }

  const fields = {};
  for (const key of ["title", "size", "color", "price", "rating", "amount", "isDeleted"]) {
    if (input[key] !== undefined) fields[key] = input[key];
  }
  if (img !== undefined) fields.img = img;
  if (input.categories !== undefined && typeof input.categories !== "string") {
    fields.categories = normalizeCategories(input.categories);
  } else if (typeof input.categories === "string") {
    fields.categories = input.categories.split(",");
  }
  if (input.desc !== undefined) fields.desc = input.desc;

  try {
    const updated = await productsRepository.update(id, fields);
    if (uploaded && existing.img) {
      await cloudinary.destroyImage(cloudinary.extractPublicId(existing.img));
    }
    return updated;
  } catch (err) {
    if (uploaded && uploaded.public_id) {
      try {
        await cloudinary.destroyImage(uploaded.public_id);
      } catch {
        // best-effort cleanup
      }
    }
    throw err;
  }
};

const deleteProduct = async (id) => {
  const existing = await productsRepository.findById(id, null, { includeDeleted: true });
  if (!existing) throw ApiError.notFound("Product not found");
  if (existing.img) {
    await cloudinary.destroyImage(cloudinary.extractPublicId(existing.img));
  }
  await productsRepository.remove(id);
  return "Product has been deleted successfully";
};

const toggleProduct = async (id) => {
  const existing = await productsRepository.findById(id, null, { includeDeleted: true });
  if (!existing) throw ApiError.notFound("Product not found");
  const updated = await productsRepository.setDeleted(id, !existing.isDeleted);
  const message = updated.isDeleted
    ? "Product has been disabled successfully"
    : "Product has been enabled successfully";
  return { message, isDeleted: updated.isDeleted };
};

const findProduct = async (id) => productsRepository.findById(id);

const listProducts = async ({ categories, size, color }) => {
  const split = (v) => (v ? v.split(",").map((c) => c.trim()) : null);
  return productsRepository.listFiltered({
    categories: split(categories),
    size: size || null,
    color: color || null,
  });
};

const listPaginated = async ({ page, limit, sorting }) => {
  const ascending = String(sorting).toLowerCase() === "asc";
  return productsRepository.listPaginated({ page, limit, ascending });
};

const searchProducts = async (term) => productsRepository.searchByTitle(term);

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
  findProduct,
  listProducts,
  listPaginated,
  searchProducts,
};