const pools = require("../pools.json");
const tokens = require("../tokens.json");
const addresses = require("../TestAddresses.json");

async function main() {

  let self = addresses.self;

  let WFTM = await ethers.getContractFactory("WrappedFtm");
  let MasterChef = await ethers.getContractFactory("MasterChef");
  let TestERC20 = await ethers.getContractFactory("TestERC20");
  let Factory = await ethers.getContractFactory("UniswapV2Factory");
  let Router = await ethers.getContractFactory("UniswapV2Router02");
  let LpToken = await ethers.getContractFactory("UniswapV2ERC20");
  //let ChefToken = await ethers.getContractFactory("ReaperToken");

  async function getPoolInfo(chefAddress, pid) {
    let chef = await MasterChef.attach(chefAddress);
    let poolInfo = await chef.poolInfo(pid);
    return poolInfo;
  }

  async function getPoolLength(chefAddress) {
    let chef = await MasterChef.attach(chefAddress);
    let length = await chef.poolLength();
    return length;
  }

  let infoOne = await getPoolInfo(addresses.testChef, 0);
  let infoTwo = await getPoolInfo(addresses.testChef, 1);
  let length = await getPoolLength(addresses.testChef);

  console.log(infoOne);
  console.log(infoTwo);
  console.log(length);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
