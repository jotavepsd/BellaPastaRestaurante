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

import CardProduto from "../../components/CardProduto";

const { width, height } = Dimensions.get("window");

type NavProp = StackNavigationProp<RootStackParamList>;

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem?: string;
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
          imagem: value.imagem, 
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00B14F" />
      
     
      <View style={styles.header}>
        <Text style={styles.headerText}>Bella Pasta</Text>
      </View>

     
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fabButton}
          onPress={() => navigation.navigate("CadastroProduto")}
        >
          <Entypo name="circle-with-plus" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.listaWrapper}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00B14F" />
          </View>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <CardProduto item={item} index={index} />
            )}
            contentContainerStyle={styles.listaContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
              </View>
            }
          />
        )}
      </View>

      
      <View style={styles.faixaMenu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("InicialScreen")}>
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
    height: height * 0.15,
    backgroundColor: "#00B14F",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  fabContainer: {
    position: "absolute",
    top: height * 0.8, 
    right: 20,
    zIndex: 10,
  },
  fabButton: {
    backgroundColor: "#00B14F",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  listaWrapper: {
    flex: 1,
    marginTop: 20,
  },
  listaContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
  faixaMenu: {
    position: "absolute",
    bottom: 0,
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
    width: 50,
    height: 50,
  },
  menuText: {
    color: "white",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  }
});