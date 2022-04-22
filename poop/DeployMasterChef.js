const pools = require("../pools.json");
const tokens = require("../tokens.json");
const addresses = require("../TestAddresses.json");

async function main() {

  async function getTimeStamp() {
    let bNum = await ethers.provider.getBlockNumber();
    let block = await ethers.provider.getBlock(bNum);
    return block.timestamp;
  }

  async function deployMasterChef(adminAddress, emissionsPerSecond, startTime) {
    let chef = await MasterChef.deploy(
      adminAddress,
      emissionsPerSecond,
      startTime
    );
    return chef.address;
  }

  async function initialize(chefAddress, rewardAddress) {
    let chef = MasterChef.attach(chefAddress);
    let tx = await chef.initialize(rewardAddress);
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
