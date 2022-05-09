const pools = require("../Pools.json");
const tokens = require("../Tokens.json");
const addresses = require("../Addresses.json");
const reaper = require("../src/ReaperSDK.js");
const remit = require("../src/Remitter.js");
const { workers } = require("../src/workers.js");

async function main() {

  let testToken = await ethers.getContractFactory("TestToken");
  console.log(testToken.address);
  reaper.sleep(10000);

  let remitter = await remit.deployRemitter(
    "0x8B4441E79151e3fC5264733A3C5da4fF8EAc16c1",
    testToken.address,
    ethers.utils.parseEther("4000"),
    ethers.utils.parseEther("12000")
  );
  reaper.sleep(20000);

  console.log(remitter.address);

  await reaper.mintTestToken(testToken.address, remitter.address, ethers.utils.parseEther("10450000"));
  reaper.sleep(20000);

  for (let i=0; i<workers.length; i++) {
    await remit.hire(
      remitter.address,
      workers[i].id,
      ethers.utils.parseEther(halfSalary),
      0,
      workers[i].address,
      true
    );
    let workerInfo = await remit.viewWorkerInfo(remitter.address, workers[i].id);
    console.log(">>>WORKER INFO<<<" +workers[i].id);
    console.log(workerInfo);
    let state = await remit.viewState(remitter.address);
    console.log(">>>STATE<<<" +workers[i].id);
    console.log(state);
    reaper.sleep(30000);
  }

  await remit.changeSuperAdmin(remitter.address, "0x111731A388743a75CF60CCA7b140C58e41D83635");

}

  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
