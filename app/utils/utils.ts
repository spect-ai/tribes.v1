import { monthMap } from "../constants";
import { Registry, Chain, Token } from "../types";

export const smartTrim = (string: string, maxLength: number) => {
  if (!string) {
    return;
  }
  if (maxLength < 1) return string;
  if (string.length <= maxLength) return string;
  if (maxLength === 1) return `${string.substring(0, 1)}...`;

  const midpoint = Math.ceil(string.length / 2 + 0);
  const toremove = string.length - maxLength;
  const lstrip = Math.ceil(toremove / 2);
  const rstrip = toremove - lstrip;
  return `${string.substring(0, midpoint - lstrip)}...${string.substring(
    midpoint + rstrip
  )}`;
};

export const normalTrim = (string: string, maxLength: number) => {
  if (!string) {
    return;
  }
  if (maxLength < 1) return string;
  if (string.length <= maxLength) return string;
  if (maxLength === 1) return `${string.substring(0, 1)}...`;

  return `${string.substring(0, maxLength)}...`;
};

export function formatTimeLeft(date: Date) {
  const deadline = new Date(date);
  const now = Date.now();
  return msToTime(deadline.getTime() - now);
}

function msToTime(ms: number) {
  let seconds = parseInt((ms / 1000).toFixed(0));
  let minutes = parseInt((ms / (1000 * 60)).toFixed(0));
  let hours = parseInt((ms / (1000 * 60 * 60)).toFixed(0));
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(0);
  if (seconds < 0) return "Expired";
  else if (seconds < 60) return seconds + " Sec";
  else if (minutes < 60) return minutes + " Min";
  else if (hours < 24) return hours + " Hrs";
  else return days + " Days";
}

export function getRemainingVotes(
  prevRemainingVotes: number,
  votesGiven: number,
  prevVotesGiven: number
) {
  return (
    prevRemainingVotes + Math.pow(prevVotesGiven, 2) - Math.pow(votesGiven, 2)
  );
}

export function activityFormatter(status: number, date: Date, actor: string) {
  if (status === 100) {
    return `${smartTrim(actor, 8)} created this task on ${date.getDate()}  ${
      // @ts-ignore
      monthMap[date.getMonth() as number]
    }`;
  }
}

export const reorder = (
  list: string[],
  startIndex: number,
  endIndex: number
) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export function formatTime(date: Date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  // @ts-ignore
  minutes = ("0" + minutes).slice(-2);
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

export function getFlattenedNetworks(registry: Registry) {
  var networks: Array<Chain> = [];

  for (var networkId of Object.keys(registry)) {
    networks.push({
      name: registry[networkId].name,
      chainId: networkId,
    } as Chain);
  }
  return networks;
}

export function getFlattenedTokens(registry: Registry, chainId: string) {
  var tokens: Array<Token> = [];
  for (var tokenAddress of registry[chainId]?.tokenAddresses) {
    tokens.push({
      address: tokenAddress,
      symbol: registry[chainId].tokens[tokenAddress].symbol,
    });
  }
  return tokens;
}

export function getFlattenedCurrencies(registry: Registry, chainId: string) {
  var currencies = getFlattenedTokens(registry, chainId);
  // @ts-ignore
  // currencies = [...currencies, { symbol: registry[chainId].nativeCurrency }];
  return currencies;
}

export function downloadCSV(content: Array<Array<any>>, filename: string) {
  let csvContent =
    "data:text/csv;charset=utf-8," + content.map((e) => e.join(",")).join("\n");
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link); // Required for FF

  link.click();
}

export function capitalizeFirstLetter(word: string) {
  return word?.charAt(0).toUpperCase() + word?.slice(1);
}

export const uid = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const setCaretToEnd = (element: any) => {
  const range = document.createRange();
  const selection = window.getSelection();
  if (element) {
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
    element.focus();
  }
};

export const getCaretCoordinates = (fromStart = true) => {
  let x, y;
  const isSupported = typeof window.getSelection !== "undefined";
  if (isSupported) {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0).cloneRange();
    var span = document.createElement("span");
    const modal = document.getElementById("cardModal");
    const modalRect = modal?.getClientRects()[0];
    if (span.getClientRects) {
      span.appendChild(document.createTextNode("\u200b"));
      range?.insertNode(span);
      const rect = span.getClientRects()[0];
      if (rect) {
        if (rect.top > 350) {
          // @ts-ignore
          x = rect.left - modalRect.left;
          // @ts-ignore
          y = rect.top + modal?.scrollTop;
        } else {
          // @ts-ignore
          x = rect.left - modalRect.left;
          // @ts-ignore
          y = rect.top + modal?.scrollTop + 100;
        }
      }
      var spanParent = span.parentNode;
      spanParent?.removeChild(span);
    }
  }
  return { x, y };
};

export function isValidHttpUrl(string: string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
