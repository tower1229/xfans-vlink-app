export interface User {
  id: string;
  username: string;
  walletAddress: string;
  email?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export type EditUser = {
  username?: string;
  email?: string;
  password: string;
  walletAddress?: string;
  role?: string;
  newPassword?: string;
};
