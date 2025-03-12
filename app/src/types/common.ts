export type Screen = {
  name: string;
};

export type Status = { success: boolean };

export type Result<T> = {
  data: T | null;
  error: { message: string } | null;
};

export type Language = {
  identifier: string;
  language: string;
  name: string;
  quality: string;
};

export type Phrase = {
  en: string;
  uk: string;
};

export type LogType = 'error' | 'info' | 'success' | 'warning';

// export type LogItem = {
//   timestamp: number;
//   date: string;
//   message: string;
//   type: LogType;
// };
