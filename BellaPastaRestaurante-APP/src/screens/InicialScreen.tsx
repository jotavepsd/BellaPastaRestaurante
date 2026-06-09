import React, { useState, useCallback } from "react";
import {
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/(tabs)/index";
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';

import CardProduto from "../../components/CardProduto";
import CustomToast from "../../components/CustomToast";

import { getProdutos } from "../services/jsonbinService";



const { width, height } = Dimensions.get("window");

type NavProp = StackNavigationProp<RootStackParamList>;

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagemUrl?: string;
}

export default function TelaInicial() {
  const navigation = useNavigation<NavProp>();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

useFocusEffect(
  useCallback(() => {
    async function carregarProdutos() {
      try {
        setLoading(true);

        const produtosJson = await getProdutos();

        console.log(
          "Produtos carregados:",
          produtosJson
        );

        setProdutos(produtosJson);
      } catch (error) {
        console.log(
          "Erro ao carregar produtos:",
          error
        );

        showToast(
          "Erro ao carregar produtos",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }

    carregarProdutos();
  }, [])
);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleAdicionarProduto = (message: string, success: boolean) => {
    showToast(message, success ? 'success' : 'error');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00B14F" />
      
      <CustomToast 
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
      
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
      
      <View style={styles.fabContainer2}>
        <TouchableOpacity 
          style={styles.fabButton}
          onPress={() => navigation.navigate("GerenciarProduto")}
        >
          <Entypo name="cog" size={32} color="#fff" />
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
              <CardProduto 
                item={item} 
                index={index} 
                onAdicionar={handleAdicionarProduto}
              />
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
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Carrinho")}>
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
    height: height * 0.2,
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
    top: height * 0.79, 
    right: 20,
    zIndex: 10,
  },
  fabContainer2: {
    position: "absolute",
    top: height * 0.85, 
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