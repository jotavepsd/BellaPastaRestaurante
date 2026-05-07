import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface CardProps {
  item: {
    nome: string;
    descricao: string;
    imagem?: string | null;
  };
  index: number;
}

export default function CardProduto({ item, index }: CardProps) {
  const isRed = index % 2 === 0;
  const bgColor = isRed ? "#FF3131" : "#00B14F";
  const flexDirection = isRed ? 'row' : 'row-reverse';

  const imageSource = item.imagem 
    ? { uri: item.imagem } 
    : require('../assets/logo_bella_pasta.png');

  return (
    <View style={[styles.card, { backgroundColor: bgColor, flexDirection }]}>
      <Image 
        source={imageSource} 
        style={styles.imagem} 
      />

      <View style={styles.cardContent}>
        <Text style={styles.titulo} numberOfLines={1}>{item.nome}</Text>
        <Text style={styles.descricao} numberOfLines={3}>{item.descricao}</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.botao}>
            <Text style={[styles.textoBotao, { color: bgColor }]}>Pedir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.botao}>
            <Text style={[styles.textoBotao, { color: bgColor }]}>Detalhes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.92,
    height: 155, 
    borderRadius: 25,
    alignSelf: 'center',
    marginVertical: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#000',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  imagem: {
    width: '38%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  descricao: {
    fontSize: 11,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 14,
    paddingHorizontal: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  botao: {
    backgroundColor: '#FFF',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    minWidth: 85,
    alignItems: 'center',
  },
  textoBotao: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});