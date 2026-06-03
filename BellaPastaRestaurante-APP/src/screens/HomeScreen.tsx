import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Dimensions, Image, StyleSheet, Text, View, Pressable } from "react-native";
import { RootStackParamList } from "../../app/(tabs)/index";

const { width } = Dimensions.get('window');

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
    },
    content: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center', 
        width: '100%',
        paddingHorizontal: 30,
        maxWidth: 500,
        alignSelf: 'center',
        zIndex: 2,
    },
    principal: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 30,
        textAlign: 'center',
    },
    logo: {
        width: width * 0.6,
        height: width * 0.6,
        maxHeight: 250,
        maxWidth: 250,
        marginBottom: 40,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
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
        color: '#333',
    },
    footerText: {
        marginTop: 50,
        fontSize: 14,
        color: '#777',
    },
    faixaVerde: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        borderRightWidth: 150,
        borderTopWidth: 150,
        borderRightColor: 'transparent',
        borderTopColor: '#00B14F',
        zIndex: 1,
    },
    faixaVermelha: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        borderLeftWidth: 150,
        borderBottomWidth: 150,
        borderLeftColor: 'transparent',
        borderBottomColor: '#FF3131',
        zIndex: 1,
    }
});