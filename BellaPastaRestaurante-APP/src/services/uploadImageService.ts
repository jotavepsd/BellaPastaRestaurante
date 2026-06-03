export async function uploadImagem(uriLocalImagem: string, nomeDoProduto: string): Promise<string> {
  const blobArquivo: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new TypeError("Falha ao ler arquivo local"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uriLocalImagem, true);
    xhr.send(null);
  });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blobArquivo);
  });
}

export async function deletarImagem(urlImagem: string): Promise<void> {
  return Promise.resolve();
}