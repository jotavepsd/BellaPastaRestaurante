import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../../src/screens/HomeScreen";
import RegisterUser from "../../src/screens/RegisterUser";
import LoginUser from "../../src/screens/LoginUser";
import TelaInicial from "../../src/screens/InicialScreen";
import PerfilScreen from "../../src/screens/PerfilScreen";

export type RootStackParamList = {
    HomeScreen: undefined;
    RegisterUser: undefined;
    LoginUser: undefined;
    InicialScreen: undefined;
    PerfilScreen: undefined
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootStack() {
    return (
        <Stack.Navigator
            initialRouteName="HomeScreen"
            screenOptions={{headerShown: false}}
            >
        <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}/>

        <Stack.Screen
                name="RegisterUser"
                component={RegisterUser}/>

        <Stack.Screen
                name="LoginUser"
                component={LoginUser}/>

        <Stack.Screen
                name="InicialScreen"
                component={TelaInicial}/>

        <Stack.Screen
                name="PerfilScreen"
                component={PerfilScreen}/>
            </Stack.Navigator>



            
    );
}