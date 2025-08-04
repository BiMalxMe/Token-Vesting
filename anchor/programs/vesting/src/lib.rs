#![allow(clippy::result_large_err)]
use anchor_spl::token_interface::{Mint, TokenInterface};
use anchor_lang::prelude::*;

declare_id!("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS");

#[program]
pub mod vesting {
    use std::task::Context;

    use super::*;

    pub fn create_vesting_account(ctx:Context<CreateVestingAccount>,company_name : String) -> Result<()>{
Ok(())
    }
}

#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct CreateVestingAccount<'info>{
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        space = 8 + VestingAccount::InitSpace,
        payer = signer,
        seeds = [company_name.as_ref()],
        bump,
    )]

    pub vesting_account: Account<'info, VestingAccount>,
    pub mint : InterfaceAccount<'info, Mint>,

    #[account(
        init,
        token::mint = mint,
        token::authority = treasury_token_account,
        payer = signer,
        seeds = [b"vesting_treasury",company_name.as_ref()],
        bump
    )]
    pub vesting_token_account: InterfaceAccount<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}
#[account]
#[derive(InitSpace)]
pub struct VestingAccount {
    pub owner : Pubkey,
    pub mint: Pubkey,
    pub treasury: Pubkey,
    #[max_length = 32]
    pub company_name : String,
    pub bump_for_treasury: u8,
    pub bump : u8,
}
