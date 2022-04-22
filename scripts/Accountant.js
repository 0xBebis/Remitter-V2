const pools = require("../Pools.json");
const tokens = require("../Tokens.json");
const addresses = require("../Addresses.json");
const reaper = require("../src/ReaperSDK.js");
const remit = require("../src/Remitter.js");

async function main() {

  async function logBalances(tokenAddress) {
    console.log(">>>USER BALANCES<<<");
    let selfTestBalance = await testToken.balanceOf(self);
    let metaTestBalance = await testToken.balanceOf(meta);
    let selfAltBalance = await altToken.balanceOf(self);
    let metaAltBalance = await altToken.balanceOf(meta);
    let contractTestBalance = await testToken.balanceOf(remitter.address);
    let contractAltBalance = await altToken.balanceOf(remitter.address);
    console.log("Test self balance: "+selfTestBalance.toString());
    console.log("Test meta balance: "+metaTestBalance.toString());
    console.log("Test contract balance: ")
    console.log("Alt self balance: "+selfAltBalance.toString());
    console.log("Alt meta balance: "+metaAltBalance.toString());
    console.log("Alt contract balance: ")
  }

  let self = "0x8B4441E79151e3fC5264733A3C5da4fF8EAc16c1";
  let meta = "0x688D04DED78e7201a9f7A5026926668dB54E3554";

  let testToken = await reaper.deployTestToken("Test Token", "TEST");
  let altToken = await reaper.deployTestToken("Alt Token", "ALT");
  let timestamp = await reaper.getTimestamp();
  console.log("Timestamp: " +timestamp);
  let remitter = await remit.deployRemitter(self, testToken.address, ethers.utils.parseEther("10000"), timestamp);
  console.log("remitter deployed at: "+remitter.address);
  console.log(">>>>>STATE<<<<<");
  let state = await remit.viewState(remitter.address);
  console.log(state);

  async function logBalances() {
    console.log(">>>USER BALANCES<<<");
    let selfTestBalance = await testToken.balanceOf(self);
    let metaTestBalance = await testToken.balanceOf(meta);
    let selfAltBalance = await altToken.balanceOf(self);
    let metaAltBalance = await altToken.balanceOf(meta);
    let contractTestBalance = await testToken.balanceOf(remitter.address);
    let contractAltBalance = await altToken.balanceOf(remitter.address);
    console.log("Test self balance: "+selfTestBalance.toString());
    console.log("Test meta balance: "+metaTestBalance.toString());
    console.log("Test contract balance: " + contractTestBalance.toString());
    console.log("Alt self balance: "+selfAltBalance.toString());
    console.log("Alt meta balance: "+metaAltBalance.toString());
    console.log("Alt contract balance: " + contractAltBalance.toString());
    console.log("==========================");
  }

  await reaper.mintTestToken(testToken.address, remitter.address, ethers.utils.parseEther("100000000000"));
  await reaper.mintTestToken(altToken.address, remitter.address, ethers.utils.parseEther("100000000000"));
  await logBalances();

  await remit.hire(remitter.address, 1, ethers.utils.parseEther("100"), 0, self, false);
  console.log(">>>>>STATE<<<<<");
  console.log(await remit.viewState(remitter.address));
  console.log(">>>WORKER 1 INFO<<<");
  console.log(await remit.viewWorkerInfo(remitter.address, 1));

  await remit.hire(remitter.address, 2, ethers.utils.parseEther("200"), 0, meta, true)
  console.log(">>>>>STATE<<<<<");
  console.log(await remit.viewState(remitter.address));
  console.log(">>>WORKER 2 INFO<<<");
  console.log(await remit.viewWorkerInfo(remitter.address, 2));

  await logBalances();

  console.log(">>>REMITTING PAYMENT<<<");
  await remit.getPaid(remitter.address);
  await remit.payOut(remitter.address, 2);
  reaper.sleep(10000);
  console.log(">>>PAYMENT REMITTED<<<");

  await logBalances();

  console.log("Timestamp: " +await reaper.getTimestamp());
  await remit.updateMaxSalary(remitter.address, ethers.utils.parseEther("12000"));
  await remit.updateCurrency(remitter.address, altToken.address);
  await remit.toggleAdmin(remitter.address, meta, true);

  console.log("is Meta admin? "+ await remitter.isAdmin(meta));

  console.log(">>>>>STATE<<<<<");
  console.log(await remit.viewState(remitter.address));

  console.log(">>>TESTING ADMIN API<<<");
  console.log("Timestamp: " +await reaper.getTimestamp());
  console.log(">>>PAYOUT<<<");
  await remit.payOut(remitter.address, 2);
  console.log("Timestamp: " +await reaper.getTimestamp());

  await logBalances();

  await remit.updateSalary(remitter.address, 2, ethers.utils.parseEther("1"));
  console.log(">>>WORKER 2 INFO<<<");
  console.log(await remit.viewWorkerInfo(remitter.address, 2));

  console.log("Timestamp: " +await reaper.getTimestamp());
  reaper.sleep(10000);
  console.log("Timestamp: " +await reaper.getTimestamp());
  console.log(">>>TERMINATE<<<");
  await remit.terminate(remitter.address, 2);
  console.log("is Meta admin? "+ await remitter.isAdmin(meta));
  console.log("Timestamp: " +await reaper.getTimestamp());

  await logBalances();

  console.log("Timestamp: " +await reaper.getTimestamp());
  console.log(">>>WORKER 2 INFO<<<");
  console.log(await remit.viewWorkerInfo(remitter.address, 2));
  console.log(">>>>>STATE<<<<<");
  console.log(await remit.viewState(remitter.address));

  await logBalances();


  console.log(">>>TESTING USER API<<<")

  console.log(">>>WORKER 1 INFO<<<");
  console.log(await remit.viewWorkerInfo(remitter.address, 1));

  console.log(">>>WORKER 2 INFO<<<");
  console.log(await remit.viewWorkerInfo(remitter.address, 2));
}

  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
