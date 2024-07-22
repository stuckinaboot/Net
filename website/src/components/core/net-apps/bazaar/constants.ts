import abi from "../../../../../assets/abis/apps/bazaarv1.json";

export const BAZAAR_CONTRACT = {
  abi,
  address: "0x0000C922D4449156d34A6FbAE6fea1C55c7b6749",
};

export const BAZAAR_SUBMISSION_ABI = [
  {
    name: "submission",
    type: "tuple",
    internalType: "struct BazaarV1.Submission",
    components: [
      {
        name: "parameters",
        type: "tuple",
        internalType: "struct OrderParameters",
        components: [
          {
            name: "offerer",
            type: "address",
            internalType: "address",
          },
          {
            name: "zone",
            type: "address",
            internalType: "address",
          },
          {
            name: "offer",
            type: "tuple[]",
            internalType: "struct OfferItem[]",
            components: [
              {
                name: "itemType",
                type: "uint8",
                internalType: "enum ItemType",
              },
              {
                name: "token",
                type: "address",
                internalType: "address",
              },
              {
                name: "identifierOrCriteria",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "startAmount",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "endAmount",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "consideration",
            type: "tuple[]",
            internalType: "struct ConsiderationItem[]",
            components: [
              {
                name: "itemType",
                type: "uint8",
                internalType: "enum ItemType",
              },
              {
                name: "token",
                type: "address",
                internalType: "address",
              },
              {
                name: "identifierOrCriteria",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "startAmount",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "endAmount",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "recipient",
                type: "address",
                internalType: "address payable",
              },
            ],
          },
          {
            name: "orderType",
            type: "uint8",
            internalType: "enum OrderType",
          },
          {
            name: "startTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "endTime",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "zoneHash",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "salt",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "conduitKey",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "totalOriginalConsiderationItems",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      { name: "counter", type: "uint256", internalType: "uint256" },
      { name: "signature", type: "bytes", internalType: "bytes" },
    ],
  },
];

export const ERC721_TOKEN_URI_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];
