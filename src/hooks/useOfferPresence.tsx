import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import RNCallKeep from 'react-native-callkeep';
import { ECallTypeProps } from '@/types/Types';

const useOfferPresence = (
  collectionPath: string,
  documentId: string,
  idCall: string,
  name: string,
  callType: ECallTypeProps | null,
  firestoreInstance = firestore(), // Passar a instância do firestore como um parâmetro opcional
) => {
  const [isOfferPresent, setIsOfferPresent] = useState(false);

  useEffect(() => {
    const unsubscribe = firestoreInstance
      .collection(collectionPath)
      .doc(documentId)
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.data();

          if (data && data.offer !== undefined) {
            setIsOfferPresent(true);

            // Exibir a chamada recebida apenas se for do tipo CALLER
            if (callType !== ECallTypeProps.CALLER) {
              RNCallKeep.displayIncomingCall(idCall, name);
            }
          } else {
            setIsOfferPresent(false);
          }
        },
        (error) => {
          console.error('Erro ao obter o snapshot:', error);
          setIsOfferPresent(false);
          // Adicione lógica adicional para lidar com o erro, se necessário
        },
      );

    return () => unsubscribe();
  }, [collectionPath, documentId, idCall, name, callType, firestoreInstance]);

  return {
    isOfferPresent,
  };
};

export default useOfferPresence;
