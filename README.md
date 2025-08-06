# Vesting Program

This is a Solana Anchor program for managing token vesting schedules for employees.

## Features

- Create a vesting account for a company and mint.
- Add employee vesting schedules with customizable start, end, and cliff times.
- Employees can claim vested tokens according to their schedule.
- Secure token transfers using PDAs and Anchor constraints.

## Accounts

### VestingAccount

Stores company-level vesting configuration.

| Field                 | Type    | Description                        |
|-----------------------|---------|------------------------------------|
| owner                 | Pubkey  | Owner of the vesting account       |
| mint                  | Pubkey  | Token mint address                 |
| treasury_token_account| Pubkey  | PDA holding tokens for vesting     |
| company_name          | String  | Name of the company (max 32 chars) |
| bump_for_treasury     | u8      | PDA bump for treasury account      |
| bump                  | u8      | PDA bump for vesting account       |

### EmployeeAccount

Stores individual employee vesting schedule.

| Field           | Type   | Description                          |
|-----------------|--------|--------------------------------------|
| beneficiary     | Pubkey | Employee's wallet address            |
| start_time      | i64    | Vesting start timestamp (UTC)        |
| end_time        | i64    | Vesting end timestamp (UTC)          |
| cliff_time      | i64    | Cliff timestamp (UTC)                |
| vesting_account | Pubkey | Parent vesting account               |
| total_amount    | u64    | Total tokens to be vested            |
| total_withdrawn | u64    | Amount already claimed               |
| bump            | u8     | PDA bump                             |

## Instructions

### create_vesting_account

Creates a new vesting account for a company.

- **Accounts**:  
  - `signer` (payer)  
  - `vesting_account` (PDA)  
  - `mint`  
  - `treasury_token_account` (PDA)  
  - `system_program`  
  - `token_program`

- **Args**:  
  - `company_name: String`

### create_employee_account

Creates a new employee vesting schedule.

- **Accounts**:  
  - `owner` (company)  
  - `beneficiary`  
  - `vesting_account`  
  - `employee_account` (PDA)  
  - `system_program`

- **Args**:  
  - `start_time: i64`  
  - `end_time: i64`  
  - `total_amount: u64`  
  - `cliff_time: i64`

### claim_tokens

Allows an employee to claim their vested tokens.

- **Accounts**:  
  - `beneficiary` (signer)  
  - `employee_account`  
  - `vesting_account`  
  - `mint`  
  - `treasury_token_account`  
  - `employee_token_account` (ATA, created if needed)  
  - `token_program`  
  - `associated_token_program`  
  - `system_program`

- **Args**:  
  - `company_name: String`

## Error Codes

- `ClaimNotAvailable`: Claim not available yet (cliff not reached)
- `InvalidVestingPeriod`: Vesting period is invalid
- `CalculationOverflow`: Arithmetic overflow in calculation
- `NothingToClaim`: No tokens available to claim

## Example Usage

See the `programs/vesting/src/lib.rs` for detailed implementation.

