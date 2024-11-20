export type Screen = {
  name: string;
  title: string;
};

export type Status = { success: boolean };

export type Response<T> = {
  data: T | null;
  error: { message: string } | null;
};

export type LogType = 'error' | 'info' | 'success' | 'warning';

// export type LogItem = {
//   timestamp: number;
//   date: string;
//   message: string;
//   type: LogType;
// };
