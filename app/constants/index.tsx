import { Registry } from "../types";

export const initialData = {
  tasks: {
    "task-0": {
      id: "task-0",
      title: "Take out the garbage",
      deadline: "10 feb",
      description: "Description",
      tags: ["gig"],
      assignee: "chaks.eth",
      reviewer: "0xavp.eth",
      reward: {
        chain: "polygon",
        value: 1000,
        token: "USDC",
      },
      activity: [
        {
          userAddress: "0x6304CE63F2EBf8C0Cc76b60d34Cc52a84aBB6057",
          timestamp: Date,
          title: "0xavp created this Task",
        },
      ],
    },
    "task-1": {
      id: "task-1",
      title: "Watch my favorite show",
      value: 100,
      deadline: "15 feb",
    },
    "task-2": {
      id: "task-2",
      title: "Charge my phone",
      value: 30,
      deadline: "25 feb",
    },
    "task-3": {
      id: "task-3",
      title: "Cook dinner",
      value: 35,
      deadline: "3 mar",
    },
    "task-4": {
      id: "task-4",
      title: "Cook lunch",
      value: 10,
      deadline: "23 jan",
    },
    "task-5": {
      id: "task-5",
      title: "Fix issue 34",
      value: 65,
      deadline: "23 feb",
    },
    "task-6": {
      id: "task-6",
      title: "Get shipment",
      value: 110,
      deadline: "13 feb",
    },
    "task-7": {
      id: "task-7",
      title: "Create header",
      value: 20,
      deadline: "14 feb",
    },
    "task-8": {
      id: "task-8",
      title: "Fix issue 44",
      value: 50,
      deadline: "18 feb",
    },
    "task-9": {
      id: "task-9",
      title: "Github integration",
      value: 70,
      deadline: "1 mar",
    },
  },
  columns: {
    "column-0": {
      id: "column-0",
      title: "To do",
      taskIds: ["task-0", "task-1"],
    },
    "column-1": {
      id: "column-1",
      title: "Doing",
      taskIds: [
        "task-2",
        "task-3",
        "task-4",
        "task-6",
        "task-7",
        "task-8",
        "task-9",
      ],
    },
    "column-2": {
      id: "column-2",
      title: "Done",
      taskIds: ["task-5"],
    },
  },
  columnOrder: ["column-0", "column-1", "column-2"],
};

export const monthMap = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "June",
  6: "July",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec",
};

export const actionMap = {
  100: "opened task",
  105: "assigned task",
  200: "submitted work",
  205: "closed task",
  300: "paid contributor",
};

export const statusMapping = {
  100: "Open",
  102: "Assigned",
  105: "In progress",
  200: "In review",
  205: "Closed",
  300: "Paid",
};

export const reverseStatusMapping = {
  Open: 100,
  "In progress": 105,
  "In review": 200,
  Closed: 205,
  Paid: 300,
  Archived: 400,
};

export const currentStatusToFutureValidStatus = {
  100: ["Open"],
  102: ["In progress", "Open"],
  105: ["In progress", "Open", "Assigned", "In review"],
  200: ["In review", "In progress"],
  205: ["Closed"],
  400: ["Archived"],
};

export const statusColorMapping = {
  100: "#eaeaea",
  102: "#99ccff",
  105: "#0061ff",
  200: "#2e5da9",
  205: "#5fe086",
  300: "#5fe086",
  400: "red",
};

export const amountData = {
  Polygon: {
    Matic: [
      ["chaks.eth", "0xavp.eth"],
      [10, 5],
    ],
    USDC: [
      ["contributorAddress", "contributorAddress2"],
      [10, 5],
    ],
  },
  Ethereum: {
    Weth: [
      ["contributorAddress", "contributorAddress2"],
      [10, 5],
    ],
  },
};

export const labelsMapping = {
  Design: "#2e5da9",
  Coding: "#f06292",
  Testing: "#ffc107",
  Deployment: "#ff9800",
  Documentation: "#ff5722",
  POC: "#66bb6a",
};

