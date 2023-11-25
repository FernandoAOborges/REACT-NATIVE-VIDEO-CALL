import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';

const useOfferPresence = (collectionPath, documentId) => {
  const [call, setCall] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection(collectionPath)
      .doc(documentId)
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.data();
          if (data && data.offer !== undefined) {
            console.log('O campo "offer" existe:', data.offer);
            setCall(true);
          } else {
            console.log('O campo "offer" não existe ou é undefined.');
            setCall(false);
          }
        },
        (error) => {
          setCall(false);
          console.error('Erro ao obter o snapshot:', error);
        },
      );

    // Retorna uma função de limpeza para desconectar o ouvinte quando o componente for desmontado
    return () => unsubscribe();
  }, [collectionPath, documentId]); // Dependências do useEffect

  return {
    call,
  };

  // Pode retornar valores adicionais conforme necessário para seu caso de uso
};

export default useOfferPresence;
