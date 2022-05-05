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

export const registryTemp: Registry = {
  '1': {
    name: 'ethereum',
    mainnet: true,
    chainId: '1',
    nativeCurrency: 'ETHER',
    tokenAddresses: [],
    tokens: {},
    pictureUrl:
      'https://ipfs.moralis.io:2053/ipfs/QmXaeURdHVszjDuGCwM7DauTjaASfm8qBZYzETM5ehq7MD',
  },
  '4': {
    name: 'rinkeby',
    mainnet: false,
    chainId: '4',
    nativeCurrency: 'ETHER',
    tokenAddresses: ['0xc778417E063141139Fce010982780140Aa0cD5Ab'],
    tokens: {
      '0xc778417E063141139Fce010982780140Aa0cD5Ab': {
        address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        name: 'Wrapped Ethereum',
        symbol: 'WETH',
        pictureUrl:
          'https://ipfs.moralis.io:2053/ipfs/QmXaeURdHVszjDuGCwM7DauTjaASfm8qBZYzETM5ehq7MD',
      },
    },
    distributorAddress: '0xD620b76e0dE2A776449E2969Bf8B725ECDA5b66e',
    pictureUrl:
      'https://ipfs.moralis.io:2053/ipfs/QmXaeURdHVszjDuGCwM7DauTjaASfm8qBZYzETM5ehq7MD',
  },
  '137': {
    name: 'polygon',
    mainnet: true,
    chainId: '137',
    nativeCurrency: 'MATIC',
    tokenAddresses: ['0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'],
    tokens: {
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270': {
        address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        name: 'Wrapped Matic',
        symbol: 'WMATIC',
        pictureUrl:
          'https://ipfs.moralis.io:2053/ipfs/QmRNqgazYuxUa5WdddFPftTWiP3KwzBMgV9Z19QWnLMETc',
      },
    },
    distributorAddress: '0x54904743F2A0d0BCC228e334bF52d4b578901cfB',
    pictureUrl:
      'https://ipfs.moralis.io:2053/ipfs/QmRNqgazYuxUa5WdddFPftTWiP3KwzBMgV9Z19QWnLMETc',
  },
  '43113': {
    name: 'fuji',
    mainnet: false,
    chainId: '43113',
    nativeCurrency: 'AVAX',
    tokenAddresses: [
      '0x08a978a0399465621e667C49CD54CC874DC064Eb',
      '0xf672c3cDD3C143C05Aada34f50d4ad519558994F',
    ],
    tokens: {
      '0x08a978a0399465621e667C49CD54CC874DC064Eb': {
        address: '0x08a978a0399465621e667C49CD54CC874DC064Eb',
        name: 'Avalanche Tether',
        symbol: 'ausdt',
        pictureUrl:
          'https://ipfs.moralis.io:2053/ipfs/QmdUshyLUMRgwy6Wirj6r3dwQsUddmrG2tVVfPXN8XfCjd',
      },
      '0xf672c3cDD3C143C05Aada34f50d4ad519558994F': {
        address: '0xf672c3cDD3C143C05Aada34f50d4ad519558994F',
        name: 'Avalanche Chainlink Token',
        symbol: 'alink',
        pictureUrl:
          'https://ipfs.moralis.io:2053/ipfs/QmUdtBEt4zaex8NYA5St9iSdnq6JKtJw2ArHpyr49W4XuL',
      },
    },
    distributorAddress: '0xD620b76e0dE2A776449E2969Bf8B725ECDA5b66e',
    pictureUrl:
      'https://ipfs.moralis.io:2053/ipfs/QmRALA5qvQBRwWre8ofuhCbr3wxVmPS3kGetRR9uJqbqqe',
  },
  '43114': {
    name: 'avalanche',
    mainnet: true,
    chainId: '43114',
    nativeCurrency: 'AVAX',
    tokenAddresses: [],
    tokens: {},
    distributorAddress: '0xD620b76e0dE2A776449E2969Bf8B725ECDA5b66e',
    pictureUrl:
      'https://ipfs.moralis.io:2053/ipfs/QmRALA5qvQBRwWre8ofuhCbr3wxVmPS3kGetRR9uJqbqqe',
  },
  '80001': {
    name: 'mumbai',
    mainnet: false,
    chainId: '80001',
    nativeCurrency: 'MATIC',
    tokenAddresses: [
      '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
      '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
      '0xBCbfC29df3e0044c4D755423aD00d9B49fE2E62c',
    ],
    tokens: {
      '0x9c3c9283d3e44854697cd22d3faa240cfb032889': {
        address: '0x9c3c9283d3e44854697cd22d3faa240cfb032889',
        name: 'Wrapped Matic',
        symbol: 'WMATIC',
        pictureUrl:
          'https://ipfs.moralis.io:2053/ipfs/QmRNqgazYuxUa5WdddFPftTWiP3KwzBMgV9Z19QWnLMETc',
      },
      '0x326C977E6efc84E512bB9C30f76E30c160eD06FB': {
        address: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',
        name: 'Chainlink Token',
        symbol: 'LINK',
        pictureUrl:
          'https://ipfs.moralis.io:2053/ipfs/QmUdtBEt4zaex8NYA5St9iSdnq6JKtJw2ArHpyr49W4XuL',
      },
      '0xBCbfC29df3e0044c4D755423aD00d9B49fE2E62c': {
        address: '0xBCbfC29df3e0044c4D755423aD00d9B49fE2E62c',
        name: 'Demo Spect',
        symbol: 'DSpect',
        pictureUrl: '',
      },
    },
    distributorAddress: '0x05588517bC463f607Dca0E09d1f73CDaa30cfF10',
    pictureUrl:
      'https://ipfs.moralis.io:2053/ipfs/QmRNqgazYuxUa5WdddFPftTWiP3KwzBMgV9Z19QWnLMETc',
  },
};

export const tribesLogo =
  'https://ipfs.moralis.io:2053/ipfs/QmRnbkmvYthsi6bXpZ5j14yZyfuxgVD3SaokXNRrBRsyQw';

export const roleMapping: { [key: number]: string } = {
  1: 'Member',
  2: 'Contributor',
  3: 'Steward',
};
