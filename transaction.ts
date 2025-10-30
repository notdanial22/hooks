import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Abi, Address } from 'viem'
import { parseUnits } from 'viem'

interface ApprovalConfig {
  tokenAddress: Address
  tokenAbi: Abi
  spenderAddress: Address
  amount: bigint | string // Can pass bigint directly or string to be parsed
  decimals?: number // Default 18 if amount is string
}

interface TransactionConfig {
  contractAddress: Address
  contractAbi: Abi
  functionName: string
  args?: readonly unknown[]
}

interface UseUniversalTransactionParams {
  approvalConfig?: ApprovalConfig // Optional - if not provided, skips approval
  transactionConfig: TransactionConfig
  onApprovalSuccess?: (hash: string) => void
  onTransactionSuccess?: (hash: string) => void
  onApprovalError?: (error: Error) => void
  onTransactionError?: (error: Error) => void
  onFinalSuccess?: () => void // Called after transaction is confirmed
}

interface TransactionState {
  // Loading states
  isApproving: boolean
  isApprovingConfirming: boolean
  isTransacting: boolean
  isTransactionConfirming: boolean
  isLoading: boolean // Overall loading state

  // Success states
  isApprovalSuccess: boolean
  isTransactionSuccess: boolean
  isComplete: boolean // Both approval and transaction complete

  // Error states
  approvalError: Error | null
  transactionError: Error | null
  approvalConfirmError: Error | null
  transactionConfirmError: Error | null

  // Hashes
  approvalHash: string | null
  transactionHash: string | null

  // Actions
  execute: () => Promise<void>
  reset: () => void
}

export function useUniversalTransaction({
  approvalConfig,
  transactionConfig,
  onApprovalSuccess,
  onTransactionSuccess,
  onApprovalError,
  onTransactionError,
  onFinalSuccess,
}: UseUniversalTransactionParams): TransactionState {
  const [approvalHash, setApprovalHash] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isTransacting, setIsTransacting] = useState(false)
  const [approvalError, setApprovalError] = useState<Error | null>(null)
  const [transactionError, setTransactionError] = useState<Error | null>(null)


  const {
    writeContract: writeApproval,
    data: approvalData,
    error: approvalWriteError,
    reset: resetApproval,
  } = useWriteContract()

  const {
    writeContract: writeTransaction,
    data: transactionData,
    error: transactionWriteError,
    reset: resetTransaction,
  } = useWriteContract()


  const {
    isLoading: isApprovingConfirming,
    isSuccess: isApprovalSuccess,
    error: approvalConfirmError,
  } = useWaitForTransactionReceipt({
    hash: approvalHash as `0x${string}`,
  })

  const {
    isLoading: isTransactionConfirming,
    isSuccess: isTransactionSuccess,
    error: transactionConfirmError,
  } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}`,
  })


  useEffect(() => {
    if (approvalData) {
      setApprovalHash(approvalData)
    }
  }, [approvalData])

  useEffect(() => {
    if (transactionData) {
      setTransactionHash(transactionData)
    }
  }, [transactionData])

  
  useEffect(() => {
    if (approvalWriteError) {
      const error = approvalWriteError as Error
      setApprovalError(error)
      setIsApproving(false)
      onApprovalError?.(error)
    }
  }, [approvalWriteError, onApprovalError])

 
  useEffect(() => {
    if (transactionWriteError) {
      const error = transactionWriteError as Error
      setTransactionError(error)
      setIsTransacting(false)
      onTransactionError?.(error)
    }
  }, [transactionWriteError, onTransactionError])

  
  useEffect(() => {
    if (approvalConfirmError) {
      const error = approvalConfirmError as Error
      setApprovalError(error)
      setIsApproving(false)
      onApprovalError?.(error)
    }
  }, [approvalConfirmError, onApprovalError])


  useEffect(() => {
    if (transactionConfirmError) {
      const error = transactionConfirmError as Error
      setTransactionError(error)
      setIsTransacting(false)
      onTransactionError?.(error)
    }
  }, [transactionConfirmError, onTransactionError])

 
  useEffect(() => {
    if (
      isApprovalSuccess &&
      approvalHash &&
      !isTransacting &&
      !transactionHash
    ) {
      setIsApproving(false)
      onApprovalSuccess?.(approvalHash)
      executeTransaction()
    }
  }, [isApprovalSuccess, approvalHash])

  
  useEffect(() => {
    if (isTransactionSuccess && transactionHash) {
      setIsTransacting(false)
      onTransactionSuccess?.(transactionHash)
      onFinalSuccess?.()
    }
  }, [isTransactionSuccess, transactionHash])

  
  const executeApproval = async () => {
    if (!approvalConfig) return

    setIsApproving(true)
    setApprovalError(null)

    try {
      const {
        tokenAddress,
        tokenAbi,
        spenderAddress,
        amount,
        decimals = 18,
      } = approvalConfig

      
      const approvalAmount =
        typeof amount === 'string' ? parseUnits(amount, decimals) : amount

      writeApproval(
        {
          address: tokenAddress,
          abi: tokenAbi,
          functionName: 'approve',
          args: [spenderAddress, approvalAmount],
        },
        {
          onError: (error) => {
            setApprovalError(error as Error)
            setIsApproving(false)
            onApprovalError?.(error as Error)
          },
        }
      )
    } catch (error) {
      setApprovalError(error as Error)
      setIsApproving(false)
      onApprovalError?.(error as Error)
    }
  }


  const executeTransaction = async () => {
    setIsTransacting(true)
    setTransactionError(null)

    try {
      const {
        contractAddress,
        contractAbi,
        functionName,
        args = [],
      } = transactionConfig

      writeTransaction(
        {
          address: contractAddress,
          abi: contractAbi,
          functionName,
          args,
        },
        {
          onError: (error) => {
            setTransactionError(error as Error)
            setIsTransacting(false)
            onTransactionError?.(error as Error)
          },
        }
      )
    } catch (error) {
      setTransactionError(error as Error)
      setIsTransacting(false)
      onTransactionError?.(error as Error)
    }
  }

  
  const execute = async () => {
    setApprovalHash(null)
    setTransactionHash(null)
    setApprovalError(null)
    setTransactionError(null)
    setIsApproving(false)
    setIsTransacting(false)
    resetApproval()
    resetTransaction()

    
    if (approvalConfig) {
      await executeApproval()
    } else {
      await executeTransaction()
    }
  }

  
  const reset = () => {
    setApprovalHash(null)
    setTransactionHash(null)
    setIsApproving(false)
    setIsTransacting(false)
    setApprovalError(null)
    setTransactionError(null)
    resetApproval()
    resetTransaction()
  }


  const isLoading =
    isApproving ||
    isApprovingConfirming ||
    isTransacting ||
    isTransactionConfirming
  const isComplete =
    (approvalConfig ? isApprovalSuccess : true) && isTransactionSuccess

  return {
  
    isApproving,
    isApprovingConfirming,
    isTransacting,
    isTransactionConfirming,
    isLoading,

   
    isApprovalSuccess,
    isTransactionSuccess,
    isComplete,

   
    approvalError,
    transactionError,
    approvalConfirmError: approvalConfirmError as Error | null,
    transactionConfirmError: transactionConfirmError as Error | null,


    approvalHash,
    transactionHash,


    execute,
    reset,
  }
}