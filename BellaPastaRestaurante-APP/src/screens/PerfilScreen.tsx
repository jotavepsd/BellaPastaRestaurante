import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/(tabs)/index";
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';

// Importações do Firebase Realtime Database
import { auth, database } from "../services/connectionFirebase";
import { ref, get } from "firebase/database";

const { width, height } = Dimensions.get("window");

type NavProp = StackNavigationProp<RootStackParamList>;

export default function TelaInicial() {
  const navigation = useNavigation<NavProp>();

  const [nome, setNome] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function carregarDados() {
      const user = auth.currentUser;
      
      if (user) {
        
        const userRef = ref(database, "users " + user.uid);
        
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setNome(data.name);
            setTelefone(data.cellphone);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do banco:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    carregarDados();
  }, []);

  return (
    <View style={styles.container}>
      
      <View style={styles.profileSection}>
        <Ionicons name="person-circle" size={150} color="#00B14F"/>
        
        {loading ? (
          <ActivityIndicator size="large" color="#00B14F" />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.userName}>Olá, {nome || "Usuário"}</Text>
            <Text style={styles.userPhone}>{telefone || "Sem telefone"}</Text>
            <br></br>
            <br></br>
            <Text onPress={() => navigation.navigate("HomeScreen")}>Sair</Text>
          </View>
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

        <TouchableOpacity style={styles.menuItem}>
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
    alignItems: "center",
    justifyContent: "center",
  },
  profileSection: {
    alignItems: "center",
    bottom: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 10,
  },
  userPhone: {
    fontSize: 18,
    color: "#666",
    marginTop: 5,
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
    flex: 1,
  },
  menuText: {
    color: "white",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },
});