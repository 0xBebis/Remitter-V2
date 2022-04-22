const pools = require("../pools.json");
const tokens = require("../tokens.json");
const addresses = require("../TestAddresses.json");

async function main() {

  let MasterChef = await ethers.getContractFactory("MasterChef");
  let LpToken = await ethers.getContractFactory("UniswapV2ERC20");
  let ReturnContract = await ethers.getContractFactory("IERC20Return");

  async function addFarm(chefAddress, targetToken, allocation) {
    let chef = await MasterChef.attach(chefAddress);
    const tx = await chef.add(allocation, targetToken);
    let receipt = await tx.wait();
    return receipt;
  }

  async function depositToFarm(chefAddress, targetToken, pid, amount) {
    let chef = await MasterChef.attach(chef);
    let lp = await LpToken.attach(targetToken);
    let approval = await lp.approve(chefAddress, ethers.utils.parseEther("100000000"));
    await approval.wait();
    let tx = await chef.deposit(pid, amount);
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
