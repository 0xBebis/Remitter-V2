const pools = require("../pools.json");
const tokens = require("../tokens.json");

async function main() {

  let Factory = await ethers.getContractFactory("UniswapV2Factory");
  let Router = await ethers.getContractFactory("UniswapV2Router02");
  let TestERC20 = await ethers.getContractFactory("TestERC20");
  let WFTM = await ethers.getContractFactory("WrappedFtm");

  async function createRoute(tokenInput, tokenOutput) {
    if (tokenInput === tokens.wftm || tokenOutput === tokens.wftm) {
      return [tokenInput, tokenOutput]
    } else {
      return [tokenInput, tokens.wftm, tokenOutput]
    }
  }

  async function swap(
    routerAddress,
    tokenInput,
    tokenOutput,
    toAddress,
    amount
  ) {
    let exchange = await Router.attach(exchangeAddress)
    let input = await TestERC20.attach(tokenInput);
    let output = await TestERC20.attach(tokenOutput);
    let timestamp = await getTimestamp();
    let route = await createRoute(tokenInput, tokenOutput);
    await input.approve(routerAddress, ethers.utils.parseEther("100000000000000"));
    await output.approve(routerAddress, ethers.utils.parseEther("100000000000000"));
    let tx = await exchange.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      amountIn,
      0,
      route,
      toAddress,
      timestamp+60;
    );
    let receipt = await tx.wait();
    return receipt;
  }



}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
