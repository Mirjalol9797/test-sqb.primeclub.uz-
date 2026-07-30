// utils/auth.js
import { useLoginStore } from "@/stores/login";

export function getAccessToken() {
  const store = useLoginStore();
  return store.token;
}
