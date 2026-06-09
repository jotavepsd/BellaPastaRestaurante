import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../app/(tabs)/index';
import CarrinhoService, { CarrinhoItem } from '../services/carrinhoService';
import CustomToast from '../../components/CustomToast';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { pedidoService } from "../services/pedidoService";
import { notificacaoService } from '../services/notificacaoService';

const { height, width } = Dimensions.get('window');

type NavProp = StackNavigationProp<RootStackParamList>;

export default function CarrinhoScreen() {
  const navigation = useNavigation<NavProp>();
  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [total, setTotal] = useState(0);
  

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');


  const [modalRemoverVisible, setModalRemoverVisible] = useState(false);
  const [modalLimparVisible, setModalLimparVisible] = useState(false);
  const [modalFinalizarVisible, setModalFinalizarVisible] = useState(false);

 
  const [itemParaExcluir, setItemParaExcluir] = useState<{ id: string; nome: string } | null>(null);
  const [cupom, setCupom] = useState('');
  const [desconto, setDesconto] = useState(0);

 useFocusEffect(
  useCallback(() => {
    carregarCarrinho();
  }, [])
);

  const carregarCarrinho = async () => {
    try {
      const carrinho = await CarrinhoService.listarCarrinho();
      setItens(carrinho);
      const valorTotal = await CarrinhoService.getTotal();
      setTotal(valorTotal);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  
  const handleRemoverUnidade = async (id: string, nome: string) => {
    const response = await CarrinhoService.removerProduto(id, nome);
    showToast(response.message, response.success ? 'success' : 'error');
    await carregarCarrinho();
  };

 
  const handleAbrirConfirmacaoItem = (id: string, nome: string) => {
    setItemParaExcluir({ id, nome });
    setModalRemoverVisible(true);
  };

  const confirmarExclusaoItem = async () => {
    if (!itemParaExcluir) return;
    const { id, nome } = itemParaExcluir;
    setModalRemoverVisible(false);
    
    const response = await CarrinhoService.removerItemCompleto(id, nome);
    showToast(response.message, response.success ? 'success' : 'error');
    await carregarCarrinho();
    setItemParaExcluir(null);
  };


  const confirmarLimparCarrinho = async () => {
    setModalLimparVisible(false);
    const response = await CarrinhoService.limparCarrinho();
    showToast(response.message, response.success ? 'success' : 'error');
    await carregarCarrinho();
  };

  
  const aplicarCupom = () => {
    const cupomTexto = cupom.trim().toUpperCase();
    if (cupomTexto === 'DESCONTO10') {
      setDesconto(total * 0.10); 
      showToast("Cupom de 10% aplicado!", "success");
    } else if (cupomTexto === 'BELLAPASTA') {
      setDesconto(total * 0.15); 
      showToast("Cupom de 15% aplicado!", "success");
    } else if (cupomTexto === '') {
      showToast("Digite um cupom válido", "info");
    } else {
      showToast("Cupom inválido ou expirado", "error");
      setDesconto(0);
    }
  };

const handleEnviarPedidoFinal = async () => {
  try {
    await pedidoService.create(
      itens,
      total,
      desconto
    );

    await CarrinhoService.limparCarrinho();

    await carregarCarrinho();

    await notificacaoService.create({
  pedidoId: "geral",
  mensagem: "Seu pedido foi confirmado!",
  status: "confirmado",
  data: new Date().toISOString(),
});

    setModalFinalizarVisible(false);

    showToast(
      "Pedido enviado com sucesso!",
      "success"
    );
  } catch (error) {
    console.log("Erro ao salvar pedido:", error);

    showToast(
      "Erro ao finalizar pedido",
      "error"
    );
  }
};

  const renderItem = ({ item }: { item: CarrinhoItem }) => (
    <View style={styles.itemCard}>
      {item.imagem ? (
        <Image source={{ uri: item.imagem }} style={styles.itemImagem} />
      ) : (
        <View style={[styles.itemImagem, styles.itemSemImagem]}>
          <Ionicons name="image-outline" size={24} color="#ccc" />
        </View>
      )}

      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <Text style={styles.itemPreco}>R$ {item.preco.toFixed(2)}</Text>
        <View style={styles.quantidadeContainer}>
          <Text style={styles.itemQtd}>Qtd: {item.quantidade}</Text>
          <Text style={styles.itemSubtotal}>
            Sub: R$ {(item.preco * item.quantidade).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.botoesContainer}>
        <TouchableOpacity 
          style={[styles.botao, styles.botaoRemover]}
          onPress={() => handleRemoverUnidade(item.id, item.nome)}
        >
          <Ionicons name="remove" size={20} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.botao, styles.botaoRemoverTotal]}
          onPress={() => handleAbrirConfirmacaoItem(item.id, item.nome)}
        >
          <Ionicons name="trash" size={18} color="#fff" />
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

      {/* MODAL 1: CONFIRMAR REMOÇÃO DE UM ITEM */}
      <Modal visible={modalRemoverVisible} transparent animationType="fade" onRequestClose={() => setModalRemoverVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalAlertaContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF3131" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitulo}>Remover item?</Text>
            <Text style={styles.modalMensagem}>
              Deseja remover <Text style={{ fontWeight: 'bold' }}>{itemParaExcluir?.nome}</Text> do carrinho?
            </Text>
            <View style={styles.modalBotoesRow}>
              <TouchableOpacity style={[styles.modalBotao, styles.botaoCancel]} onPress={() => setModalRemoverVisible(false)}>
                <Text style={styles.textoCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBotao, styles.botaoConfirm]} onPress={confirmarExclusaoItem}>
                <Text style={styles.textoConfirm}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: CONFIRMAR ESVAZIAR TODO O CARRINHO */}
      <Modal visible={modalLimparVisible} transparent animationType="fade" onRequestClose={() => setModalLimparVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalAlertaContainer}>
            <Ionicons name="trash-bin" size={48} color="#FF3131" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitulo}>Limpar Carrinho?</Text>
            <Text style={styles.modalMensagem}>Isso removerá absolutamente todos os produtos da sua lista atual.</Text>
            <View style={styles.modalBotoesRow}>
              <TouchableOpacity style={[styles.modalBotao, styles.botaoCancel]} onPress={() => setModalLimparVisible(false)}>
                <Text style={styles.textoCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBotao, styles.botaoConfirm]} onPress={confirmarLimparCarrinho}>
                <Text style={styles.textoConfirm}>Limpar Tudo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: FINALIZAR PEDIDO (REVISÃO + CUPOM) */}
      <Modal visible={modalFinalizarVisible} transparent animationType="slide" onRequestClose={() => setModalFinalizarVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalFinalizarContainer}>
            <View style={styles.modalFinalizarHeader}>
              <Text style={styles.modalFinalizarTitulo}>Resumo do Pedido</Text>
              <TouchableOpacity onPress={() => setModalFinalizarVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Lista dos Itens no Resumo */}
            <ScrollView style={styles.resumoScrollView} showsVerticalScrollIndicator={false}>
              {itens.map((item) => (
                <View key={item.id} style={styles.resumoItemRow}>
                  <Text style={styles.resumoItemTexto} numberOfLines={1}>
                    {item.quantidade}x {item.nome}
                  </Text>
                  <Text style={styles.resumoItemPreco}>R$ {(item.preco * item.quantidade).toFixed(2)}</Text>
                </View>
              ))}

              {/* Input Cupom de Desconto */}
              <View style={styles.cupomSection}>
                <Text style={styles.cupomLabel}>Possui cupom de desconto?</Text>
                <View style={styles.cupomInputContainer}>
                  <TextInput
                    style={styles.inputCupom}
                    placeholder="Ex: BELLAPASTA"
                    placeholderTextColor="#999"
                    value={cupom}
                    onChangeText={setCupom}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={styles.botaoAplicarCupom} onPress={aplicarCupom}>
                    <Text style={styles.textoAplicarCupom}>Aplicar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Valores Detalhados */}
              <View style={styles.divider} />
              <View style={styles.valoresRow}>
                <Text style={styles.valoresLabel}>Subtotal:</Text>
                <Text style={styles.valoresValor}>R$ {total.toFixed(2)}</Text>
              </View>
              
              {desconto > 0 && (
                <View style={styles.valoresRow}>
                  <Text style={[styles.valoresLabel, { color: '#00B14F' }]}>Desconto:</Text>
                  <Text style={[styles.valoresValor, { color: '#00B14F' }]}>- R$ {desconto.toFixed(2)}</Text>
                </View>
              )}

              <View style={[styles.valoresRow, { marginTop: 8 }]}>
                <Text style={styles.totalFinalLabel}>Total a Pagar:</Text>
                <Text style={styles.totalFinalValor}>R$ {(total - desconto).toFixed(2)}</Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.botaoEnviarPedidoFinal} onPress={handleEnviarPedidoFinal}>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.botaoEnviarPedidoFinalTexto}>Confirmar e Finalizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* HEADER DA TELA */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Meu Carrinho</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* CONTEÚDO PRINCIPAL */}
      {itens.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.navigate("InicialScreen")}>
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

          {/* FOOTER FIXO */}
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalTexto}>Total:</Text>
              <Text style={styles.totalValor}>R$ {total.toFixed(2)}</Text>
            </View>
            
            <View style={styles.botoesFooter}>
              <TouchableOpacity style={[styles.botaoFooter, styles.botaoLimpar]} onPress={() => setModalLimparVisible(true)}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.botaoFooterTexto}>Limpar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.botaoFooter, styles.botaoFinalizar]} onPress={() => setModalFinalizarVisible(true)}>
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
    height: height * 0.15,
    backgroundColor: "#00B14F",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'row',
    paddingTop: 30,
  },
  backButton: {
    width: 40,
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  listaContainer: {
    padding: 16,
    paddingBottom: 140,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  itemImagem: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  itemSemImagem: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemNome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  itemPreco: {
    fontSize: 13,
    color: '#00B14F',
    fontWeight: '600',
    marginBottom: 4,
  },
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    gap: 6,
    marginLeft: 8,
  },
  botao: {
    width: 36,
    height: 36,
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

  /* ESTRUTURA BASE DOS MODAIS */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAlertaContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalMensagem: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalBotoesRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBotao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoCancel: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botaoConfirm: {
    backgroundColor: '#FF3131',
  },
  textoCancel: {
    color: '#555',
    fontWeight: '600',
  },
  textoConfirm: {
    color: '#fff',
    fontWeight: 'bold',
  },

  /* MODAL DE FINALIZAR COMPRA COMPLETO */
  modalFinalizarContainer: {
    width: '90%',
    maxHeight: height * 0.75,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalFinalizarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalFinalizarTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resumoScrollView: {
    marginBottom: 16,
  },
  resumoItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  resumoItemTexto: {
    fontSize: 14,
    color: '#555',
    maxWidth: width * 0.55,
  },
  resumoItemPreco: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cupomSection: {
    marginTop: 16,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
  },
  cupomLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  cupomInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  inputCupom: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  botaoAplicarCupom: {
    backgroundColor: '#333',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  textoAplicarCupom: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 14,
  },
  valoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  valoresLabel: {
    fontSize: 14,
    color: '#666',
  },
  valoresValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalFinalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalFinalValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00B14F',
  },
  botaoEnviarPedidoFinal: {
    backgroundColor: '#00B14F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  botaoEnviarPedidoFinalTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});