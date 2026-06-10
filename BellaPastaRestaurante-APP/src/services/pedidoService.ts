import { getPedidos, savePedidos } from "./jsonbinService";

export interface Pedido {
  id: string;
  data: string;
  itens: any[];
  subtotal: number;
  desconto: number;
  total: number;
  status: string;
}

export const pedidoService = {
  async getAll(): Promise<Pedido[]> {
    return await getPedidos();
  },

async create(itens: any[], subtotal: number, desconto: number) {
  const pedidos = await getPedidos();

  console.log("PEDIDOS ATUAIS:", pedidos);

  const novoPedido = {
    id: Date.now().toString(),
    data: new Date().toISOString(),
    itens,
    subtotal,
    desconto,
    total: subtotal - desconto,
    status: "Pendente",
  };

  pedidos.push(novoPedido);

  console.log("SALVANDO:", pedidos);

  await savePedidos(pedidos);

  return novoPedido;
}
};