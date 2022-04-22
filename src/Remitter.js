const tokens = require("../tokens.json");
const addresses = require("../Addresses.json");

async function deployRemitter(superAdmin, currencyAddress, maxSalary, firstPayDay) {
  let Remitter = await ethers.getContractFactory("RemitterFlattened");
  let remitter = await Remitter.deploy(superAdmin, currencyAddress, maxSalary, firstPayDay);
  return remitter;
}

async function getRemitter(remitterAddress) {
  let Remitter = await ethers.getContractFactory("RemitterFlattened");
  let remitter = await Remitter.attach(remitterAddress);
  return remitter;
}

async function getPaid(remitterAddress) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.getPaid();
  let receipt = await tx.wait();
  return receipt;
}

async function payOut(remitterAddress, workerId) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.payOut(workerId);
  let receipt = await tx.wait();
  return receipt;
}

async function viewState(remitterAddress) {
  let remitter = await getRemitter(remitterAddress);
  let cycle = await remitter.cycle();
  let cycleCount = await remitter.cycleCount();
  let startTime = await remitter.startTime();
  let totalPayroll = await remitter.totalPayroll();
  let totalReimbursements = await remitter.totalReimbursements();
  let totalWorkers = await remitter.totalWorkers();
  let maxSalary = await remitter.maxSalary();
  let currency = await remitter.currency();
  return {
    "cycleTime": cycle.toString(),
    "cycleCount": cycleCount.toString(),
    "startTime": startTime.toString(),
    "totalPayroll": totalPayroll.toString(),
    "totalReimbursements": totalReimbursements.toString(),
    "totalWorkers": totalWorkers.toString(),
    "maxSalary": maxSalary.toString(),
    "currency": currency
  }
}

async function viewWorkerInfo(remitterAddress, employeeId) {
  let remitter = await getRemitter(remitterAddress);
  let workerInfo = await remitter.workerInfo(employeeId);
  return {
    "salary": workerInfo[0].toString(),
    "reimbursements": workerInfo[1].toString(),
    "startingCycle": workerInfo[2].toString(),
    "cyclesPaid": workerInfo[3].toString(),
    "wallet": workerInfo[4],
    "adminCanRemit": workerInfo[5]
  }
}

async function hire(
  remitterAddress,
  workerId,
  salary,
  startingCycle,
  walletAddress,
  adminCanRemit
) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.hire(
    workerId,
    salary,
    startingCycle,
    walletAddress,
    adminCanRemit
  );
  let receipt = await tx.wait();
  return receipt;
}

async function terminate(remitterAddress, workerId) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.terminate(workerId);
  let receipt = await tx.wait();
  return receipt;
}

async function updateCycle(remitterAddress, newCycle) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.updateCycle(newCycle);
  let receipt = await tx.wait();
  return receipt;
}

async function updateMaxSalary(remitterAddress, newMax) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.updateMaxSalary(newMax);
  let receipt = await tx.wait();
  return receipt;
}

async function updateCurrency(remitterAddress, newCurrency) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.updateCurrency(newCurrency);
  let receipt = await tx.wait();
  return receipt;
}

async function toggleAdmin(remitterAddress, walletAddress, status) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.toggleAdmin(walletAddress, status);
  let receipt = await tx.wait();
  return receipt;
}

async function changeSuperAdmin(remitterAddress, newSuperAdmin) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.changeSuperAdmin(newSuperAdmin);
  let receipt = await tx.wait();
  return receipt;
}

async function toggleAdminRemittancePermission(remitterAddress, canRemit) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.toggleAdminRemittancePermission(canRemit);
  let receipt = await tx.wait();
  return receipt;
}

async function updateSalary(remitterAddress, workerId, newSalary) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.updateSalary(workerId, newSalary);
  let receipt = await tx.wait();
  return receipt;
}

module.exports = {
  deployRemitter,
  getRemitter,
  viewWorkerInfo,
  viewState,
  getPaid,
  payOut,
  hire,
  getRemitter,
  terminate,
  updateCycle,
  updateMaxSalary,
  updateCurrency,
  toggleAdmin,
  changeSuperAdmin,
  toggleAdminRemittancePermission,
  updateSalary
}
