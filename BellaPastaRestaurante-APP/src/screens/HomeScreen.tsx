import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Pressable } from "react-native";
import { RootStackParamList } from "../../app/(tabs)/index";

const { width, height } = Dimensions.get('window');

type NavProp = StackNavigationProp<RootStackParamList>

export default function Index() {

    const navigation = useNavigation<NavProp>();

    return (
        <View style={styles.container}>
            
            <View style={styles.faixaVerde} />
            <View style={styles.faixaVermelha} />

            <View style={styles.content}>
                <Text style={styles.principal}>Seja bem-vindo ao</Text>

                <Image 
                    
                    source={require('../../assets/logo_bella_pasta.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                />
               

                
                <View style={styles.buttonContainer}>
                    <Pressable style={[styles.button, styles.bgGreen]} onPress={() => navigation.navigate("LoginUser")}>
                        <Text style={styles.buttonText}>Login</Text>
                    </Pressable>

                    <Text style={styles.ou}>ou</Text>

                    <Pressable style={[styles.button, styles.bgRed]} onPress={() => navigation.navigate("RegisterUser")}>
                        
                        <Text style={styles.buttonText}>Cadastre-se</Text>
                    </Pressable>
                </View>

                <Text style={styles.footerText}>©Política de privacidade</Text>
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
content: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center', 
    width: '100%',
    paddingHorizontal: 20,
},
    principal: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 40,
    },
    logo: {
        width: width * 0.7,
        height: width * 0.7,
        marginBottom: 40,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    button: {
        flex: 1,
        height: 45,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    bgGreen: {
        backgroundColor: '#00B14F',
    },
    bgRed: {
        backgroundColor: '#FF3131',
    },
    ou: {
        marginHorizontal: 15,
        fontSize: 16,
    },
    footerText: {
        marginTop: 60,
        fontSize: 14,
        color: '#333',
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
        borderBottomColor: '#FF3131',
    }
});