export const registryTemp: Registry = {
  "1": {
    name: "ethereum",
    mainnet: true,
    chainId: "1",
    nativeCurrency: "ETHER",
    tokenAddresses: [],
    tokens: {},
    pictureUrl:
      "https://ipfs.moralis.io:2053/ipfs/QmXaeURdHVszjDuGCwM7DauTjaASfm8qBZYzETM5ehq7MD",
  },
  "4": {
    name: "rinkeby",
    mainnet: false,
    chainId: "4",
    nativeCurrency: "ETHER",
    tokenAddresses: ["0xc778417E063141139Fce010982780140Aa0cD5Ab"],
    tokens: {
      "0xc778417E063141139Fce010982780140Aa0cD5Ab": {
        address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
        name: "Wrapped Ethereum",
        symbol: "WETH",
        pictureUrl:
          "https://ipfs.moralis.io:2053/ipfs/QmXaeURdHVszjDuGCwM7DauTjaASfm8qBZYzETM5ehq7MD",
      },
    },
    distributorAddress: "0xD620b76e0dE2A776449E2969Bf8B725ECDA5b66e",
    pictureUrl:
      "https://ipfs.moralis.io:2053/ipfs/QmXaeURdHVszjDuGCwM7DauTjaASfm8qBZYzETM5ehq7MD",
  },
  "137": {
    name: "polygon",
    mainnet: true,
    chainId: "137",
    nativeCurrency: "MATIC",
    tokenAddresses: ["0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"],
    tokens: {
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270": {
        address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        name: "Wrapped Matic",
        symbol: "WMATIC",
        pictureUrl:
          "https://ipfs.moralis.io:2053/ipfs/QmRNqgazYuxUa5WdddFPftTWiP3KwzBMgV9Z19QWnLMETc",
      },
    },
    distributorAddress: "0x54904743F2A0d0BCC228e334bF52d4b578901cfB",
    pictureUrl:
      "https://ipfs.moralis.io:2053/ipfs/QmRNqgazYuxUa5WdddFPftTWiP3KwzBMgV9Z19QWnLMETc",
  },
  "43113": {
    name: "fuji",
    mainnet: false,
    chainId: "43113",
    nativeCurrency: "AVAX",
    tokenAddresses: [
      "0x08a978a0399465621e667C49CD54CC874DC064Eb",
      "0xf672c3cDD3C143C05Aada34f50d4ad519558994F",
    ],
    tokens: {
      "0x08a978a0399465621e667C49CD54CC874DC064Eb": {
        address: "0x08a978a0399465621e667C49CD54CC874DC064Eb",
        name: "Avalanche Tether",
        symbol: "ausdt",
        pictureUrl:
          "https://ipfs.moralis.io:2053/ipfs/QmdUshyLUMRgwy6Wirj6r3dwQsUddmrG2tVVfPXN8XfCjd",
      },
      "0xf672c3cDD3C143C05Aada34f50d4ad519558994F": {
        address: "0xf672c3cDD3C143C05Aada34f50d4ad519558994F",
        name: "Avalanche Chainlink Token",
        symbol: "alink",
        pictureUrl:
          "https://ipfs.moralis.io:2053/ipfs/QmUdtBEt4zaex8NYA5St9iSdnq6JKtJw2ArHpyr49W4XuL",
      },
    },
    distributorAddress: "0xD620b76e0dE2A776449E2969Bf8B725ECDA5b66e",
    pictureUrl:
      "https://ipfs.moralis.io:2053/ipfs/QmRALA5qvQBRwWre8ofuhCbr3wxVmPS3kGetRR9uJqbqqe",
  },
  "43114": {
    name: "avalanche",
    mainnet: true,
    chainId: "43114",
    nativeCurrency: "AVAX",
    tokenAddresses: [],
    tokens: {},
    distributorAddress: "0xD620b76e0dE2A776449E2969Bf8B725ECDA5b66e",
    pictureUrl:
      "https://ipfs.moralis.io:2053/ipfs/QmRALA5qvQBRwWre8ofuhCbr3wxVmPS3kGetRR9uJqbqqe",
  },
  "80001": {
    name: "mumbai",
    mainnet: false,
    chainId: "80001",
    nativeCurrency: "MATIC",
    tokenAddresses: [
      "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
      "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      "0xBCbfC29df3e0044c4D755423aD00d9B49fE2E62c",
    ],
    tokens: {
      "0x9c3c9283d3e44854697cd22d3faa240cfb032889": {
        address: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
        name: "Wrapped Matic",
        symbol: "WMATIC",
        pictureUrl:
          "https://ipfs.moralis.io:2053/ipfs/QmRNqgazYuxUa5WdddFPftTWiP3KwzBMgV9Z19QWnLMETc",
      },
      "0x326C977E6efc84E512bB9C30f76E30c160eD06FB": {
        address: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        name: "Chainlink Token",
        symbol: "LINK",
        pictureUrl:
          "https://ipfs.moralis.io:2053/ipfs/QmUdtBEt4zaex8NYA5St9iSdnq6JKtJw2ArHpyr49W4XuL",
      },
      "0xBCbfC29df3e0044c4D755423aD00d9B49fE2E62c": {
        address: "0xBCbfC29df3e0044c4D755423aD00d9B49fE2E62c",
        name: "Demo Spect",
        symbol: "DSpect",
        pictureUrl: "",
      },
    },
    distributorAddress: "0x05588517bC463f607Dca0E09d1f73CDaa30cfF10",
    pictureUrl:
      "https://ipfs.moralis.io:2053/ipfs/QmRNqgazYuxUa5WdddFPftTWiP3KwzBMgV9Z19QWnLMETc",
  },
};

export const tribesLogo =
  "https://ipfs.moralis.io:2053/ipfs/QmRnbkmvYthsi6bXpZ5j14yZyfuxgVD3SaokXNRrBRsyQw";

export const roleMapping: { [key: number]: string } = {
  1: "Member",
  2: "Contributor",
  3: "Steward",
};
