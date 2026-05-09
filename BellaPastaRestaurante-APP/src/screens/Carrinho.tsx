
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface CardProps {
  item: {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    categoria: string;
    imagem?: string | null;
  };
  index: number;
}

export default function CardProduto({ item, index }: CardProps) {
  const isRed = index % 2 === 0;
  const bgColor = isRed ? "#FF3131" : "#00B14F";
  const flexDirection = isRed ? 'row' : 'row-reverse';



  const adicionarAoCarrinho = async () => {
    try {
      const carrinhoSalvo = await AsyncStorage.getItem('@carrinho');
      let carrinho = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
      
      const itemExistente = carrinho.find((i: any) => i.id === item.id);
      
      if (itemExistente) {
        itemExistente.quantidade += 1;
      } else {
        carrinho.push({
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          quantidade: 1,
          imagem: item.imagem,
          descricao: item.descricao,
        });
      }
      
      await AsyncStorage.setItem('@carrinho', JSON.stringify(carrinho));
      Alert.alert('Sucesso', `${item.nome} adicionado ao carrinho!`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao adicionar ao carrinho.');
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={[styles.card, { backgroundColor: bgColor, flexDirection }]}>
        <View style={styles.cardContent}>
          <Text style={styles.titulo} numberOfLines={1}>{item.nome}</Text>
          <Text style={styles.descricao} numberOfLines={3}>{item.descricao}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.botao} onPress={adicionarAoCarrinho}>
              <Text style={[styles.textoBotao, { color: bgColor }]}>Pedir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botao}>
              <Text style={[styles.textoBotao, { color: bgColor }]}>Detalhes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.faixaInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Preço</Text>
          <Text style={styles.infoValor}>R$ {item.preco?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Categoria</Text>
          <Text style={styles.infoValor}>{item.categoria || 'Sem categoria'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: width * 0.92,
    alignSelf: 'center',
    marginVertical: 10,
  },
  card: {
    width: '100%',
    height: 155,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#000',
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  faixaInfo: {
    width: '100%',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#000',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  infoValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00B14F',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#DDD',
  },
});