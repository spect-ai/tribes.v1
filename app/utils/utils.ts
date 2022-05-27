/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-restricted-syntax */
import { ethers } from 'ethers';
import { monthMap } from '../constants';
import { Registry, Chain, Token, MemberDetails } from '../types';

export const smartTrim = (string: string, maxLength: number) => {
  if (!string) {
    return '';
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
    return '';
  }
  if (maxLength < 1) return string;
  if (string.length <= maxLength) return string;
  if (maxLength === 1) return `${string.substring(0, 1)}...`;

  return `${string.substring(0, maxLength)}...`;
};

function msToTime(ms: number) {
  const seconds = parseInt((ms / 1000).toFixed(0), 10);
  const minutes = parseInt((ms / (1000 * 60)).toFixed(0), 10);
  const hours = parseInt((ms / (1000 * 60 * 60)).toFixed(0), 10);
  const days = (ms / (1000 * 60 * 60 * 24)).toFixed(0);
  if (seconds < 0) return 'Expired';
  if (seconds < 60) return `${seconds} sec`;
  if (minutes < 60) return `${minutes}${minutes === 1 ? ' min' : ' mins'}`;
  if (hours < 24) return `${hours}${hours > 1 ? ' hours' : ' hour'}`;
  return `${days} Days`;
}

export function formatTimeLeft(date: Date) {
  const deadline = new Date(date);
  const now = Date.now();
  return msToTime(deadline.getTime() - now);
}

export function formatTimeCreated(date: Date) {
  const now = Date.now();
  return msToTime(now - new Date(date).getTime());
}

export function getRemainingVotes(
  prevRemainingVotes: number,
  votesGiven: number,
  prevVotesGiven: number
) {
  return prevRemainingVotes + prevVotesGiven ** 2 - votesGiven ** 2;
}

export function activityFormatter(status: number, date: Date, actor: string) {
  if (status === 100) {
    return `${smartTrim(actor, 8)} created this task on ${date.getDate()}  ${
      // @ts-ignore
      monthMap[date.getMonth() as number]
    }`;
  }
  return null;
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
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours %= 12;
  hours = hours || 12; // the hour '0' should be '12'
  // @ts-ignore
  minutes = `0${minutes}`.slice(-2);
  const strTime = `${hours}:${minutes} ${ampm}`;
  return strTime;
}

export function getFlattenedNetworks(registry: Registry) {
  const networks: Array<Chain> = [];

  for (const networkId of Object.keys(registry)) {
    networks.push({
      name: registry[networkId].name,
      chainId: networkId,
    } as Chain);
  }
  return networks;
}

export function getFlattenedTokens(registry: Registry, chainId: string) {
  const tokens: Array<Token> = [];
  if (registry[chainId]?.tokenAddresses) {
    for (const tokenAddress of registry[chainId].tokenAddresses) {
      tokens.push({
        address: tokenAddress,
        symbol: registry[chainId].tokens[tokenAddress].symbol,
      });
    }
  }
  return tokens;
}

export function getFlattenedCurrencies(registry: Registry, chainId: string) {
  const currencies = getFlattenedTokens(registry, chainId);
  // @ts-ignore
  // currencies = [...currencies, { symbol: registry[chainId].nativeCurrency }];
  return currencies;
}

