import type { Product, ProductMutationInput } from "./types";

const STORAGE_KEY = "northstar-product-mutations";

type MutationStore = {
  products: Record<string, Product>;
  deleted: number[];
};

const emptyStore: MutationStore = { products: {}, deleted: [] };

function readStore(): MutationStore {
  if (typeof window === "undefined") return emptyStore;

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") ?? emptyStore;
  } catch {
    return emptyStore;
  }
}

function writeStore(store: MutationStore) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function applyLocalMutations(products: Product[]): Product[] {
  const store = readStore();
  const mergedProducts = products
    .filter((product) => !store.deleted.includes(product.id))
    .map((product) => store.products[String(product.id)] ? { ...product, ...store.products[String(product.id)] } : product);
  const existingIds = new Set(mergedProducts.map((product) => product.id));
  const localProducts = Object.values(store.products).filter((product) => !store.deleted.includes(product.id) && !existingIds.has(product.id));
  return [...mergedProducts, ...localProducts];
}

export function getLocalProduct(id: number): Product | null {
  return readStore().products[String(id)] ?? null;
}

export function isLocalProductDeleted(id: number): boolean {
  return readStore().deleted.includes(id);
}

export function saveLocalProduct(product: Product) {
  const store = readStore();
  store.products[String(product.id)] = product;
  store.deleted = store.deleted.filter((deletedId) => deletedId !== product.id);
  writeStore(store);
}

export function markLocalProductDeleted(id: number) {
  const store = readStore();
  delete store.products[String(id)];
  if (!store.deleted.includes(id)) store.deleted.push(id);
  writeStore(store);
}

export function createLocalProduct(response: Product, input: ProductMutationInput): Product {
  const product = { ...response, ...input };
  saveLocalProduct(product);
  return product;
}