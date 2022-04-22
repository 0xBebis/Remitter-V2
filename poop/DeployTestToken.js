const pools = require("../pools.json");
const tokens = require("../tokens.json");
const addresses = require("../TestAddresses.json");

async function main() {

  let self = "0x8B4441E79151e3fC5264733A3C5da4fF8EAc16c1";

  let TestToken = await ethers.getContractFactory("TestERC20");

  async function deployTestToken(name, symbol) {
    let token = await TestToken.deploy(name, symbol);
    await token.wait();
    return token.address;
  }

  async function mint(tokenAddress, userAddress, amount) {
    let token = await TestToken.attach(tokenAddress);
    let tx = await token.mint(user, amount);
    let receipt = await tx.wait();
    return receipt;
  }

  async function getUserBalance(tokenAddress, userAddress) {
    let token = await TestToken.attach(tokenAddress);
    let balance = await token.balanceOf(userAddress);
    return balance;
  }

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
