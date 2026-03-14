import { StackNavigationProp } from "@react-navigation/stack";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../../app/(tabs)/index";

type NavProp = StackNavigationProp<RootStackParamList>


export default function Index(){
    return(
    <View style={styles.container}>
                    
        <View style={styles.faixaVerde} />
        <View style={styles.faixaVermelha}/>

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