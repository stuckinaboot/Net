import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { WILLIE_NET_CONTRACT } from './constants'

export default function MintButton() {
    const { data: hash, writeContractAsync, status } = useWriteContract()
    const receipt = useWaitForTransactionReceipt({ hash })


    async function mint() {
        const res = await writeContractAsync({
            address: WILLIE_NET_CONTRACT.address as any,
            abi: WILLIE_NET_CONTRACT.abi,
            functionName: 'mintPublic',
            args: [BigInt(1)],
        })
    }

    return <>
        <button onClick={mint}>Mint</button>
        <textarea value={`tx submission: ${status}`} readOnly />
        <textarea value={`tx receipt: ${receipt.status} ${hash}`} readOnly />
    </>
}

