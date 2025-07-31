use anchor_lang::prelude::*;

pub mod raydium_cpi;
pub mod transfer_hook;
pub use raydium_cpi::*;
pub use transfer_hook::*;

// Raydium AMM v4 Program ID on Devnet
pub const RAYDIUM_AMM_PROGRAM_ID: &str = "DRaya7Kj3aMWQSy19kSjvmuwq9docCHofyP9kanQGaav";

// Middleware PDA seeds
pub const MIDDLEWARE_PDA_SEED: &[u8] = b"middleware";

declare_id!("7rPx2YD8zuQG1owdEp7mYtqgTzDpwe9qt8rnPVJAFc4D");

#[program]
pub mod middleware {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let middleware = &mut ctx.accounts.middleware;
        middleware.authority = ctx.accounts.authority.key();
        middleware.whitelisted_hooks = 0;
        
        msg!("Middleware initialized");
        Ok(())
    }

    pub fn add_whitelisted_hook(ctx: Context<AddWhitelistedHook>, hook_program: Pubkey) -> Result<()> {
        // Only authority can add whitelisted hooks
        require!(
            ctx.accounts.middleware.authority == ctx.accounts.authority.key(),
            MiddlewareError::Unauthorized
        );

        // Add logic to store the whitelisted hook
        // This is a simplified version - in practice, you'd store this in an account
        msg!("Added whitelisted hook: {}", hook_program);
        
        Ok(())
    }

    pub fn check_transfer_hook(
        ctx: Context<CheckTransferHook>,
        amount: u64,
        decimals: u8,
    ) -> Result<()> {
        // Validate the transfer hook
        transfer_hook::validate_transfer_hook(
            &ctx.accounts.source_account.to_account_info(),
            &ctx.accounts.mint_account.to_account_info(),
            &ctx.accounts.destination_account.to_account_info(),
            &ctx.accounts.authority.to_account_info(),
            amount,
            decimals,
        )
    }

    pub fn execute_swap_with_hook_check(
        ctx: Context<ExecuteSwapWithHookCheck>,
        amount_in: u64,
        min_amount_out: u64,
        decimals: u8,
    ) -> Result<()> {
        // First check the transfer hook
        transfer_hook::validate_transfer_hook(
            &ctx.accounts.source_account.to_account_info(),
            &ctx.accounts.mint_account.to_account_info(),
            &ctx.accounts.destination_account.to_account_info(),
            &ctx.accounts.authority.to_account_info(),
            amount_in,
            decimals,
        )?;
        
        // If hook check passes, proceed with the swap
        msg!("Transfer hook validation passed, executing swap via CPI to Raydium");
        
        // Validate that we're using the correct Raydium program
        let raydium_program_id: Pubkey = RAYDIUM_AMM_PROGRAM_ID.parse().unwrap();
        require!(
            ctx.accounts.raydium_swap_program.key() == raydium_program_id,
            MiddlewareError::InvalidPoolInfo
        );
        
        // Build Raydium swap accounts
        let raydium_accounts = raydium_cpi::RaydiumSwapAccounts {
            amm_program: ctx.accounts.raydium_swap_program.to_account_info(),
            amm_authority: ctx.accounts.amm_authority.to_account_info(),
            amm_open_orders: ctx.accounts.amm_open_orders.to_account_info(),
            amm_target_orders: ctx.accounts.amm_target_orders.to_account_info(),
            pool_source_token_account: ctx.accounts.pool_source_token_account.to_account_info(),
            pool_destination_token_account: ctx.accounts.pool_destination_token_account.to_account_info(),
            user_source_token_account: ctx.accounts.user_source_token_account.to_account_info(),
            user_destination_token_account: ctx.accounts.user_destination_token_account.to_account_info(),
            user_owner: ctx.accounts.authority.clone(),
            serum_market: ctx.accounts.serum_market.to_account_info(),
            serum_event_queue: ctx.accounts.serum_event_queue.to_account_info(),
            serum_bids: ctx.accounts.serum_bids.to_account_info(),
            serum_asks: ctx.accounts.serum_asks.to_account_info(),
            serum_coin_vault: ctx.accounts.serum_coin_vault.to_account_info(),
            serum_pc_vault: ctx.accounts.serum_pc_vault.to_account_info(),
            serum_vault_signer: ctx.accounts.serum_vault_signer.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        
        // Derive the PDA signer seeds for middleware program
        let (middleware_pda, bump) = Pubkey::find_program_address(
            &[MIDDLEWARE_PDA_SEED],
            ctx.program_id
        );
        
        // Execute Raydium swap via CPI with PDA signing
        raydium_cpi::raydium_swap(
            ctx.accounts.raydium_swap_program.key,
            &raydium_accounts,
            amount_in,
            min_amount_out,
            Some(&[&[MIDDLEWARE_PDA_SEED, &[bump]]]), // Pass the signer seeds
        )?;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + MiddlewareAccount::INIT_SPACE,
    )]
    pub middleware: Account<'info, MiddlewareAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddWhitelistedHook<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub middleware: Account<'info, MiddlewareAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CheckTransferHook<'info> {
    /// CHECK: This account is checked in the hook program
    pub source_account: UncheckedAccount<'info>,
    /// CHECK: This account is checked in the hook program
    pub mint_account: UncheckedAccount<'info>,
    /// CHECK: This account is checked in the hook program
    pub destination_account: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
    /// CHECK: This account is checked in the hook program
    pub hook_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(amount_in: u64, min_amount_out: u64, decimals: u8)]
