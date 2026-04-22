import React, { useState, useEffect } from "react";
import { 
  StyleSheet, Text, View, Dimensions, TouchableOpacity, 
  ActivityIndicator, Modal, TextInput, Alert 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/(tabs)/index";
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';

import { auth, database } from "../services/connectionFirebase";
import { ref, get, update } from "firebase/database";

const { width, height } = Dimensions.get("window");

type NavProp = StackNavigationProp<RootStackParamList>;

export default function PerfilScreen() {
  const navigation = useNavigation<NavProp>();

  const [nome, setNome] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [novoNome, setNovoNome] = useState<string>("");
  const [novoTelefone, setNovoTelefone] = useState<string>("");

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
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    }
    carregarDados();
  }, []);

  const abrirModal = () => {
    setNovoNome(nome);
    setNovoTelefone(telefone);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, "users " + user.uid);
      try {
        await update(userRef, {
          name: novoNome,
          cellphone: novoTelefone,
        });
        setNome(novoNome);
        setTelefone(novoTelefone);
        setModalVisible(false);
        Alert.alert("Sucesso", "Dados atualizados!");
      } catch (error) {
        Alert.alert("Erro", "Falha ao atualizar dados.");
      }
    }
  };

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
            
            <TouchableOpacity onPress={abrirModal} style={styles.editButton}>
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")} style={{ marginTop: 20 }}>
              <Text style={{ color: 'red' }}>Sair</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Dados</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={novoNome}
              onChangeText={setNovoNome}
            />

            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={novoTelefone}
              keyboardType="phone-pad"
              onChangeText={setNovoTelefone}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#FF3131' }]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#00B14F' }]} 
                onPress={handleUpdate}
              >
                <Text style={styles.btnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.faixaMenu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("InicialScreen")}>
          <Entypo name="home" size={24} color="white" />
          <Text style={styles.menuText}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}><Entypo name="magnifying-glass" size={24} color="white" /><Text style={styles.menuText}>Pesquisar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}><Entypo name="shopping-cart" size={24} color="white" /><Text style={styles.menuText}>Pedidos</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}><Entypo name="ticket" size={24} color="white" /><Text style={styles.menuText}>Reserva</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}><Ionicons name="person" size={24} color="white" /><Text style={styles.menuText}>Perfil</Text></TouchableOpacity>
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
  editButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00B14F'
  },
  editButtonText: {
    color: '#00B14F',
    fontWeight: '600'
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    height: 40,
    width: 100,
    marginHorizontal: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  }
});