# Universal Web3 Hooks

A collection of reusable hooks for blockchain interactions in React and Next.js applications.

## 📋 Table of Contents

- [useUniversalReadContract](#useuniversalreadcontract)
- [useUniversalTransaction](#useuniversaltransaction)

---

## useUniversalReadContract

**File:** `read.ts`

### Purpose
Read data from smart contracts with type safety and automatic refetching.

### Features
- ✅ Default contract address/ABI (configurable)
- ✅ Type-safe return data with generics
- ✅ Conditional fetching with `enabled`
- ✅ Real-time updates with `watch`
- ✅ Manual refetch support
- ✅ Multiple instances with different params

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `functionName` | `string` | ✅ Yes | - | Contract function name |
| `args` | `unknown[]` | No | `[]` | Function arguments |
| `address` | `Address` | No | Default contract | Contract address |
| `abi` | `Abi` | No | Default ABI | Contract ABI |
| `enabled` | `boolean` | No | `true` | Enable/disable fetching |
| `watch` | `boolean` | No | `false` | Auto-refetch on chain updates |
| `chainId` | `number` | No | - | Specific chain ID |

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T \| undefined` | Returned data (type-safe) |
| `isLoading` | `boolean` | Initial loading state |
| `isFetching` | `boolean` | Fetching/refetching state |
| `isError` | `boolean` | Error occurred |
| `error` | `Error \| null` | Error object |
| `isSuccess` | `boolean` | Fetch successful |
| `refetch` | `function` | Manually trigger refetch |

### Usage Examples

#### Basic Usage (Default Contract)

```typescript
const { data, isLoading } = useUniversalReadContract<UserDashboard>({
  functionName: 'getUserDashboard',
  args: [userAddress],
})
```

#### Custom Contract

```typescript
const { data } = useUniversalReadContract<bigint>({
  functionName: 'balanceOf',
  args: [userAddress],
  address: '0x123...' as Address,
  abi: CUSTOM_ABI,
})
```

#### No Arguments

```typescript
const { data: totalSupply } = useUniversalReadContract<bigint>({
  functionName: 'totalSupply',
})
```

#### Conditional Fetching

```typescript
const { data } = useUniversalReadContract<string>({
  functionName: 'getUsername',
  args: [userId],
  enabled: !!userId, // Only fetch when userId exists
})
```

#### Real-time Updates

```typescript
const { data: livePrice } = useUniversalReadContract<bigint>({
  functionName: 'getCurrentPrice',
  watch: true, // Auto-refetch when chain state changes
})
```

#### Manual Refetch

```typescript
const { data, refetch } = useUniversalReadContract<UserData>({
  functionName: 'getUserData',
  args: [userAddress],
})

// Later in your code
<button onClick={() => refetch()}>Refresh Data</button>
```

#### Multiple Instances

```typescript
function MyComponent() {
  const userDashboard = useUniversalReadContract<UserDashboard>({
    functionName: 'getUserDashboard',
    args: [userAddress],
  })

  const adminDashboard = useUniversalReadContract<AdminDashboard>({
    functionName: 'getAdminDashboard',
    args: [adminAddress],
    address: ADMIN_CONTRACT_ADDRESS,
    abi: ADMIN_ABI,
  })

  const totalUsers = useUniversalReadContract<bigint>({
    functionName: 'getTotalUsers',
  })

  return (
    <div>
      {userDashboard.isLoading ? (
        <p>Loading...</p>
      ) : (
        <p>User: {userDashboard.data?.name}</p>
      )}
    </div>
  )
}
```

---

## useUniversalTransaction

**File:** `transaction.ts`

### Purpose
Handle token approval + contract transactions with automatic flow management.

### Features
- ✅ Automatic approval → transaction flow
- ✅ Optional approval (can skip for direct transactions)
- ✅ Handles string amounts and bigint
- ✅ Complete error handling
- ✅ Auto-reset on execute
- ✅ Transaction hash tracking
- ✅ Loading states for each step

### Flow Logic

1. **With Approval:**
   - Execute → Approve → Wait → Transaction → Done
   - If approval fails → Stop (transaction never runs)

2. **Without Approval:**
   - Execute → Transaction → Done

3. **On Error:**
   - Process stops immediately
   - Error state available
   - Re-executing starts fresh

### Parameters

#### `approvalConfig` (Optional)

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `tokenAddress` | `Address` | ✅ Yes | - | Token contract address |
| `tokenAbi` | `Abi` | ✅ Yes | - | Token ABI |
| `spenderAddress` | `Address` | ✅ Yes | - | Who can spend (usually your contract) |
| `amount` | `bigint \| string` | ✅ Yes | - | Amount to approve |
| `decimals` | `number` | No | `18` | Decimals if amount is string |

#### `transactionConfig` (Required)

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `contractAddress` | `Address` | ✅ Yes | - | Contract to call |
| `contractAbi` | `Abi` | ✅ Yes | - | Contract ABI |
| `functionName` | `string` | ✅ Yes | - | Function to call |
| `args` | `unknown[]` | No | `[]` | Function arguments |

#### Callbacks (All Optional)

| Callback | Parameters | Description |
|----------|------------|-------------|
| `onApprovalSuccess` | `(hash: string)` | Called when approval confirmed |
| `onTransactionSuccess` | `(hash: string)` | Called when transaction confirmed |
| `onApprovalError` | `(error: Error)` | Called on approval error |
| `onTransactionError` | `(error: Error)` | Called on transaction error |
| `onFinalSuccess` | `()` | Called after everything completes |

### Return Values

#### Loading States

| Property | Type | Description |
|----------|------|-------------|
| `isApproving` | `boolean` | Approval transaction pending |
| `isApprovingConfirming` | `boolean` | Waiting for approval confirmation |
| `isTransacting` | `boolean` | Main transaction pending |
| `isTransactionConfirming` | `boolean` | Waiting for transaction confirmation |
| `isLoading` | `boolean` | Any step is loading |

#### Success States

| Property | Type | Description |
|----------|------|-------------|
| `isApprovalSuccess` | `boolean` | Approval confirmed |
| `isTransactionSuccess` | `boolean` | Transaction confirmed |
| `isComplete` | `boolean` | Entire flow complete |

#### Error States

| Property | Type | Description |
|----------|------|-------------|
| `approvalError` | `Error \| null` | Approval write error |
| `transactionError` | `Error \| null` | Transaction write error |
| `approvalConfirmError` | `Error \| null` | Approval confirmation error |
| `transactionConfirmError` | `Error \| null` | Transaction confirmation error |

#### Other

| Property | Type | Description |
|----------|------|-------------|
| `approvalHash` | `string \| null` | Approval transaction hash |
| `transactionHash` | `string \| null` | Main transaction hash |
| `execute` | `() => Promise<void>` | Start the flow (auto-resets) |
| `reset` | `() => void` | Manually clear all state |

### Usage Examples

#### With USDT Approval (Investment)

```typescript
const { toast } = useToast()
const navigate = useNavigate()
const [amount, setAmount] = useState('100')
const [referId, setReferId] = useState('')

const transaction = useUniversalTransaction({
  approvalConfig: {
    tokenAddress: usdtAddress,
    tokenAbi: usdtAbi,
    spenderAddress: contractAddress,
    amount: amount, // String auto-parsed with 18 decimals
    decimals: 18,
  },
  transactionConfig: {
    contractAddress: contractAddress,
    contractAbi: contractAbi,
    functionName: 'invest',
    args: [
      referId || '0x0000000000000000000000000000000000000000',
      parseUnits(amount, 18),
    ],
  },
  onApprovalError: (error) => {
    toast({
      title: 'Approval Failed',
      description: error.message,
      variant: 'destructive',
    })
  },
  onTransactionError: (error) => {
    toast({
      title: 'Investment Failed',
      description: error.message,
      variant: 'destructive',
    })
  },
  onFinalSuccess: () => {
    toast({ title: 'Success!', description: 'Investment completed' })
    navigate('/dashboard')
  },
})

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  await transaction.execute()
}

return (
  <form onSubmit={handleSubmit}>
    <input value={amount} onChange={(e) => setAmount(e.target.value)} />
    <button type="submit" disabled={transaction.isLoading}>
      {transaction.isApproving && 'Approving USDT...'}
      {transaction.isApprovingConfirming && 'Confirming Approval...'}
      {transaction.isTransacting && 'Investing...'}
      {transaction.isTransactionConfirming && 'Confirming Investment...'}
      {!transaction.isLoading && 'Invest'}
    </button>
  </form>
)
```

#### Without Approval (Direct Transaction)

```typescript
const transaction = useUniversalTransaction({
  // No approvalConfig = skips approval
  transactionConfig: {
    contractAddress: contractAddress,
    contractAbi: abi,
    functionName: 'withdraw',
    args: [parseUnits('500', 18)],
  },
  onFinalSuccess: () => {
    console.log('Withdrawal complete!')
  },
})

return (
  <button onClick={() => transaction.execute()} disabled={transaction.isLoading}>
    {transaction.isTransacting ? 'Processing...' : 'Withdraw'}
  </button>
)
```

#### No Arguments Function

```typescript
const transaction = useUniversalTransaction({
  transactionConfig: {
    contractAddress: contractAddress,
    contractAbi: abi,
    functionName: 'claimRewards',
    // No args needed
  },
})

return <button onClick={() => transaction.execute()}>Claim</button>
```

#### Dynamic Amount with BigInt

```typescript
const [fspAmount, setFspAmount] = useState<bigint | null>(null)

const transaction = useUniversalTransaction({
  approvalConfig: fspAmount
    ? {
        tokenAddress: usdtAddress,
        tokenAbi: usdtAbi,
        spenderAddress: contractAddress,
        amount: fspAmount + BigInt(1), // Add buffer
      }
    : undefined,
  transactionConfig: {
    contractAddress: contractAddress,
    contractAbi: abi,
    functionName: 'purchase',
    args: [parseUnits('100', 18)],
  },
})

const handlePurchase = async () => {
  // Calculate FSP first
  const fsp = await calculateFSP()
  setFspAmount(fsp)
  // Then execute
  await transaction.execute()
}
```

#### Multiple Arguments

```typescript
const transaction = useUniversalTransaction({
  transactionConfig: {
    contractAddress: nftContract,
    contractAbi: nftAbi,
    functionName: 'transferFrom',
    args: [fromAddress, toAddress, tokenId],
  },
})
```

#### With Manual Reset

```typescript
const transaction = useUniversalTransaction({
  approvalConfig: { /* ... */ },
  transactionConfig: { /* ... */ },
})

const handleAnotherTransaction = () => {
  transaction.reset() // Clear state manually
  transaction.execute() // Start fresh
}

return (
  <div>
    <button onClick={() => transaction.execute()}>Stake</button>
    {transaction.isComplete && (
      <button onClick={handleAnotherTransaction}>Stake Again</button>
    )}
  </div>
)
```

---

## Common Patterns

### Error Handling Pattern

```typescript
const transaction = useUniversalTransaction({
  approvalConfig: { /* ... */ },
  transactionConfig: { /* ... */ },
  onApprovalError: (error) => {
    // Handle approval specific errors
    if (error.message.includes('user rejected')) {
      toast({ title: 'Transaction Cancelled' })
    } else {
      toast({ title: 'Approval Failed', description: error.message })
    }
  },
  onTransactionError: (error) => {
    // Handle transaction specific errors
    toast({ title: 'Transaction Failed', description: error.message })
  },
})
```

### Loading States Pattern

```typescript
<button disabled={transaction.isLoading}>
  {transaction.isApproving && '1/2 Approving...'}
  {transaction.isApprovingConfirming && '1/2 Confirming Approval...'}
  {transaction.isTransacting && '2/2 Processing...'}
  {transaction.isTransactionConfirming && '2/2 Confirming...'}
  {!transaction.isLoading && 'Submit'}
</button>
```

### Retry Pattern

```typescript
// User clicks submit
transaction.execute() // Approval fails

// User clicks submit again
transaction.execute() // Starts fresh (auto-resets)
```

---

## TypeScript Types

### For useUniversalReadContract

```typescript
interface UserDashboard {
  name: string
  balance: bigint
  isActive: boolean
}

const { data } = useUniversalReadContract<UserDashboard>({
  functionName: 'getUserDashboard',
  args: [userAddress],
})

// data is typed as UserDashboard | undefined
```

### For useUniversalTransaction

```typescript
// No special types needed, but you can type your args
const args: [Address, bigint] = [referId, parseUnits(amount, 18)]

const transaction = useUniversalTransaction({
  transactionConfig: {
    contractAddress,
    contractAbi,
    functionName: 'invest',
    args,
  },
})
```

---

## Notes

- Both hooks work in React and Next.js (client components only in Next.js)
- Add `'use client'` at top of file in Next.js app directory
- `execute()` always resets state before starting
- Approval errors prevent transaction execution
- All callbacks are optional
- Use `enabled: false` + manual `refetch()` for lazy loading
- Use `watch: true` for real-time blockchain data