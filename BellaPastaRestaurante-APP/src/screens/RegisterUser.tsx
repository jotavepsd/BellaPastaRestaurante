import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from "react-native";
import { RootStackParamList } from "../../app/(tabs)/index";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set} from "firebase/database";
import { auth, database } from "../services/connectionFirebase";



const {width, height} = Dimensions.get("window");


type NavProp = StackNavigationProp<RootStackParamList>


export default function RegisterUser(){

    const navigation = useNavigation<NavProp>();

    const [name, setName] = useState<string>("");
    const [cellphone, setCellphone] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");


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

            <input placeholder="Nome" style={styles.input}>
            
            </input>
            <input placeholder="Telefone" style={styles.input}>
            
            </input> 
            <input placeholder="Email" style={styles.input}>
            
            </input> 
            <input placeholder="Senha" style={styles.input}>
            
            </input>               
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
    input: {
        padding: 12,
        width: 250,
        margin: 10,
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
        bottom: 100,
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
});