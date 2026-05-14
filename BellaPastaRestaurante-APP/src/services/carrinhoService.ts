import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CarrinhoItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string | null;
  descricao: string;
}

export interface CarrinhoResponse {
  success: boolean;
  message: string;
  carrinho?: CarrinhoItem[];
  item?: CarrinhoItem;
}

class CarrinhoService {
  private static STORAGE_KEY = '@carrinho_bella_pasta';

  // Adicionar produto ao carrinho
  static async adicionarProduto(
    produto: Omit<CarrinhoItem, 'quantidade'> & { quantidade?: number }
  ): Promise<CarrinhoResponse> {
    try {
      const carrinhoSalvo = await AsyncStorage.getItem(this.STORAGE_KEY);
      let carrinho: CarrinhoItem[] = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
      
      const quantidade = produto.quantidade || 1;
      const itemExistente = carrinho.find(item => item.id === produto.id);
      
      if (itemExistente) {
        itemExistente.quantidade += quantidade;
        await this.salvarCarrinho(carrinho);
        return {
          success: true,
          message: `Quantidade de ${produto.nome} aumentada para ${itemExistente.quantidade}!`,
          carrinho
        };
      } else {
        const novoItem: CarrinhoItem = {
          id: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: quantidade,
          imagem: produto.imagem,
          descricao: produto.descricao
        };
        carrinho.push(novoItem);
        await this.salvarCarrinho(carrinho);
        return {
          success: true,
          message: `${produto.nome} adicionado ao carrinho! 🛒`,
          carrinho,
          item: novoItem
        };
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      return {
        success: false,
        message: 'Erro ao adicionar produto ao carrinho'
      };
    }
  }

  // Remover produto do carrinho
  static async removerProduto(id: string, nome: string): Promise<CarrinhoResponse> {
    try {
      const carrinhoSalvo = await AsyncStorage.getItem(this.STORAGE_KEY);
      let carrinho: CarrinhoItem[] = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
      
      const itemExistente = carrinho.find(item => item.id === id);
      
      if (itemExistente) {
        if (itemExistente.quantidade > 1) {
          itemExistente.quantidade -= 1;
          await this.salvarCarrinho(carrinho);
          return {
            success: true,
            message: `Uma unidade de ${nome} removida. Restam ${itemExistente.quantidade}`,
            carrinho
          };
        } else {
          carrinho = carrinho.filter(item => item.id !== id);
          await this.salvarCarrinho(carrinho);
          return {
            success: true,
            message: `${nome} removido do carrinho!`,
            carrinho
          };
        }
      }
      
      return {
        success: false,
        message: 'Produto não encontrado no carrinho'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao remover produto'
      };
    }
  }

  // Remover item completamente
  static async removerItemCompleto(id: string, nome: string): Promise<CarrinhoResponse> {
    try {
      const carrinhoSalvo = await AsyncStorage.getItem(this.STORAGE_KEY);
      let carrinho: CarrinhoItem[] = carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
      
      carrinho = carrinho.filter(item => item.id !== id);
      await this.salvarCarrinho(carrinho);
      
      return {
        success: true,
        message: `${nome} removido completamente do carrinho!`,
        carrinho
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao remover produto'
      };
    }
  }

  // Listar carrinho
  static async listarCarrinho(): Promise<CarrinhoItem[]> {
    try {
      const carrinhoSalvo = await AsyncStorage.getItem(this.STORAGE_KEY);
      return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
    } catch (error) {
      console.error('Erro ao listar carrinho:', error);
      return [];
    }
  }

  // Limpar carrinho
  static async limparCarrinho(): Promise<CarrinhoResponse> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      return {
        success: true,
        message: 'Carrinho esvaziado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao limpar carrinho'
      };
    }
  }

  // Obter total do carrinho
  static async getTotal(): Promise<number> {
    const carrinho = await this.listarCarrinho();
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  }

  private static async salvarCarrinho(carrinho: CarrinhoItem[]): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(carrinho));
  }
}

export default CarrinhoService;