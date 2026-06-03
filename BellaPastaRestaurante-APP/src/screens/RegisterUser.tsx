import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Dimensions, TextInput, Image, StyleSheet, Text, TouchableOpacity, View, Alert, Platform, Pressable } from "react-native";
import { RootStackParamList } from "../../app/(tabs)/index";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set} from "firebase/database";
import { auth, database } from "../services/connectionFirebase";

const {width, height} = Dimensions.get("window");

type NavProp = StackNavigationProp<RootStackParamList>

function applyPhoneMask(value: string): string {
  let numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) {
    return numbers.replace(/(\d{0,2})/, '($1');
  } else if (numbers.length <= 7) {
    return numbers.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
}

export default function RegisterUser(){

    const navigation = useNavigation<NavProp>();

    const [name, setName] = useState<string>("");
    const [cellphone, setCellphone] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [mensagem, setMensagem] = useState<string>("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    const handlePhoneChange = (text: string) => {
      const maskedText = applyPhoneMask(text);
      setCellphone(maskedText);
    };

    const getRawPhoneNumber = (phone: string): string => {
      return phone.replace(/\D/g, '');
    };

    function validateFields(): boolean {

    if (!name || !email || !cellphone || !password) {
      showAlert("Preencha todos os campos obrigatórios");
      return false;
    }

    if (!emailRegex.test(email)) {
      showAlert("Digite um e-mail válido");
      return false;
    }

    if (!passwordRegex.test(password)) {
      showAlert(
        "Senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, número e caractere especial"
      );
      return false;
    }

    const rawPhone = getRawPhoneNumber(cellphone);
    if (rawPhone.length < 11) {
      showAlert("Telefone inválido");
      return false;
    }

    return true;
  }

  function showAlert(msg: string) {
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Atenção", msg);
    }
  }

  async function register(): Promise<void> {

    if (!validateFields()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      if (user) {
        const rawPhone = getRawPhoneNumber(cellphone);
        await set(ref(database, "users " + user.uid), {
          uid: user.uid,
          name,
          cellphone: rawPhone,
          email,
          createdAt: new Date().toISOString(),
        });
      }

      showAlert("Usuário cadastrado com sucesso!");
      setMensagem("Usuário cadastrado com sucesso!");

      setName("");
      setCellphone("");
      setEmail("");
      setPassword("");

    } catch (error: any) {
      showAlert(error.message);
      setMensagem("Erro ao cadastrar usuário");
    }
}

    return(
    <View style={styles.container}>
                    
        <View style={styles.faixaVerde} />
        <View style={styles.faixaVermelha}/>

        <View style={styles.content}>

            <Image                
                source={require('../../assets/logo_bella_pasta.png')} 
                style={styles.logo}
                resizeMode="contain"
            />

            <TextInput placeholder="Nome" style={styles.input}
            value={name}
            onChangeText={setName}
            />

            <TextInput placeholder="Telefone" style={styles.input}
            value={cellphone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={15}/>

            <TextInput placeholder="Email" style={styles.input}
            value={email}
            onChangeText={setEmail}/>

            <TextInput placeholder="Senha" style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry/>

            <Pressable style={[styles.button, styles.bgGreen]} onPress={register}>                                   
                <Text style={styles.buttonText}>Cadastre-se</Text>
            </Pressable>

          <Pressable onPress={() => navigation.navigate("LoginUser")}>
            <Text style={styles.footerText}>
              Já possui conta? <Text style={{ fontWeight: "bold" }}>Entrar</Text></Text>
          </Pressable>

        </View>

    </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
        button: {
       flex: 0.12,
       padding: 5,
        height: 45,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        width: 250
    },
        buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
     bgGreen: {
        backgroundColor: '#00B14F',
    },
    input: {
    padding: 12,
    width: 250,
    margin: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    },
        footerText: {
        marginTop: 20,
        fontSize: 14,
        color: '#333',
    },
    content: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center', 
    width: '100%',
    paddingHorizontal: 20,
    },
        logo: {
        width: width * 0.5,
        height: width * 0.5,
        bottom: 40,
        left: 5
    },
        faixaVerde: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        borderRightWidth: width * 0.4,
        borderTopWidth: height * 0.2,
        borderRightColor: 'transparent',
        borderTopColor: '#00B14F',
    },
    faixaVermelha: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        borderLeftWidth: width * 0.4,
        borderBottomWidth: height * 0.2,
        borderLeftColor: 'transparent',
        borderBottomColor: '#FF3131'
    }
})