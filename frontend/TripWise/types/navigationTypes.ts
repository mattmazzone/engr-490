// navigationTypes.ts

// Type for Bottom Tab Navigator
export type BottomTabParamList = {
  Home: undefined;
  Trip: undefined;
  Account: undefined;
};

// Type for Main Stack Navigator
export type MainStackParamList = {
  BottomTabNavigation: undefined;
  SelectInterests: undefined;
};

// Type for Root Stack Navigator
export type RootStackParamList = {
  LoggedInStack: undefined;
  SelectLogin: { onUserCreationComplete: () => void };
  Login: undefined;
  SignUp: { onUserCreationComplete: () => void };
  SelectInterests: { setUserInterests: (hasInterests: boolean) => void };
};
