import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../app/(tabs)/index';
import CarrinhoService, { CarrinhoItem } from '../services/carrinhoService';
import CustomToast from '../../components/CustomToast';
import Ionicons from '@expo/vector-icons/Ionicons';

const { height } = Dimensions.get('window');

type NavProp = StackNavigationProp<RootStackParamList>;

export default function CarrinhoScreen() {
  const navigation = useNavigation<NavProp>();
  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    carregarCarrinho();
  }, []);

  const carregarCarrinho = async () => {
    const carrinho = await CarrinhoService.listarCarrinho();
    setItens(carrinho);
    const valorTotal = await CarrinhoService.getTotal();
    setTotal(valorTotal);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleRemover = async (id: string, nome: string) => {
    const response = await CarrinhoService.removerProduto(id, nome);
    showToast(response.message, response.success ? 'success' : 'error');
    await carregarCarrinho();
  };

  const handleRemoverCompleto = async (id: string, nome: string) => {
    Alert.alert(
      'Remover item',
      `Deseja remover ${nome} completamente do carrinho?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const response = await CarrinhoService.removerItemCompleto(id, nome);
            showToast(response.message, response.success ? 'success' : 'error');
            await carregarCarrinho();
          }
        }
      ]
    );
  };

  const handleLimparCarrinho = async () => {
    Alert.alert(
      'Limpar carrinho',
      'Deseja remover todos os itens do carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            const response = await CarrinhoService.limparCarrinho();
            showToast(response.message, response.success ? 'success' : 'error');
            await carregarCarrinho();
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: CarrinhoItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <Text style={styles.itemPreco}>R$ {item.preco.toFixed(2)}</Text>
        <View style={styles.quantidadeContainer}>
          <Text style={styles.itemQtd}>Quantidade: {item.quantidade}</Text>
          <Text style={styles.itemSubtotal}>
            Subtotal: R$ {(item.preco * item.quantidade).toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={styles.botoesContainer}>
        <TouchableOpacity 
          style={[styles.botao, styles.botaoRemover]}
          onPress={() => handleRemover(item.id, item.nome)}
        >
          <Ionicons name="remove-circle" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.botao, styles.botaoRemoverTotal]}
          onPress={() => handleRemoverCompleto(item.id, item.nome)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomToast 
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      <View style={styles.header}>
  <TouchableOpacity 
    style={styles.backButton} 
    onPress={() => navigation.goBack()}
  >
    <Ionicons name="arrow-back" size={28} color="#fff" />
  </TouchableOpacity>
  <Text style={styles.headerText}>Meu Carrinho</Text>
  <View style={{ width: 40 }} /> {/* Espaçador para centralizar o título */}
</View>

      {itens.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          <TouchableOpacity 
            style={styles.botaoVoltar}
            onPress={() => navigation.navigate("InicialScreen")}
          >
            <Text style={styles.botaoVoltarTexto}>Ver produtos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={itens}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listaContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalTexto}>Total:</Text>
              <Text style={styles.totalValor}>R$ {total.toFixed(2)}</Text>
            </View>
            
            <View style={styles.botoesFooter}>
              <TouchableOpacity 
                style={[styles.botaoFooter, styles.botaoLimpar]}
                onPress={handleLimparCarrinho}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.botaoFooterTexto}>Limpar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.botaoFooter, styles.botaoFinalizar]}
                onPress={() => Alert.alert('Pedido', 'Pedido finalizado com sucesso!')}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.botaoFooterTexto}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
header: {
  width: "100%",
  height: height * 0.2,
  backgroundColor: "#00B14F",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: 'row',
},
backButton: {

  width: 40,
},
headerText: {
  color: "#fff",
  fontSize: 22,
  fontWeight: "bold",
},
  listaContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemPreco: {
    fontSize: 14,
    color: '#00B14F',
    fontWeight: '600',
    marginBottom: 4,
  },
  quantidadeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQtd: {
    fontSize: 12,
    color: '#666',
  },
  itemSubtotal: {
    fontSize: 12,
    color: '#FF3131',
    fontWeight: '600',
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  botao: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoRemover: {
    backgroundColor: '#FF8C00',
  },
  botaoRemoverTotal: {
    backgroundColor: '#FF3131',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValor: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  botoesFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  botaoFooter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  botaoLimpar: {
    backgroundColor: '#FF3131',
  },
  botaoFinalizar: {
    backgroundColor: '#00B14F',
  },
  botaoFooterTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    marginBottom: 30,
  },
  botaoVoltar: {
    backgroundColor: '#FF3131',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  botaoVoltarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});