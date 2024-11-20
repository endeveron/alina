import { AuthData, User } from '../types/user';

export const configureUserData = (user: User): AuthData => {
  const { password, ...safeAccountData } = user.account!;

  return {
    id: user._id.toString(),
    account: safeAccountData,
  };
};
