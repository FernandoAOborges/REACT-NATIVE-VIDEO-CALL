import { useCallback, useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import RNCallKeep from 'react-native-callkeep';

import { ECallsStageProps, IUsersProps } from '@/types/Types';

const useOfferPresence = (collectionPath: string, documentId: string, user: IUsersProps) => {
  const [isOfferPresent, setIsOfferPresent] = useState(false);

  const updateStatus = useCallback(async () => {
    try {
      await firestore().collection(collectionPath).doc(documentId).update({
        'userData.status': ECallsStageProps.STARTED,
      });
    } catch (error) {
      console.error('Erro ao atualizar o status no Firebase:', error);
    }
  }, [collectionPath, documentId]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection(collectionPath)
      .doc(documentId)
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.data();

          const { receiver, status } = data?.userData || {};

          if (
            data &&
            data.offer !== undefined &&
            receiver === user?.id &&
            status === ECallsStageProps.WAITING
          ) {
            RNCallKeep.displayIncomingCall(documentId, user?.name);
            updateStatus();

            // update status on firebase
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
  }, [collectionPath, documentId, user, updateStatus]);

  return {
    isOfferPresent,
  };
};

export default useOfferPresence;
