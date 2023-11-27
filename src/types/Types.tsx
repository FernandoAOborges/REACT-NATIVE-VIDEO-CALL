/* eslint-disable no-shadow */
export interface IUsersProps {
  id: number;
  name: string;
  avatar: string;
}

export enum ECallTypeProps {
  CALLER = 'caller',
  CALLEE = 'callee',
}

export enum ECallsStageProps {
  WAITING = 'waiting',
  STARTED = 'started',
  STOPED = 'stopped',
}

export interface ICallTypes {
  callId: string;
  sender: string;
  receiver: string;
  status: ECallsStageProps;
  timestamp: Date;
}

export enum EFirebaseFoldersProps {
  ROOMS = 'rooms',
}

export enum EFirebaseCollectionsProps {
  CALLER_CANDIDATES = 'callerCandidates',
  CALLEE_CANDIDATES = 'calleeCandidates',
}

interface IIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface IServerConfigProps {
  iceServers: IIceServer[];
}
