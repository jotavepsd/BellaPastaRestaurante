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
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/(tabs)/index";
import { database } from "../services/connectionFirebase";
import { ref, onValue, update, remove } from "firebase/database";
import { uploadImagem, deletarImagem } from "../services/uploadImageService";
import * as ImagePicker from "expo-image-picker";
import Ionicons from '@expo/vector-icons/Ionicons';

type NavProp = StackNavigationProp<RootStackParamList>;

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem?: string;
}

export default function GerenciarProdutosScreen() {
  const navigation = useNavigation<NavProp>();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoProduto, setEditandoProduto] = useState<Produto | null>(null);
  
  const [modalExclusaoVisible, setModalExclusaoVisible] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null);
  
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [carregandoImagem, setCarregandoImagem] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = () => {
    setLoading(true);
    const produtosRef = ref(database, "produtos");
    
    const unsubscribe = onValue(produtosRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const produtosList = Object.entries(data).map(([id, value]: [string, any]) => ({
          id: id,
          nome: value.nome || "",
          descricao: value.descricao || "",
          preco: value.preco || 0,
          categoria: value.categoria || "",
          imagem: value.imagem || null,
        }));
        setProdutos(produtosList);
      } else {
        setProdutos([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar produtos:", error);
      Alert.alert("Erro", "Falha ao carregar produtos: " + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const selecionarImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Precisamos de acesso à sua galeria para selecionar a imagem.");
      return;
    }

    setCarregandoImagem(true);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    setCarregandoImagem(false);

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Precisamos de acesso à sua câmera para tirar foto.");
      return;
    }

    setCarregandoImagem(true);

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    setCarregandoImagem(false);

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const abrirModalEdicao = (produto: Produto) => {
    setEditandoProduto(produto);
    setNome(produto.nome);
    setDescricao(produto.descricao);
    setPreco(produto.preco.toString());
    setCategoria(produto.categoria);
    setImagem(produto.imagem || null);
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
      if (produtoParaExcluir.imagem) {
        await deletarImagem(produtoParaExcluir.imagem);
      }
      
      const produtoRef = ref(database, `produtos/${produtoParaExcluir.id}`);
      await remove(produtoRef);
      
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
      let imagemURL = editandoProduto?.imagem || "";
      
      if (imagem && imagem !== editandoProduto?.imagem) {
        if (editandoProduto?.imagem) {
          await deletarImagem(editandoProduto.imagem);
        }
        
        const nomeArquivo = nome.trim().replace(/\s/g, "_");
        imagemURL = await uploadImagem(imagem, nomeArquivo);
      } else if (imagem === null && editandoProduto?.imagem) {
        await deletarImagem(editandoProduto.imagem);
        imagemURL = "";
      }

      const produtoRef = ref(database, `produtos/${editandoProduto?.id}`);
      
      const dadosAtualizados: any = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco: precoNumerico,
        categoria: categoria.trim(),
        imagem: imagemURL,
      };
      
      await update(produtoRef, dadosAtualizados);

      Alert.alert("Sucesso", "Produto updated com sucesso!");
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
    setImagem(null);
  };

  const renderProduto = ({ item }: { item: Produto }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {item.imagem && (
          <Image source={{ uri: item.imagem }} style={styles.produtoImagem} />
        )}
        <View style={styles.produtoInfo}>
          <Text style={styles.produtoNome}>{item.nome}</Text>
          <Text style={styles.produtoDescricao} numberOfLines={2}>
            {item.descricao}
          </Text>
          <Text style={styles.produtoPreco}>R$ {item.preco.toFixed(2)}</Text>
          <Text style={styles.produtoCategoria}>{item.categoria}</Text>
        </View>
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
              <Text style={styles.label}>Imagem do produto</Text>
              
              <TouchableOpacity style={styles.imageContainer} onPress={selecionarImagem}>
                {carregandoImagem ? (
                  <ActivityIndicator size="large" color="#00B14F" />
                ) : imagem ? (
                  <Image source={{ uri: imagem }} style={styles.previewImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={50} color="#999" />
                    <Text style={styles.imagePlaceholderText}>Selecionar imagem</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.imageOptions}>
                <TouchableOpacity style={styles.imageOptionBtn} onPress={selecionarImagem}>
                  <Ionicons name="images-outline" size={20} color="#00B14F" />
                  <Text style={styles.imageOptionText}>Galeria</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.imageOptionBtn} onPress={tirarFoto}>
                  <Ionicons name="camera-outline" size={20} color="#00B14F" />
                  <Text style={styles.imageOptionText}>Câmera</Text>
                </TouchableOpacity>
                
                {imagem && (
                  <TouchableOpacity style={styles.imageOptionBtn} onPress={() => setImagem(null)}>
                    <Ionicons name="trash-outline" size={20} color="#FF3131" />
                    <Text style={[styles.imageOptionText, { color: "#FF3131" }]}>Remover</Text>
                  </TouchableOpacity>
                )}
              </View>

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
    flexDirection: "row",
  },
  produtoImagem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  produtoInfo: {
    flex: 1,
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
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#000",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  imageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: "#999",
    fontSize: 14,
  },
  imageOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  imageOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  imageOptionText: {
    fontSize: 14,
    color: "#00B14F",
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelarModalBtn: {
    backgroundColor: "#FF3131",
  },
  cancelarModalText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  salvarModalBtn: {
    backgroundColor: "#00B14F",
  },
  salvarModalText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalExclusaoOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalExclusaoContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  modalExclusaoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 12,
    marginBottom: 8,
  },
  modalExclusaoMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
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
  },
  exclusaoBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelarExclusaoBtn: {
    backgroundColor: "#f5f5f5",
  },
  cancelarExclusaoText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmarExclusaoBtn: {
    backgroundColor: "#FF3131",
  },
  confirmarExclusaoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});