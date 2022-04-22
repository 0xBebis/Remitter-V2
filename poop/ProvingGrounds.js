const { expect } = require("chai");
const { waffle } = require("hardhat");
const pools = require("../pools.json");
const tokens = require("../tokens.json");
const { testAccount } = require("../secrets.json");
const fs = require('fs');

async function main() {

  // TESTNET CONTRACTS
  const SpookyFactory = "0x5D479c2a7FB79E12Ac4eBBAeDB0322B4d5F9Fd02";
  const SpookyRouter = "0xcCAFCf876caB8f9542d6972f87B5D62e1182767d";

  ////////////////////

  let Vault = await ethers.getContractFactory("ReaperVault");
  let Strategy = await ethers.getContractFactory("ReaperAutoCompoundSteakv2");
  let TestHelper = await ethers.getContractFactory("TestHelper");
  let Treasury = await ethers.getContractFactory("ReaperTreasury");

  //dependencies
  let TestERC20 = await ethers.getContractFactory("TestERC20");
  let WFTM = await ethers.getContractFactory("WrappedFtm");
  let UniToken = await ethers.getContractFactory("UniswapV2ERC20");
  let ChefToken = await ethers.getContractFactory("SpookyToken");
  let MasterChef = await ethers.getContractFactory("MasterChef");
  let MasterChefIce = await ethers.getContractFactory("Sorbettiere");
  let MasterChefSteakV2 = await ethers.getContractFactory("SteakHouseV2");
  let UniRouter = await ethers.getContractFactory("UniswapV2Router02");
  let UniFactory = await ethers.getContractFactory("UniswapV2Factory");
  let UniPair = await ethers.getContractFactory("UniswapV2Pair");

  let vault;
  let strategy;
  let treasury;
  let targetToken;

  let wallet = await new ethers.Wallet(testAccount);
  let walletAddress = await wallet.getAddress();

  let dai = await TestERC20.deploy("DAI", "DAI");
  let rp3r = await TestERC20.deploy("Reaper", "RP3R");
  let wftm = await WFTM.deploy();

  let factory = UniFactory.attach()
  let router = await UniRouter.deploy(factory.address, wftm.address);
  let chef = await MasterChef.deploy(ChefToken.address, "0x85df0B925E0Af60A399a8b81bA5B69eAd3461de6", 1000000000000000000, now);
  let helper = await TestHelper.deploy();

  let BFN = ethers.utils.parseEther("1000000000000");
  BFN = BFN._hex.replace(/0x0+/, "0x");


  async function mintThatShit() {
    await dai.mint(walletAddress, ethers.utils.parseEther("1000000000"));
    await rp3r.mint(walletAddress, ethers.utils.parseEther("300000000"));
    await wftm.mint(walletAddress, ethers.utils.parseEther("4000000000"));
  }

  async function swap(signer, exchange, amountIn, token) {
    const signerAddress = await signer.getAddress();
    let target = await ERC20.attach(targetToken);
    let time = await helper.getTimestamp();
    await wftm.approve(exchange.address, ethers.utils.parseEther("1000000000"));
    let tx = await exchange.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      amountIn,
      0,
      [token, wftm],
      walletAddress,
      parseInt(time)
    );
    let receipt = await tx.wait();
    console.log(receipt);
  }

  async function addLiquidity(
    exchange,
    factory,
    tokenOne,
    tokenTwo,
    amount,
  ) {
    const signerAddress = await signer.getAddress();
    let tok1c = await ERC20.attach(tokenOne);
    let tok2c = await ERC20.attach(tokenTwo);
    await tok1c.approve(factory.address, ethers.utils.parseEther("10000000000"));
    await tok2c.approve(factory.address, ethers.utils.parseEther("10000000000"));
    await factory.addLiquidity(
      tokenOne,
      tokenTwo,
      lp0bal,
      lp1bal,
      1,
      1,
      signerAddress,
      0
    );
    console.log("complete");
  }

  async function deploy(targetFarm) {
    targetToken = UniToken.attach(targetFarm.lpToken.address);

    vault = await Vault.deploy(
      targetFarm.lpToken.address,
      targetFarm.name,
      targetFarm.symbol,
      0
    ); console.log(`Vault deployed to ${vault.address}`);

    strategy = await Strategy.deploy(
      targetFarm.lpToken.address,
      targetFarm.pid,
      vault.address,
      pools.treasury,
    ); console.log(`Strategy deployed to ${strategy.address}`);

    await vault.initialize(strategy.address);
    console.log(`Vault initialized`);
  }

  async function massApprove() {
    await approve(user1);
    await approve(user2);
    await approve(user3);
    await approve(user4);
  }

  async function approve(signer) {
    console.log("other approve");
    await targetToken.connect(signer).approve(vault.address, ethers.utils.parseEther("100000000000"));
    console.log("other approved");
  }

  async function advanceTime(amount) {
    await ethers.provider.send("evm_increaseTime", amount);
  }

  async function advanceBlocks(amount) {
    for(let i = 0; i<amount; i++) {
      await ethers.provider.send("evm_mine");
    }
  }

  async function depositAndLog(signer, amount) {
    const signerAddress = await signer.getAddress();
    console.log(`++++++++++${signer}++++++++++++++`);
    let initialTTBalance = await targetToken.balanceOf(signerAddress);
    console.log(`${signerAddress} Target Token Balance: ${initialTTBalance.toString()}`);
    let initialVaultBalance = await vault.balance();
    console.log(`Vault Balance Before Deposit: ${initialVaultBalance.toString()}`);
    let initialShareBalance = await vault.balanceOf(signerAddress);
    console.log(`Share Balance Before Deposit: ${initialBalance.toString()}`);
    let tx = await vault.connect(signer).deposit(amount);
    await tx.wait();
    let vaultBalanceAfter = await vault.balance();
    console.log(`Vault Balance After Deposit: ${vaultBalanceAfter.toString}`);
    let shareBalanceAfter = await vault.balanceOf(signerAddress);
    console.log(`Share Balance After Deposit: ${balanceAfter.toString()}`);
    let ttBalanceAfter = await targetToken.balanceOf(signerAddress);
    console.log(`${signerAddress} Target Token Balance: ${ttBalanceAfter.toString()}`);
    console.log(`++++++++++++++++++++++++++++++++++`);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  await deploy(pools.steakv2.farms[0]);
  console.log(vault.address);
  await massApprove();
  await moneyBoost();
  await moneyBlast(
    spiritswap,
    spiritFactory,
    tokens.ifusd,
    tokens.steak,
    ethers.utils.parseEther("10")
  );
  console.log("4");

  await depositAndLog(user1, ethers.utils.parseEther("10000"));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
