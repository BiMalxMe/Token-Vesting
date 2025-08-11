'use client'

import { PublicKey } from '@solana/web3.js'
import { useMemo, useState } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useVestingProgram, useVestingProgramAccount } from './vesting-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useWallet } from '@solana/wallet-adapter-react'

// ----------------- CREATE COMPANY VESTING -----------------
export function VestingCreate() {
  const { createVestingAccount } = useVestingProgram()
  const [company, setCompany] = useState("")
  const [mint, setMint] = useState("")
  const { publicKey } = useWallet()

  const isFormValid = company.trim().length > 0 && mint.trim().length > 0

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createVestingAccount.mutateAsync({
        company_name: company,
        mint
      })
    }
  }

  if (!publicKey) {
    return <p className="text-center text-gray-500">Connect your wallet to continue</p>
  }

  return (
    <Card className="max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Create Company Vesting Account</CardTitle>
        <CardDescription>Enter your company details to start a new vesting program.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input
            type="text"
            placeholder="e.g. Solana Labs"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Token Mint Address</label>
          <input
            type="text"
            placeholder="Mint address"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-400"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={createVestingAccount.isPending || !isFormValid}
          className="w-full"
        >
          {createVestingAccount.isPending ? "Creating..." : "Create Vesting Account"}
        </Button>
      </CardContent>
    </Card>
  )
}

// ----------------- LIST COMPANY VESTINGS -----------------
export function VestingList() {
  const { accounts, getProgramAccount } = useVestingProgram()

  if (getProgramAccount.isLoading) {
    return <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg"></span></div>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="text-center p-4 border rounded-md bg-blue-50 text-blue-700">
        Program account not found. Ensure the program is deployed and on the correct cluster.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {accounts.isLoading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg"></span></div>
      ) : accounts.data?.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {accounts.data.map((account) => (
            <VestingCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-6">
          <h2 className="text-xl font-semibold">No Accounts Found</h2>
          <p>Create one above to get started.</p>
        </div>
      )}
    </div>
  )
}

// ----------------- CREATE EMPLOYEE VESTING -----------------
function VestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVestingAccount } = useVestingProgramAccount({ account })
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(0)
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [cliffTime, setCliffTime] = useState<number>(0)
  const [beneficiary, setBeneficiary] = useState<string>('')

  const companyName = useMemo(
    () => accountQuery.data?.companyName || '',
    [accountQuery.data?.companyName]
  )

  if (accountQuery.isLoading) {
    return <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg"></span></div>
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{companyName || "Employee Vesting"}</CardTitle>
        <CardDescription>
          Account:{" "}
          <ExplorerLink
            path={`account/${account}`}
            label={ellipsify(account.toString())}
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label="Start Time" value={startTime} setValue={setStartTime} type="number" />
          <InputField label="End Time" value={endTime} setValue={setEndTime} type="number" />
          <InputField label="Total Amount" value={totalAmount} setValue={setTotalAmount} type="number" />
          <InputField label="Cliff Period" value={cliffTime} setValue={setCliffTime} type="number" />
        </div>

        <InputField label="Beneficiary Wallet Address" value={beneficiary} setValue={setBeneficiary} />

        <Button
          onClick={() => {
            createEmployeeVestingAccount.mutateAsync({
              startTime,
              endTime,
              totalAmount,
              cliffTime,
              beneficary: beneficiary,
            })
          }}
          disabled={
            createEmployeeVestingAccount.isPending ||
            !startTime || !endTime || !totalAmount || !cliffTime || !beneficiary
          }
          className="w-full"
        >
          {createEmployeeVestingAccount.isPending ? "Creating..." : "Create Employee Vesting"}
        </Button>
      </CardContent>
    </Card>
  )
}

// ----------------- REUSABLE INPUT FIELD -----------------
function InputField({
  label,
  value,
  setValue,
  type = "text"
}: {
  label: string
  value: any
  setValue: (val: any) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) =>
          type === "number" ? setValue(parseInt(e.target.value) || 0) : setValue(e.target.value)
        }
        placeholder={label}
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-400"
      />
    </div>
  )
}
