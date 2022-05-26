import { Registry } from '../types';

export const monthMap = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec',
};

export const actionMap = {
  100: 'opened task',
  105: 'assigned task',
  200: 'submitted work',
  205: 'closed task',
  300: 'paid contributor',
};

export const statusMapping = {
  100: 'Open',
  102: 'Assigned',
  105: 'In progress',
  200: 'In review',
  205: 'Closed',
  300: 'Paid',
};

export const reverseStatusMapping = {
  Open: 100,
  'In progress': 105,
  'In review': 200,
  Closed: 205,
  Paid: 300,
  Archived: 400,
};

export const currentStatusToFutureValidStatus = {
  100: ['Open'],
  102: ['In progress', 'Open'],
  105: ['In progress', 'Open', 'Assigned', 'In review'],
  200: ['In review', 'In progress'],
  205: ['Closed'],
  400: ['Archived'],
};

export const statusColorMapping = {
  100: '#eaeaea',
  102: '#99ccff',
  105: '#0061ff',
  200: '#2e5da9',
  205: '#5fe086',
  300: '#5fe086',
  400: 'red',
};

export const amountData = {
  Polygon: {
    Matic: [
      ['chaks.eth', '0xavp.eth'],
      [10, 5],
    ],
    USDC: [
      ['contributorAddress', 'contributorAddress2'],
      [10, 5],
    ],
  },
  Ethereum: {
    Weth: [
      ['contributorAddress', 'contributorAddress2'],
      [10, 5],
    ],
  },
};

export const labelsMapping = {
  Design: 'rgb(46, 93, 170, 0.4)',
  Coding: 'rgb(240, 98, 146, 0.4)',
  Quality: 'rgb(255, 193, 7, 0.4)',
  Github: 'rgb(255, 152, 0, 0.4)',
  POC: 'rgb(102, 187, 106, 0.4)',
  Bug: 'rgb(255,0,0,0.4)',
  Idea: 'rgb(190, 234, 134,0.4)',
  Feature: 'rgb(71, 69, 179,0.4)',
  Enhancement: 'rgb(8, 213, 215,0.4)',
  Integration: 'rgb(255, 255, 255,0.4)',
  Marketing: 'rgb(116, 166, 214,0.4)',
  Documentation: 'rgb(255, 255, 155,0.4)',
  Deployment: 'rgb(192, 31, 98,0.4)',
  Testing: 'rgb(254, 254, 254,0.4)',
};

export const taskStatusBorderMapping: {
  [key: number]: string;
} = {
  300: 'rgb(95, 224, 134, 0.6)',
};

export const tribesLogo =
  'https://ipfs.moralis.io:2053/ipfs/QmRnbkmvYthsi6bXpZ5j14yZyfuxgVD3SaokXNRrBRsyQw';

export const roleMapping: { [key: number]: string } = {
  1: 'Member',
  2: 'Contributor',
  3: 'Steward',
};
