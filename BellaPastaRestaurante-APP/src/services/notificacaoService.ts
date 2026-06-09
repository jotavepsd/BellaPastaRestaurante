import {
  getNotificacoes,
  saveNotificacoes,
} from "./jsonbinService";

export const notificacaoService = {
  async getAll() {
    return await getNotificacoes();
  },

  async create(notificacao: {
    pedidoId: string;
    mensagem: string;
    status: string;
    data: string;
  }) {
    const notificacoes = await getNotificacoes();

    notificacoes.push({
      id: Date.now().toString(),
      pedidoId: notificacao.pedidoId,
      mensagem: notificacao.mensagem,
      status: notificacao.status,
      lida: false,
      data: notificacao.data,
    });

    await saveNotificacoes(notificacoes);

    return notificacao;
  },
};