import { useReadContract } from 'wagmi'
import type { Abi, Address } from 'viem'

import {
  DEFAULT_CONTRACT_ADDRESS,
  DEFAULT_CONTRACT_ABI,
} from '@/config/contracts'

interface UseUniversalReadContractParams<T = any> {
  functionName: string
  args?: readonly unknown[]
  address?: Address
  abi?: Abi
  enabled?: boolean
  watch?: boolean
  chainId?: number
}

interface UseUniversalReadContractReturn<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
  isSuccess: boolean
  isFetching: boolean
}

export function useUniversalReadContract<T = any>({
  functionName,
  args = [],
  address = DEFAULT_CONTRACT_ADDRESS,
  abi = DEFAULT_CONTRACT_ABI,
  enabled = true,
  watch = false,
  chainId,
}: UseUniversalReadContractParams<T>): UseUniversalReadContractReturn<T> {
  const { data, isLoading, isError, error, refetch, isSuccess, isFetching } =
    useReadContract({
      address,
      abi,
      functionName,
      args,
      query: {
        enabled,
      },
      watch,
      chainId,
    })

  return {
    data: data as T | undefined,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    isSuccess,
    isFetching,
  }
}
