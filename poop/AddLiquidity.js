const pools = require("../pools.json");
const tokens = require("../tokens.json");
const addresses = require("../TestAddresses.json");

async function main() {

  const self = addresses.self;

  let TestERC20 = await ethers.getContractFactory("TestERC20");
  let Factory = await ethers.getContractFactory("UniswapV2Factory");
  let Router = await ethers.getContractFactory("UniswapV2Router02");
  let WFTM = await ethers.getContractFactory("WrappedFtm");
  let LpToken = await ethers.getContractFactory("UniswapV2ERC20");

  let wftm = await WFTM.attach(addresses.wftm);
  let dai = await TestERC20.attach(addresses.dai);
  let reap = await TestERC20.attach(addresses.reap);
  let router = await Router.attach(addresses.router);
  let factory = await Factory.attach(addresses.factory);

  let lpAddr;

  async function addLiquidity(
    exchange,
    factory,
    tokenOne,
    tokenTwo,
    amountOne,
    amountTwo
  ) {
    lpAddr = await factory.getPair(tokenOne, tokenTwo);
    console.log("Lp Address Before Execution: "+lpAddr);
    if (lpAddr == addresses.zero) {
      await factory.createPair(tokenOne, tokenTwo);
      lpAddr = await factory.getPair(tokenOne, tokenTwo);
    }
    let tok1c = await TestERC20.attach(tokenOne);
    let tok2c = await TestERC20.attach(tokenTwo);
    await tok1c.approve(router.address, ethers.utils.parseEther("10000000000"));
    await tok2c.approve(router.address, ethers.utils.parseEther("10000000000"));
    let bNum = await ethers.provider.getBlockNumber();
    let block = await ethers.provider.getBlock(bNum);
    await router.addLiquidity(
      tokenOne,
      tokenTwo,
      amountOne,
      amountTwo,
      1,
      1,
      self,
      block.timestamp+50
    );
    console.log("liquidity added. LP token address: " +lpAddr);
    let lp = await LpToken.attach(lpAddr);
    let lpBalance = await lp.balanceOf(addresses.self);
    console.log("Current user LP Balance: " +lpBalance.toString());
  }

  await addLiquidity(
    router,
    factory,
    wftm.address,
    dai.address,
    ethers.utils.parseEther("100000"),
    ethers.utils.parseEther("10000")
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
