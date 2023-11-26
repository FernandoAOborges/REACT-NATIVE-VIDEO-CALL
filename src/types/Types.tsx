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
