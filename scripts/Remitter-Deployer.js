const pools = require("../Pools.json");
const tokens = require("../Tokens.json");
const addresses = require("../Addresses.json");
const reaper = require("../src/ReaperSDK.js");
const remit = require("../src/Remitter.js");
const { workers } = require("../src/workers.js");

async function main() {

  let testToken = await reaper.deployTestToken("Test United States Dollar Coin", "tUSDC", 6);

  console.log(testToken.address);
  reaper.sleep(10000);

  let remitter = await remit.deployRemitter(
    testToken.address,
    ethers.utils.parseUnits("4000", 6),
    ethers.utils.parseUnits("12000", 6)
  );
  reaper.sleep(5000);

  console.log(remitter.address);

  await reaper.mintTestToken(testToken.address, remitter.address, ethers.utils.parseUnits("10450000", 6));
  reaper.sleep(5000);

  for (let i=0; i<workers.length; i++) {
    await remit.addContractor(
      remitter.address,
      workers[i].name,
      workers[i].wallet,
      ethers.utils.parseUnits((workers[i].pay).toString(), 6),
      0,
    );
    let workerInfo = await remit.viewContractor(remitter.address, await remit.getId(remitter.address, workers[i].wallet));
    console.log(">>>WORKER INFO<<<" +workers[i].name);
    console.log(workerInfo);
    let state = await remit.viewState(remitter.address);
    console.log(">>>STATE<<<" +workers[i].name);
    console.log(state);
    reaper.sleep(5000);
  }
}

  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
