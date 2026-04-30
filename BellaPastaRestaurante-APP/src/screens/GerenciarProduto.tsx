import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/(tabs)/index";
import { database } from "../services/connectionFirebase";
import { ref, onValue, update, remove } from "firebase/database";
import Ionicons from '@expo/vector-icons/Ionicons';

type NavProp = StackNavigationProp<RootStackParamList>;

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
}

export default function GerenciarProdutosScreen() {
  const navigation = useNavigation<NavProp>();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoProduto, setEditandoProduto] = useState<Produto | null>(null);
  
  // Modal de confirmação de exclusão
  const [modalExclusaoVisible, setModalExclusaoVisible] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null);
  
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = () => {
    setLoading(true);
    const produtosRef = ref(database, "produtos");
    
    const unsubscribe = onValue(produtosRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Dados carregados do Firebase:", data);
      
      if (data) {
        const produtosList = Object.entries(data).map(([id, value]: [string, any]) => ({
          id: id,
          nome: value.nome || "",
          descricao: value.descricao || "",
          preco: value.preco || 0,
          categoria: value.categoria || "",
        }));
        setProdutos(produtosList);
        console.log("Produtos carregados:", produtosList.length);
      } else {
        setProdutos([]);
        console.log("Nenhum produto encontrado");
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar produtos:", error);
      Alert.alert("Erro", "Falha ao carregar produtos: " + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const abrirModalEdicao = (produto: Produto) => {
    setEditandoProduto(produto);
    setNome(produto.nome);
    setDescricao(produto.descricao);
    setPreco(produto.preco.toString());
    setCategoria(produto.categoria);
    setModalVisible(true);
  };

  const abrirModalExclusao = (produto: Produto) => {
    setProdutoParaExcluir(produto);
    setModalExclusaoVisible(true);
  };

  const confirmarExclusao = async () => {
    if (!produtoParaExcluir) return;
    
    setExcluindo(true);
    
    try {
      console.log("Excluindo produto:", produtoParaExcluir.id, produtoParaExcluir.nome);
      
      if (!produtoParaExcluir.id) {
        Alert.alert("Erro", "ID do produto não encontrado");
        return;
      }
      
      const produtoRef = ref(database, `produtos/${produtoParaExcluir.id}`);
      await remove(produtoRef);
      
      console.log("Produto excluído com sucesso!");
      Alert.alert("Sucesso", "Produto excluído com sucesso!");
      
      setModalExclusaoVisible(false);
      setProdutoParaExcluir(null);
      
    } catch (error: any) {
      console.error("Erro detalhado ao excluir:", error);
      Alert.alert("Erro", "Falha ao excluir produto. Verifique sua conexão e permissões.");
    } finally {
      setExcluindo(false);
    }
  };

  const handleSalvarEdicao = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Digite o nome do produto");
      return;
    }
    if (!descricao.trim()) {
      Alert.alert("Erro", "Digite a descrição do produto");
      return;
    }
    if (!preco.trim()) {
      Alert.alert("Erro", "Digite o preço do produto");
      return;
    }
    if (!categoria.trim()) {
      Alert.alert("Erro", "Digite a categoria do produto");
      return;
    }

    const precoNumerico = parseFloat(preco.replace(",", "."));
    if (isNaN(precoNumerico)) {
      Alert.alert("Erro", "Digite um preço válido (ex: 29.90)");
      return;
    }

    setSalvando(true);

    try {
      const produtoRef = ref(database, `produtos/${editandoProduto?.id}`);
      await update(produtoRef, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco: precoNumerico,
        categoria: categoria.trim(),
      });

      Alert.alert("Sucesso", "Produto atualizado com sucesso!");
      setModalVisible(false);
      setEditandoProduto(null);
      limparFormulario();
    } catch (error: any) {
      console.error("Erro ao atualizar:", error);
      Alert.alert("Erro", "Falha ao atualizar produto: " + (error.message || ""));
    } finally {
      setSalvando(false);
    }
  };

  const limparFormulario = () => {
    setNome("");
    setDescricao("");
    setPreco("");
    setCategoria("");
  };

  const renderProduto = ({ item }: { item: Produto }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.produtoNome}>{item.nome}</Text>
        <Text style={styles.produtoDescricao} numberOfLines={2}>
          {item.descricao}
        </Text>
        <Text style={styles.produtoPreco}>R$ {item.preco.toFixed(2)}</Text>
        <Text style={styles.produtoCategoria}>{item.categoria}</Text>
      </View>
      
      <View style={styles.cardButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.buttonEditar]}
          onPress={() => abrirModalEdicao(item)}
        >
          <Ionicons name="pencil" size={20} color="#00B14F" />
          <Text style={styles.buttonTextEditar}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.buttonExcluir]}
          onPress={() => abrirModalExclusao(item)}
        >
          <Ionicons name="trash" size={20} color="#FF3131" />
          <Text style={styles.buttonTextExcluir}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#00B14F" />
        </TouchableOpacity>
        <Text style={styles.title}>Gerenciar Produtos</Text>
        <View style={{ width: 28 }} />
      </View>

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
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
              <TouchableOpacity 
                style={styles.cadastrarBtn}
                onPress={() => navigation.navigate("CadastroProduto")}
              >
                <Text style={styles.cadastrarBtnText}>+ Cadastrar Produto</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

    
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Produto</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nome do produto *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do produto"
                value={nome}
                onChangeText={setNome}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descrição do produto"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Preço *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 49.90"
                value={preco}
                onChangeText={setPreco}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Categoria *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Massas"
                value={categoria}
                onChangeText={setCategoria}
                placeholderTextColor="#999"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelarModalBtn]}
                  onPress={() => {
                    setModalVisible(false);
                    limparFormulario();
                  }}
                >
                  <Text style={styles.cancelarModalText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.salvarModalBtn]}
                  onPress={handleSalvarEdicao}
                  disabled={salvando}
                >
                  <Text style={styles.salvarModalText}>
                    {salvando ? "Salvando..." : "Salvar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

   
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalExclusaoVisible}
        onRequestClose={() => setModalExclusaoVisible(false)}
      >
        <View style={styles.modalExclusaoOverlay}>
          <View style={styles.modalExclusaoContent}>
            <Ionicons name="warning" size={60} color="#FF3131" />
            <Text style={styles.modalExclusaoTitle}>Excluir Produto</Text>
            <Text style={styles.modalExclusaoMessage}>
              Tem certeza que deseja excluir "{produtoParaExcluir?.nome}"?
            </Text>
            <Text style={styles.modalExclusaoSubMessage}>
              Esta ação não pode ser desfeita.
            </Text>
            
            <View style={styles.modalExclusaoButtons}>
              <TouchableOpacity
                style={[styles.exclusaoBtn, styles.cancelarExclusaoBtn]}
                onPress={() => {
                  setModalExclusaoVisible(false);
                  setProdutoParaExcluir(null);
                }}
              >
                <Text style={styles.cancelarExclusaoText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exclusaoBtn, styles.confirmarExclusaoBtn]}
                onPress={confirmarExclusao}
                disabled={excluindo}
              >
                <Text style={styles.confirmarExclusaoText}>
                  {excluindo ? "Excluindo..." : "Excluir"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listaContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 6,
  },
  produtoDescricao: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  produtoPreco: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00B14F",
    marginBottom: 4,
  },
  produtoCategoria: {
    fontSize: 12,
    color: "#999",
  },
  cardButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  buttonEditar: {
    backgroundColor: "#f5f5f5",
  },
  buttonExcluir: {
    backgroundColor: "#f5f5f5",
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
  },
  buttonTextEditar: {
    color: "#00B14F",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonTextExcluir: {
    color: "#FF3131",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  cadastrarBtn: {
    backgroundColor: "#00B14F",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cadastrarBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 10,
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  salvarModalBtn: {
    backgroundColor: "#00B14F",
  },
  cancelarModalBtn: {
    backgroundColor: "#FF3131",
  },
  salvarModalText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelarModalText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  modalExclusaoOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalExclusaoContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalExclusaoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF3131",
    marginTop: 12,
    marginBottom: 8,
  },
  modalExclusaoMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  modalExclusaoSubMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  modalExclusaoButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  exclusaoBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelarExclusaoBtn: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  confirmarExclusaoBtn: {
    backgroundColor: "#FF3131",
  },
  cancelarExclusaoText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 16,
  },
  confirmarExclusaoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});