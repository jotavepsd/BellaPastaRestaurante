import { storage } from "./connectionFirebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export async function uploadImagem(uri: string, nomeArquivo: string): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, `produtos/${nomeArquivo}_${Date.now()}.jpg`);
    
    await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    throw error;
  }
}

export async function deletarImagem(url: string) {
  try {
    if (!url) return;
    
    const decodeUrl = decodeURIComponent(url);
    const filePath = decodeUrl.split('/o/')[1].split('?')[0];
    
    const imageRef = ref(storage, filePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
  }
}