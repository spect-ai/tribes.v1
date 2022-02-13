import MD5 from "crypto-js/md5";
import { chainTokenRegistry } from "../constants";

export const smartTrim = (string: string, maxLength: number) => {
  if (!string) {
    return;
  }
  if (maxLength < 1) return string;
  if (string.length <= maxLength) return string;
  if (maxLength === 1) return `${string.substring(0, 1)}...`;

  const midpoint = Math.ceil(string.length / 2 + 1);
  const toremove = string.length - maxLength;
  const lstrip = Math.ceil(toremove / 2);
  const rstrip = toremove - lstrip;
  return `${string.substring(0, midpoint - lstrip)}...${string.substring(midpoint + rstrip)}`;
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

export function getRemainingVotes(prevRemainingVotes: number, votesGiven: number, prevVotesGiven: number) {
  return prevRemainingVotes + Math.pow(prevVotesGiven, 2) - Math.pow(votesGiven, 2);
}

export function getMD5String(string: string) {
  return MD5(string).toString();
}

export function getTokenOptions(chain: any) {
  var tokenOptions =
    chain === "Ethereum"
      ? Object.keys(chainTokenRegistry["Ethereum"])
      : chain === "Polygon"
      ? Object.keys(chainTokenRegistry["Polygon"])
      : [];
  return tokenOptions;
}