pub struct ExecuteSwapWithHookCheck<'info> {
    /// CHECK: This account is checked in the hook program
    pub source_account: UncheckedAccount<'info>,
    /// CHECK: This account is checked in the hook program
    pub mint_account: UncheckedAccount<'info>,
    /// CHECK: This account is checked in the hook program
    pub destination_account: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
    /// CHECK: This account is checked in the hook program
    pub hook_program: UncheckedAccount<'info>,
    /// CHECK: This account is the Raydium swap program (must be DRaya7Kj3aMWQSy19kSjvmuwq9docCHofyP9kanQGaav)
    pub raydium_swap_program: UncheckedAccount<'info>,
    /// CHECK: AMM authority
    pub amm_authority: UncheckedAccount<'info>,
    /// CHECK: AMM open orders
    pub amm_open_orders: UncheckedAccount<'info>,
    /// CHECK: AMM target orders
    pub amm_target_orders: UncheckedAccount<'info>,
    /// CHECK: Pool source token account
    pub pool_source_token_account: UncheckedAccount<'info>,
    /// CHECK: Pool destination token account
    pub pool_destination_token_account: UncheckedAccount<'info>,
    /// CHECK: User source token account
    pub user_source_token_account: UncheckedAccount<'info>,
    /// CHECK: User destination token account
    pub user_destination_token_account: UncheckedAccount<'info>,
    /// CHECK: Serum market
    pub serum_market: UncheckedAccount<'info>,
    /// CHECK: Serum event queue
    pub serum_event_queue: UncheckedAccount<'info>,
    /// CHECK: Serum bids
    pub serum_bids: UncheckedAccount<'info>,
    /// CHECK: Serum asks
    pub serum_asks: UncheckedAccount<'info>,
    /// CHECK: Serum coin vault
    pub serum_coin_vault: UncheckedAccount<'info>,
    /// CHECK: Serum pc vault
    pub serum_pc_vault: UncheckedAccount<'info>,
    /// CHECK: Serum vault signer
    pub serum_vault_signer: UncheckedAccount<'info>,
    /// CHECK: Token program
    pub token_program: UncheckedAccount<'info>,
    /// CHECK: Rent sysvar
    pub rent: UncheckedAccount<'info>,
    /// CHECK: Middleware PDA account
    #[account(
        seeds = [MIDDLEWARE_PDA_SEED],
        bump,
    )]
    pub middleware_pda: UncheckedAccount<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct MiddlewareAccount {
    pub authority: Pubkey,
    pub whitelisted_hooks: u64,
}

#[error_code]
pub enum MiddlewareError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Transfer hook validation failed")]
    HookValidationFailed,
    #[msg("Invalid pool information")]
    InvalidPoolInfo,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
}