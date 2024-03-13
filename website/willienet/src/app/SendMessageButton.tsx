import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { WILLIE_NET_CONTRACT } from './constants'

export default function SendMessageButton(props: { tokenId: number, message: string, topic: string }) {
    const { data: hash, writeContractAsync, status } = useWriteContract()
    const receipt = useWaitForTransactionReceipt({ hash })


    async function performTransaction() {
        await writeContractAsync({
            address: WILLIE_NET_CONTRACT.address as any,
            abi: WILLIE_NET_CONTRACT.abi,
            functionName: 'sendMessage',
            args: [BigInt(props.tokenId), '0x0000000000000000000000000000000000000000000000000000000000000000', props.message, props.topic],
        })
    }

    return <>
        <button onClick={performTransaction}>Send message</button>
        <textarea value={`message: ${props.message}`} readOnly />
        <textarea value={`tx submission: ${status}`} readOnly />
        <textarea value={`tx receipt: ${receipt.status} ${hash}`} readOnly />
    </>
}


