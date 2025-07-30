const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, SystemProgram } = require("@solana/web3.js");

describe("middleware", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Middleware;
  const wallet = provider.wallet;

  // Generate keypairs for testing
  const middlewareKeypair = Keypair.generate();

  it("Initializes the middleware", async () => {
    // Add your test here.
    const tx = await program.methods.initialize()
      .accounts({
        middleware: middlewareKeypair.publicKey,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([middlewareKeypair])
      .rpc();
      
    console.log("Your transaction signature", tx);
  });

  it("Adds a whitelisted hook", async () => {
    // Add a whitelisted hook
    const hookProgramId = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
    
    const tx = await program.methods.addWhitelistedHook(hookProgramId)
      .accounts({
        middleware: middlewareKeypair.publicKey,
        authority: wallet.publicKey,
      })
      .rpc();
      
    console.log("Added whitelisted hook transaction signature", tx);
  });
});