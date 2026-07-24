import type { DataProvider } from "./types";
import { mockProvider } from "./mock-provider";
import { firebaseProvider } from "./firebase-provider";

const provider: DataProvider =
  process.env.NEXT_PUBLIC_DB_PROVIDER === "firebase" ? firebaseProvider : mockProvider;

export default provider;
export type { DataProvider };
export * from "./types";
