use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::instruction::Instruction;

// Raydium AMM v4 Program ID on Devnet
pub const RAYDIUM_AMM_PROGRAM_ID: &str = "DRaya7Kj3aMWQSy19kSjvmuwq9docCHofyP9kanQGaav";

/// Raydium swap instruction data (SwapBaseIn)
#[derive(anchor_lang::AnchorSerialize, anchor_lang::AnchorDeserialize)]
pub struct RaydiumSwapInstruction {
    /// Amount of input token to swap
    pub amount_in: u64,
    /// Minimum amount of output token to receive
    pub min_amount_out: u64,
}

/// Raydium pool creation instruction data
#[derive(anchor_lang::AnchorSerialize, anchor_lang::AnchorDeserialize)]
pub struct RaydiumCreatePoolInstruction {
    /// Program ID of the AMM program
    pub amm_program_id: Pubkey,
    /// Program ID of the Serum market
    pub serum_program_id: Pubkey,
    /// Nonce for the AMM authority PDA
    pub amm_authority_nonce: u64,
}

/// Accounts required for Raydium swap
#[derive(Accounts)]
pub struct RaydiumSwapAccounts<'info> {
    /// CHECK: This account is checked in the Raydium program
    pub amm_program: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_authority: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_open_orders: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_target_orders: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub pool_source_token_account: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub pool_destination_token_account: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub user_source_token_account: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub user_destination_token_account: AccountInfo<'info>,
    /// User owner (authority)
    pub user_owner: Signer<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_market: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_event_queue: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_bids: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_asks: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_coin_vault: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_pc_vault: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_vault_signer: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub token_program: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub rent: AccountInfo<'info>,
}

/// Accounts required for Raydium pool creation
#[derive(Accounts)]
pub struct RaydiumCreatePoolAccounts<'info> {
    /// CHECK: This account is checked in the Raydium program
    pub amm_program: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_pool: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_authority: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_open_orders: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_target_orders: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_lp_mint: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_coin_mint: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_pc_mint: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_coin_vault: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_pc_vault: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub amm_fee_destination: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_market: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_coin_vault: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_pc_vault: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_vault_signer: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_event_queue: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_bids: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_asks: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_coin_mint: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_pc_mint: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_coin_lot_size: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_pc_lot_size: AccountInfo<'info>,
    /// User owner (authority)
    pub user_owner: Signer<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub user_coin_token_account: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub user_pc_token_account: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub user_lp_token_account: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub serum_program: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub token_program: AccountInfo<'info>,
    /// CHECK: This account is checked in the Raydium program
    pub rent: AccountInfo<'info>,
}

/// Execute a swap on Raydium via CPI
pub fn raydium_swap<'a, 'b, 'c, 'info>(
    program_id: &Pubkey,
    accounts: &RaydiumSwapAccounts<'info>,
    amount_in: u64,
    min_amount_out: u64,
    signer_seeds: Option<&[&[&[u8]]]>,
) -> Result<()> {
    // Serialize instruction data
    // Raydium swap instruction discriminator is 9 (0x09)
    let instruction_data = RaydiumSwapInstruction {
        amount_in,
        min_amount_out,
    };
    
    let mut data = vec![0x09]; // Swap instruction discriminator for Raydium
    instruction_data.serialize(&mut data)?;
    
    // Build account metas in the exact order Raydium expects
    let account_metas = vec![
        AccountMeta {
            pubkey: *accounts.amm_program.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.amm_authority.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.amm_open_orders.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.amm_target_orders.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.pool_source_token_account.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.pool_destination_token_account.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.user_source_token_account.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.user_destination_token_account.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.user_owner.key,
            is_signer: true,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.serum_market.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_event_queue.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_bids.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_asks.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_coin_vault.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_pc_vault.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_vault_signer.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.token_program.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.rent.key,
            is_signer: false,
            is_writable: false,
        },
    ];
    
    // Build instruction
    let instruction = Instruction {
        program_id: *program_id,
        accounts: account_metas,
        data,
    };
    
    // Build account infos
    let account_infos = vec![
        accounts.amm_program.to_account_info(),
        accounts.amm_authority.to_account_info(),
        accounts.amm_open_orders.to_account_info(),
        accounts.amm_target_orders.to_account_info(),
        accounts.pool_source_token_account.to_account_info(),
        accounts.pool_destination_token_account.to_account_info(),
        accounts.user_source_token_account.to_account_info(),
        accounts.user_destination_token_account.to_account_info(),
        accounts.user_owner.to_account_info(),
        accounts.serum_market.to_account_info(),
        accounts.serum_event_queue.to_account_info(),
        accounts.serum_bids.to_account_info(),
        accounts.serum_asks.to_account_info(),
        accounts.serum_coin_vault.to_account_info(),
        accounts.serum_pc_vault.to_account_info(),
        accounts.serum_vault_signer.to_account_info(),
        accounts.token_program.to_account_info(),
        accounts.rent.to_account_info(),
    ];
    
    // Execute CPI
    if let Some(seeds) = signer_seeds {
        Ok(invoke_signed(
            &instruction,
            &account_infos,
            seeds,
        )?)
    } else {
        Ok(invoke(
            &instruction,
            &account_infos,
        )?)
    }
}

