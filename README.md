
## Program Logic

### Cross-Program Invocation (CPI)

Cross-Program Invocation allows one Solana program to call another program's instructions. In this middleware, CPI is used to execute Raydium swap instructions:

```rust
// Execute Raydium swap via CPI with PDA signing
raydium_cpi::raydium_swap(
    ctx.accounts.raydium_swap_program.key,
    &raydium_accounts,
    amount_in,
    min_amount_out,
    Some(&[&[MIDDLEWARE_PDA_SEED, &[bump]]]), // Pass the signer seeds
)?;
```

The middleware program derives a Program Derived Address (PDA) that can sign transactions on behalf of the program, allowing it to authorize actions in the Raydium program.

### Raydium Pool Creation

Pool creation involves calling the Raydium AMM program through CPI with the required accounts:

```rust
pub fn create_raydium_pool(
    ctx: Context<CreateRaydiumPool>,
    amm_program_id: Pubkey,
    serum_program_id: Pubkey,
    amm_authority_nonce: u64,
) -> Result<()> {
    // Validate that we're using the correct Raydium program
    let raydium_program_id: Pubkey = RAYDIUM_AMM_PROGRAM_ID.parse().unwrap();
    require!(
        ctx.accounts.raydium_pool_program.key() == raydium_program_id,
        MiddlewareError::InvalidPoolInfo
    );
    
    // Build Raydium pool creation accounts
    let raydium_accounts = raydium_cpi::RaydiumCreatePoolAccounts {
        // ... account mappings ...
    };
    
    // Execute Raydium pool creation via CPI with PDA signing
    raydium_cpi::raydium_create_pool(
        ctx.accounts.raydium_pool_program.key,
        &raydium_accounts,
        amm_program_id,
        serum_program_id,
        amm_authority_nonce,
        Some(&[&[MIDDLEWARE_PDA_SEED, &[bump]]]),
    )?;
    
    Ok(())
}
```

### Transfer Hook Validation

Before executing any swap, the middleware validates transfer hooks to ensure compliance:

```rust
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
    
    // Execute Raydium swap via CPI with PDA signing
    raydium_cpi::raydium_swap(
        ctx.accounts.raydium_swap_program.key,
        &raydium_accounts,
        amount_in,
        min_amount_out,
        Some(&[&[MIDDLEWARE_PDA_SEED, &[bump]]]),
    )?;
    
    Ok(())
}
```

## Development

To modify the frontend:

1. Edit components in `src/App.tsx`
2. Update styling in `src/App.css`
3. Modify wallet integration in `src/main.tsx`

For program development, see the main program documentation in the `programs/` directory.

## License

This project is licensed under the MIT License.