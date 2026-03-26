import React from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/(tabs)/index";

const {width, height} = Dimensions.get("window")

type NavProp = StackNavigationProp<RootStackParamList>;

export default function TelaInicial() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela Inicial - Bella Pasta</Text>

      <View style={styles.faixaMenu}></View>
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
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00B14F", 
  },
  faixaMenu: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 1010,
    height: 0,
    borderBottomWidth: height * 0.08,
    borderLeftColor: "transparent",
    borderBottomColor: "#FF3131"
  }
});