export function downloadCSV(content: Array<Array<any>>, filename: string) {
  const csvContent = `data:text/csv;charset=utf-8,${content
    .map((e) => e.join(','))
    .join('\n')}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link); // Required for FF

  link.click();
}

export function capitalizeFirstLetter(word: string) {
  if (!word) {
    return '';
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
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

export const getSelection = (element: any) => {
  let selectionStart;
  let selectionEnd;
  const isSupported = typeof window.getSelection !== 'undefined';
  if (isSupported) {
    const range = window.getSelection()?.getRangeAt(0);
    if (range) {
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(element);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      selectionStart = preSelectionRange.toString().length;
      selectionEnd = selectionStart + range.toString().length;
    }
  }
  return { selectionStart, selectionEnd };
};

export const getCaretCoordinates = (fromStart = true) => {
  let x;
  let y;
  const isSupported = typeof window.getSelection !== 'undefined';
  if (isSupported) {
    const selection = window.getSelection();
    if (selection?.rangeCount !== 0) {
      const range = selection?.getRangeAt(0).cloneRange();
      range?.collapse(!!fromStart);
      const rect = range?.getClientRects()[0];
      if (rect) {
        x = rect.left;
        y = rect.top;
      }
    }
  }
  return { x, y };
};

export const getCaretCoordinatesForCommand = (fromStart = true) => {
  let x;
  let y;
  const isSupported = typeof window.getSelection !== 'undefined';
  if (isSupported) {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0).cloneRange();
    const span = document.createElement('span');
    const modal = document.getElementById('cardModal');
    const modalRect = modal?.getClientRects()[0];
    if (span.getClientRects) {
      span.appendChild(document.createTextNode('\u200b'));
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
      const spanParent = span.parentNode;
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

  return url.protocol === 'http:' || url.protocol === 'https:';
}

export function delay(delayInms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
}

function nextNode(node: any) {
  if (node.hasChildNodes()) {
    return node.firstChild;
  }
  while (node && !node.nextSibling) {
    // eslint-disable-next-line no-param-reassign
    node = node.parentNode;
  }
  if (!node) {
    return null;
  }
  return node.nextSibling;
}

function getRangeSelectedNodes(range: any) {
  let node = range.startContainer;
  const endNode = range.endContainer;

  // Special case for a range that is contained within a single node
  if (node === endNode) {
    return [node];
  }

  // Iterate nodes until we hit the end container
  const rangeNodes = [];
  while (node && node !== endNode) {
    rangeNodes.push((node = nextNode(node)));
  }

  // Add partially selected nodes at the start of the range
  node = range.startContainer;
  while (node && node !== range.commonAncestorContainer) {
    rangeNodes.unshift(node);
    node = node.parentNode;
  }

  return rangeNodes;
}

export function getSelectedNodes() {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (!sel?.isCollapsed) {
      return getRangeSelectedNodes(sel?.getRangeAt(0));
    }
  }
  return [];
}

export function getDateDisplay(date: string) {
  const dateObj = new Date(date);
  return `${dateObj?.getDate()} ${
    monthMap[dateObj?.getMonth() as keyof typeof monthMap]
  } ${formatTime(dateObj)}`;
}

export function isEqualArrayWithStrictLocationsAndEqualCount(
  a: Array<string | number>,
  b: Array<string | number>
) {
  if (!a && !b) return true;
  if ((!a && b) || (a && !b)) return false;
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
export function isEqualArrayIgnoringLocations(
  a: Array<string | number>,
  b: Array<string | number>
) {
  if (!a && !b) return true;
  if ((!a && b) || (a && !b)) return false;
  return (
    a.length === b.length &&
    a.every((value, index) => b.find((element) => element === value))
  );
}

export function findDiffBetweenArrays(
  a: Array<string | number>,
  b: Array<string | number>
) {
  let removed: any = [];
  let added: any = [];
  if (a && b) {
    removed = a.filter((x) => !b.includes(x));
    added = b.filter((x) => !a.includes(x));
  }
  if (a && !b) removed = a;
  if (!a && b) added = b;
  return [added, removed];
}

export function isEthAddress(addr: string) {
  return ethers.utils.isAddress(addr);
}

export function getEthAddresses(
  contributors: string[],
  memberDetails: MemberDetails
) {
  return contributors.map((a: string) => memberDetails[a].ethAddress);
}

// eslint-disable-next-line consistent-return
export function dateDiffInMinutes(d1: Date | null, d2: Date | null) {
  if (!d1 && !d2) return 0;
  if (d1 && !d2) return Math.floor(d1.getTime() / (60 * 1000));
  if (d2 && !d1) return Math.floor(d2.getTime() / (60 * 1000));
  if (d2 && d1) return Math.floor((d1.getTime() - d2.getTime()) / (60 * 1000));
}
