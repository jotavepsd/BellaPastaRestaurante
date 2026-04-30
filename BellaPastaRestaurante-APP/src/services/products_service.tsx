import { database } from '../services/connectionFirebase';
import { ref, push, get, update, remove } from 'firebase/database';
import { Product } from '../models/products';

const PATH = 'products';

export const productService = {
  async create(product: Product) {
    const productRef = ref(database, PATH);
    await push(productRef, product);
  },

  async getAll(): Promise<Product[]> {
    const snapshot = await get(ref(database, PATH));
    const data = snapshot.val();

    const products: Product[] = [];

    for (let id in data) {
      products.push({ id, ...data[id] });
    }

    return products;
  },

  async update(id: string, product: Product) {
    const productRef = ref(database, `${PATH}/${id}`);
    await update(productRef, product);
  },

  async delete(id: string) {
    const productRef = ref(database, `${PATH}/${id}`);
    await remove(productRef);
  }
};