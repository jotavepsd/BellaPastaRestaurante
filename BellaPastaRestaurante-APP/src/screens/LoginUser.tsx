import React, { useState } from "react";
import { 
  Dimensions, 
  TextInput, 
  Image, 
  StyleSheet, 
  Text, 
  View, 
  Platform, 
  Alert, 
  Pressable 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/(tabs)/index";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/connectionFirebase";

const { width, height } = Dimensions.get("window");

type NavProp = StackNavigationProp<RootStackParamList>;

export default function Login() {
  const navigation = useNavigation<NavProp>();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  function showAlert(msg: string) {
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Atenção", msg);
    }
  }

  async function handleLogin() {
    if (!email || !password) {
      showAlert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate("InicialScreen");
    } catch (error: any) {
      let mensagemErro = "Erro ao realizar login.";
      
      if (error.code === 'auth/invalid-credential') {
        mensagemErro = "E-mail ou senha incorretos.";
      } else if (error.code === 'auth/invalid-email') {
        mensagemErro = "E-mail inválido.";
      }
      
      showAlert(mensagemErro);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.faixaVerde} />
      <View style={styles.faixaVermelha} />

      <View style={styles.content}>
        <Image
          source={require("../../assets/logo_bella_pasta.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Senha"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable 
          style={[styles.button, styles.bgGreen]} 
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("RegisterUser")}>
          <Text style={styles.footerText}>
            Não possui conta? <Text style={{ fontWeight: "bold" }}>Cadastre-se</Text>
          </Text>
        </Pressable>
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 20, 
  },
  input: {
    padding: 12,
    width: 250,
    margin: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  button: {
    height: 45,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    width: 150,
  },
  bgGreen: {
    backgroundColor: "#00B14F",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  footerText: {
    marginTop: 20,
    fontSize: 14,
    color: "#333",
  },
  faixaVerde: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    borderRightWidth: width * 0.4,
    borderTopWidth: height * 0.2,
    borderRightColor: "transparent",
    borderTopColor: "#00B14F",
  },
  faixaVermelha: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    borderLeftWidth: width * 0.4,
    borderBottomWidth: height * 0.2,
    borderLeftColor: "transparent",
    borderBottomColor: "#FF3131",
  },
});