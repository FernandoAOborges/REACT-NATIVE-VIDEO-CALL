import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';

const useOfferPresence = (collectionPath: string, documentId: string) => {
  const [call, setCall] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection(collectionPath)
      .doc(documentId)
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.data();
          if (data && data.offer !== undefined) {
            // console.log('O campo "offer" existe:', data.offer);
            setCall(true);
          } else {
            // console.log('O campo "offer" não existe ou é undefined.');
            setCall(false);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (error) => {
          setCall(false);
          // console.error('Erro ao obter o snapshot:', error);
        },
      );

    return () => unsubscribe();
  }, [collectionPath, documentId]); // Dependências do useEffect

  return {
    call,
  };
};

export default useOfferPresence;
