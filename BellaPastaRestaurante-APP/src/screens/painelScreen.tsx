import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { pedidoService } from "../services/pedidoService";
import { notificacaoService } from "../services/notificacaoService";

export default function PainelScreen() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function carregarPedidos() {
    const lista = await pedidoService.getAll();
    setPedidos(lista);
  }

  async function confirmarPedido(pedido: any) {
    await notificacaoService.create({
      pedidoId: pedido.id,
      mensagem: `Seu pedido #${pedido.id} foi confirmado ✅`,
      status: "confirmado",
      data: new Date().toISOString(),
    });

    Alert.alert("Sucesso", "Pedido confirmado");
  }

  async function prepararPedido(pedido: any) {
    await notificacaoService.create({
      pedidoId: pedido.id,
      mensagem: `Seu pedido #${pedido.id} está em preparo 🍳`,
      status: "preparo",
      data: new Date().toISOString(),
    });

    Alert.alert("Sucesso", "Pedido enviado para preparo");
  }

  const renderPedido = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.titulo}>
        Pedido #{item.id}
      </Text>

      <Text>
        Total: R$ {item.total?.toFixed(2)}
      </Text>

      <View style={styles.botoes}>
        <TouchableOpacity
          style={styles.confirmar}
          onPress={() => confirmarPedido(item)}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color="#fff"
          />
          <Text style={styles.textoBotao}>
            Confirmar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.preparo}
          onPress={() => prepararPedido(item)}
        >
          <Ionicons
            name="restaurant"
            size={20}
            color="#fff"
          />
          <Text style={styles.textoBotao}>
            Em Preparo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Painel Administrativo
      </Text>

      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        renderItem={renderPedido}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  botoes: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  confirmar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00B14F",
    padding: 10,
    borderRadius: 8,
    gap: 5,
  },

  preparo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF9800",
    padding: 10,
    borderRadius: 8,
    gap: 5,
  },

  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
  },
});