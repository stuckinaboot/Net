import willienetAbi from '../../assets/abis/willienet.json'

export const testnetsEnabled = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'

export const WILLIE_NET_CONTRACT =
    { address: testnetsEnabled ? '0xcf4c2f64534e9bdf922667abbfe1b5b59f861d8e' : '0xabc', abi: willienetAbi }
