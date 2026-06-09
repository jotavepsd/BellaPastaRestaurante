import axios from "axios";
import {
  JSONBIN_API_KEY,
  PRODUTOS_BIN_ID,
  CARRINHO_BIN_ID,
  PEDIDOS_BIN_ID,
  NOTIFICACOES_BIN_ID,
} from "./jsonbinConfig";

const headers = {
  "X-Master-Key": JSONBIN_API_KEY,
  "Content-Type": "application/json",
};

const BASE_URL = "https://api.jsonbin.io/v3/b";

export async function getProdutos() {
  const response = await axios.get(
    `${BASE_URL}/${PRODUTOS_BIN_ID}/latest`,
    { headers }
  );

  return response.data.record.produtos || [];
}

export async function saveProdutos(produtos: any[]) {
  await axios.put(
    `${BASE_URL}/${PRODUTOS_BIN_ID}`,
    { produtos },
    { headers }
  );
}

export async function getCarrinhos() {
  const response = await axios.get(
    `${BASE_URL}/${CARRINHO_BIN_ID}/latest`,
    { headers }
  );

  return response.data.record.carrinhos || {};
}

export async function saveCarrinhos(carrinhos: any) {
  await axios.put(
    `${BASE_URL}/${CARRINHO_BIN_ID}`,
    { carrinhos },
    { headers }
  );
}

export async function getPedidos() {
  const response = await axios.get(
    `${BASE_URL}/${PEDIDOS_BIN_ID}/latest`,
    { headers }
  );

  return response.data.record.pedidos || [];
}

export async function savePedidos(pedidos: any[]) {
  await axios.put(
    `${BASE_URL}/${PEDIDOS_BIN_ID}`,
    { pedidos },
    { headers }
  );
}

export async function getNotificacoes() {
  const response = await axios.get(
    `${BASE_URL}/${NOTIFICACOES_BIN_ID}/latest`,
    { headers }
  );

  return response.data.record.notificacoes || [];
}

export async function saveNotificacoes(notificacoes: any[]) {
  await axios.put(
    `${BASE_URL}/${NOTIFICACOES_BIN_ID}`,
    { notificacoes },
    { headers }
  );
}