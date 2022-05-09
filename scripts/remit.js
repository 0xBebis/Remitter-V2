const pools = require("../Pools.json");
const tokens = require("../Tokens.json");
const addresses = require("../Addresses.json");
const reaper = require("../src/ReaperSDK.js");
const remit = require("../src/Remitter.js");
const { workers } = require("../src/Workers.js");

async function main() {

  let usdc = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";
  let oath = "0x21ada0d2ac28c3a5fa3cd2ee30882da8812279b6";
  let self = "0x8B4441E79151e3fC5264733A3C5da4fF8EAc16c1";


  async function logBalance(tokenContract) {
    let balance = await tokenContract.balanceOf(self);
    console.log(balance.toString());
  }
  let usdcContract = await reaper.createContract("ERC20", usdc);
  let oathContract = await reaper.createContract("ERC20", oath);

  for(let i=3; i<workers.length; i++) {
    console.log(workers[i].name);
    if (workers[i].pay > 0) {
      let amount = workers[i].pay + workers[i].reimbursement;
      let tx = await usdcContract.transfer(workers[i].wallet, ethers.utils.parseUnits(amount.toString(), 6), { gasPrice: 400000000000 });
      await tx.wait();
      await logBalance(usdcContract);
      reaper.sleep(20000);
    }
    /*if (workers[i].oath > 0) {
      let amount = workers[i].oath * 4;
      let tx = await oathContract.transfer(workers[i].oathWallet, ethers.utils.parseEther(amount.toString()), { gasPrice: 400000000000 });
      await tx.wait();
      await logBalance(oathContract);
      reaper.sleep(20000);
    }*/
  }
}

  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