/// Execute pool creation on Raydium via CPI
pub fn raydium_create_pool<'a, 'b, 'c, 'info>(
    program_id: &Pubkey,
    accounts: &RaydiumCreatePoolAccounts<'info>,
    amm_program_id: Pubkey,
    serum_program_id: Pubkey,
    amm_authority_nonce: u64,
    signer_seeds: Option<&[&[&[u8]]]>,
) -> Result<()> {
    // Serialize instruction data
    // Raydium create pool instruction discriminator is 0 (0x00)
    let instruction_data = RaydiumCreatePoolInstruction {
        amm_program_id,
        serum_program_id,
        amm_authority_nonce,
    };
    
    let mut data = vec![0x00]; // Create pool instruction discriminator for Raydium
    instruction_data.serialize(&mut data)?;
    
    // Build account metas in the exact order Raydium expects
    let account_metas = vec![
        AccountMeta {
            pubkey: *accounts.amm_program.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.amm_pool.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.amm_authority.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.amm_open_orders.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.amm_target_orders.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.amm_lp_mint.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.amm_coin_mint.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.amm_pc_mint.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.amm_coin_vault.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.amm_pc_vault.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.amm_fee_destination.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_market.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_coin_vault.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_pc_vault.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_vault_signer.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.serum_event_queue.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_bids.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_asks.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_coin_mint.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.serum_pc_mint.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.serum_coin_lot_size.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.serum_pc_lot_size.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.user_owner.key,
            is_signer: true,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.user_coin_token_account.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.user_pc_token_account.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.user_lp_token_account.key,
            is_signer: false,
            is_writable: true,
        },
        AccountMeta {
            pubkey: *accounts.serum_program.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.token_program.key,
            is_signer: false,
            is_writable: false,
        },
        AccountMeta {
            pubkey: *accounts.rent.key,
            is_signer: false,
            is_writable: false,
        },
    ];
    
    // Build instruction
    let instruction = Instruction {
        program_id: *program_id,
        accounts: account_metas,
        data,
    };
    
    // Build account infos
    let account_infos = vec![
        accounts.amm_program.to_account_info(),
        accounts.amm_pool.to_account_info(),
        accounts.amm_authority.to_account_info(),
        accounts.amm_open_orders.to_account_info(),
        accounts.amm_target_orders.to_account_info(),
        accounts.amm_lp_mint.to_account_info(),
        accounts.amm_coin_mint.to_account_info(),
        accounts.amm_pc_mint.to_account_info(),
        accounts.amm_coin_vault.to_account_info(),
        accounts.amm_pc_vault.to_account_info(),
        accounts.amm_fee_destination.to_account_info(),
        accounts.serum_market.to_account_info(),
        accounts.serum_coin_vault.to_account_info(),
        accounts.serum_pc_vault.to_account_info(),
        accounts.serum_vault_signer.to_account_info(),
        accounts.serum_event_queue.to_account_info(),
        accounts.serum_bids.to_account_info(),
        accounts.serum_asks.to_account_info(),
        accounts.serum_coin_mint.to_account_info(),
        accounts.serum_pc_mint.to_account_info(),
        accounts.serum_coin_lot_size.to_account_info(),
        accounts.serum_pc_lot_size.to_account_info(),
        accounts.user_owner.to_account_info(),
        accounts.user_coin_token_account.to_account_info(),
        accounts.user_pc_token_account.to_account_info(),
        accounts.user_lp_token_account.to_account_info(),
        accounts.serum_program.to_account_info(),
        accounts.token_program.to_account_info(),
        accounts.rent.to_account_info(),
    ];
    
    // Execute CPI
    if let Some(seeds) = signer_seeds {
        Ok(invoke_signed(
            &instruction,
            &account_infos,
            seeds,
        )?)
    } else {
        Ok(invoke(
            &instruction,
            &account_infos,
        )?)
    }
}

/// Raydium pool information
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RaydiumPoolInfo {
    /// Pool ID
    pub pool_id: Pubkey,
    /// Token A mint
    pub token_a_mint: Pubkey,
    /// Token B mint
    pub token_b_mint: Pubkey,
    /// AMM program ID
    pub amm_program_id: Pubkey,
    /// Serum market ID
    pub serum_market_id: Pubkey,
    /// AMM authority
    pub amm_authority: Pubkey,
    /// AMM open orders
    pub amm_open_orders: Pubkey,
    /// AMM target orders
    pub amm_target_orders: Pubkey,
}

/// Get pool information from Raydium
#[allow(dead_code)]
pub fn get_raydium_pool_info(_pool_id: &Pubkey) -> Result<RaydiumPoolInfo> {
    // In a real implementation, this would fetch pool information from Raydium
    // For now, we'll return a placeholder with the correct program ID
    Ok(RaydiumPoolInfo {
        pool_id: *_pool_id,
        token_a_mint: Pubkey::default(),
        token_b_mint: Pubkey::default(),
        amm_program_id: RAYDIUM_AMM_PROGRAM_ID.parse().unwrap(),
        serum_market_id: Pubkey::default(),
        amm_authority: Pubkey::default(),
        amm_open_orders: Pubkey::default(),
        amm_target_orders: Pubkey::default(),
    })
}