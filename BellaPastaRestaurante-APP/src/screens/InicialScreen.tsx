import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/(tabs)/index";
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { database } from "../services/connectionFirebase";
import { ref, onValue } from "firebase/database";

const { width, height } = Dimensions.get("window");

type NavProp = StackNavigationProp<RootStackParamList>;

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
}

export default function TelaInicial() {
  const navigation = useNavigation<NavProp>();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const produtosRef = ref(database, "produtos");
    const unsubscribe = onValue(produtosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const produtosList = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          nome: value.nome,
          descricao: value.descricao,
          preco: value.preco,
          categoria: value.categoria,
        }));
        setProdutos(produtosList);
      } else {
        setProdutos([]);
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      Alert.alert("Erro", "Falha ao carregar produtos");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePedir = (produto: Produto) => {
    Alert.alert("Pedido", `${produto.nome} - R$ ${produto.preco.toFixed(2)}`, [
      { text: "OK", onPress: () => console.log("Pedido feito") },
    ]);
  };

  const handleDetalhes = (produto: Produto) => {
    Alert.alert("Detalhes", `${produto.nome}\n\n${produto.descricao}\n\nPreço: R$ ${produto.preco.toFixed(2)}`);
  };

  const getCardColor = (index: number) => {
    return index % 2 === 0 ? "#00B14F" : "#FF3131";
  };

  const renderProduto = ({ item, index }: { item: Produto; index: number }) => {
    const cardColor = getCardColor(index);
    
    return (
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <Text style={styles.produtoNome}>{item.nome}</Text>
        <Text style={styles.produtoDescricao}>{item.descricao}</Text>
        
        <View style={styles.cardButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.buttonPedir]}
            onPress={() => handlePedir(item)}
          >
            <Text style={[styles.buttonText, { color: cardColor }]}>Pedir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.buttonDetalhes]}
            onPress={() => handleDetalhes(item)}
          >
            <Text style={[styles.buttonText, { color: cardColor }]}>Detalhes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00B14F" />
      
      {/* Cabeçalho Verde */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Bella Pasta</Text>
      </View>

      {/* Lista de Produtos */}
      <View style={styles.listaWrapper}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00B14F" />
          </View>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            renderItem={renderProduto}
            contentContainerStyle={styles.listaContainer}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
                <Text style={styles.emptySubText}>
                  Acesse o perfil de admin para cadastrar
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Menu Inferior Vermelho - FIXO */}
      <View style={styles.faixaMenu}>
        <TouchableOpacity style={styles.menuItem}>
          <Entypo name="home" size={24} color="white" />
          <Text style={styles.menuText}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Entypo name="magnifying-glass" size={24} color="white" />
          <Text style={styles.menuText}>Pesquisar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Entypo name="shopping-cart" size={24} color="white" />
          <Text style={styles.menuText}>Pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Entypo name="ticket" size={24} color="white" />
          <Text style={styles.menuText}>Reserva</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("PerfilScreen")}
        >
          <Ionicons name="person" size={24} color="white" />
          <Text style={styles.menuText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    height: height * 0.25,
    backgroundColor: "#00B14F",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  listaWrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listaContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  produtoNome: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  produtoDescricao: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.95,
  },
  cardButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  buttonPedir: {
    marginRight: 6,
  },
  buttonDetalhes: {
    marginLeft: 6,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  faixaMenu: {
    width: "100%",
    height: height * 0.085,
    backgroundColor: "#FF3131",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 5,
  },
  menuItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  menuText: {
    color: "white",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },
});