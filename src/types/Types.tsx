export interface IUsersProps {
  id: number;
  name: string;
  avatar: string;
}

// eslint-disable-next-line no-shadow
export enum ECallTypeProps {
  CALLER = 'caller',
  CALLEE = 'callee',
}
