import { Product } from "../models/products";
import {
  getProdutos,
  saveProdutos,
} from "../services/jsonbinService";

export const productService = {
  async create(product: Product) {
    const products = await getProdutos();

console.log(
  "TAMANHO PRODUTOS:",
  JSON.stringify(products).length
);

    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };

    products.push(newProduct);

    await saveProdutos(products);
  },

  async getAll(): Promise<Product[]> {
    return await getProdutos();
  },

  async update(id: string, product: Product) {
    const products = await getProdutos();

    const updatedProducts = products.map((p: Product) =>
      p.id === id
        ? {
            ...p,
            ...product,
            id,
          }
        : p
    );

    await saveProdutos(updatedProducts);
  },

  async delete(id: string) {
    const products = await getProdutos();

    const filteredProducts = products.filter(
      (p: Product) => p.id !== id
    );

    await saveProdutos(filteredProducts);
  },
};