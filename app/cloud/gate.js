async function canOpenGate(gate, userId) {}

const gate = {
  or: [
    {
      and: [
        {
          chainId: "80001",
          contractType: "erc721",
          contractAddress: "...",
          lowerLimit: 1,
        },
        {
          chainId: "80001",
          contractType: "erc20",
          contractAddress: "...",
          lowerLimit: 10,
        },
      ],
    },
    {
      and: [
        {
          chainId: "80001",
          contractType: "erc721",
          contractAddress: "...",
          lowerLimit: 1,
        },
        {
          chainId: "80001",
          contractType: "erc20",
          contractAddress: "...",
          lowerLimit: 10,
        },
      ],
    },
  ],
};
