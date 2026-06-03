import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import { push, ref } from "firebase/database";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView, PanGestureHandler, State } from "react-native-gesture-handler";
import { RootStackParamList } from "../../app/(tabs)/index";
import { database } from "../services/connectionFirebase";
import { uploadImagem } from "../services/uploadImageService";

type NavProp = StackNavigationProp<RootStackParamList>;

export default function CadastroProdutoScreen() {
  const navigation = useNavigation<NavProp>();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [carregandoImagem, setCarregandoImagem] = useState(false);
  const [scrollY, setScrollY] = useState(0);

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

  const handleSalvar = async () => {
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

    setLoading(true);

    try {
      let imagemURL = "";
      
      if (imagem) {
        const nomeArquivo = nome.trim().replace(/\s/g, "_");
        imagemURL = await uploadImagem(imagem, nomeArquivo);
      }

      const produtosRef = ref(database, "produtos");
      
      const produtoData = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco: precoNumerico,
        categoria: categoria.trim(),
        imagem: imagemURL,
        createdAt: new Date().toISOString(),
      };

      await push(produtosRef, produtoData);

      Alert.alert("Sucesso", "Produto cadastrado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
      
      setNome("");
      setDescricao("");
      setPreco("");
      setCategoria("");
      setImagem(null);
      
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao cadastrar produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const onGestureEvent = (event: any) => {
    const translationY = event.nativeEvent.translationY;
    setScrollY(prev => prev + translationY);
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
     
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color="#00B14F" />
              </TouchableOpacity>
              <Text style={styles.title}>Cadastrar Produto</Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={styles.form}>
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
                placeholder="Ex: Carbonara, Genovese"
                value={nome}
                onChangeText={setNome}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Leve e aromático, com o frescor do pesto..."
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={4}
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
                placeholder="Ex: Massa Longa, Massa Curta, Sopa"
                value={categoria}
                onChangeText={setCategoria}
                placeholderTextColor="#999"
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSalvar}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Salvando..." : "Salvar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </PanGestureHandler>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    marginTop: 20,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
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
    height: 100,
    textAlignVertical: "top",
  },
  imageContainer: {
    width: "100%",
    height: 200,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 8,
  },
  saveButton: {
    backgroundColor: "#00B14F",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF3131",
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});