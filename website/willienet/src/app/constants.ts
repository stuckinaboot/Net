import willienetAbi from "../../assets/abis/willienet.json";

export const testnetsEnabled =
  process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true";

export const WILLIE_NET_CONTRACT = {
  address: testnetsEnabled
    ? "0x54253c5d34a8bd64a7882572cac83c3cc1422704"
    : "0xabc",
  abi: willienetAbi,
};
