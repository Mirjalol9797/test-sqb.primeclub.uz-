import { toast } from "vue3-toastify";
import { useLoginStore } from "@/stores/login";

import {
  DOCUMENT_STATUS,
  MERCHANT,
  SCORING_STATUS,
  SESSION_STATUS,
} from "./constants";

export function getAccessToken() {
  const store = useLoginStore();
  return store.token;
}

export const formattedDate = (timestamp) => {
  const date = new Date(timestamp);
  const day = ("0" + date.getUTCDate()).slice(-2);
  const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
  const year = date.getUTCFullYear();
  const hours = ("0" + date.getUTCHours()).slice(-2);
  const minutes = ("0" + date.getUTCMinutes()).slice(-2);
  const second = ("0" + date.getUTCSeconds()).slice(-2);
  const formattedDate = `${day}.${month}.${year} ${hours}:${minutes}:${second}`;
  return formattedDate;
};

export const textSessionStatus = (status) => {
  if (status) {
    return SESSION_STATUS[status];
  } else {
    return null;
  }
};

export const textScoringStatus = (status) => {
  if (status) {
    return SCORING_STATUS[status];
  } else {
    return null;
  }
};

export const textMerchantId = (status) => {
  if (status) {
    return MERCHANT[status];
  } else {
    return null;
  }
};

export const copied = async (e) => {
  if (navigator.clipboard) await navigator.clipboard.writeText(e);
};

export const textDocumentStatus = (status) => {
  if (status) {
    return DOCUMENT_STATUS[status];
  } else {
    return null;
  }
};

export const jsonParse = (json) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return json;
  }
};

export function copyToClipboard(e) {
  toast.info("Copied");
  if (typeof e === "object") {
    navigator.clipboard.writeText(JSON.stringify(e));
    return;
  }
  navigator.clipboard.writeText(e);
}

export function phoneFormatter(phone) {
  if (phone && phone.length > 0) {
    phone = phone.includes("+") > 0 ? phone.substring(1) : phone;
    let match = phone.match(/^(\d{3})(\d{2})(\d{3})(\d{4})$/);
    return `+(${match[1]})${match[2]} ${match[3]}-${match[4]}`;
  }
  return "Unknown";
}

export const checkRouteExists = (routeToCheck) => {
  return useLoginStore()?.roles.some((item) => item.route === routeToCheck);
};
