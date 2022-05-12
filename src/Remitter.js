const tokens = require("../Tokens.json");
const addresses = require("../Addresses.json");

async function deployRemitter(nativeToken, defaultAuth, maxSalary) {
  let Remitter = await ethers.getContractFactory("Remitterv2");
  let remitter = await Remitter.deploy(nativeToken, defaultAuth, maxSalary);
  return remitter;
}

async function getRemitter(remitterAddress) {
  let Remitter = await ethers.getContractFactory("Remitterv2");
  let remitter = await Remitter.attach(remitterAddress);
  return remitter;
}

async function addCredit(remitterAddress, contractorId, amount) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.addCredit(contractorId, amount);
  let receipt = await tx.wait();
  return receipt;
}

async function addDebit(remitterAddress, contractorId, amount) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.addDebit(contractorId, amount);
  let receipt = await tx.wait();
  return receipt;
}

async function payCredit(remitterAddress, contractorId, amount) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.payCredit(contractorId, amount);
  let receipt = await tx.wait();
  return receipt;
}

async function sendPayment(remitterAddress, contractorId, to, amount) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.sendPayment(contractorId, to, amount);
  let receipt = await tx.wait();
  return receipt;
}

async function checkAuthorization(remitterAddress, contractorId) {
  let remitter = await getRemitter(remitterAddress);
  return (await remitter.checkAuthorization(contractorId)).toString();
}

async function addAuthorizedPayment(remitterAddress, contractorId, amount) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.addAuthorizedPayment(contractorId, amount);
  let receipt = await tx.wait();
  return receipt;
}

async function updateState(remitterAddress, contractorIds) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.updateState(contractorIds);
  let receipt = await tx.wait();
  return receipt;
}

async function maxPayable(remitterAddress, contractorId) {
  let remitter = await getRemitter(remitterAddress);
  return (await remitter.maxPayable(contractorId)).toString();
}

async function owedSalary(remitterAddress, contractorId) {
  let remitter = await getRemitter(remitterAddress);
  let data = await remitter.owedSalary(contractorId);
  return {
    "salary": data[0],
    "cycles": data[1]
  }
}

async function addContractor(remitterAddress, name, walletAddress, perCycle, startingCycle) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.addContractor(name, walletAddress, perCycle, startingCycle);
  let receipt = await tx.wait();
  return receipt;
}

async function terminateContractor(remitterAddress, contractorId) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.terminateContractor(contractorId);
  let receipt = await tx.wait();
  return receipt;
}

async function changeName(remitterAddress, contractorId, newName) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.changeName(contractorId, newName);
  let receipt = await tx.wait();
  return receipt;
}

async function changeWallet(remitterAddress, contractorId, newWallet) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.changeWallet(contractorId, newWallet);
  let receipt = await tx.wait();
  return receipt;
}

async function changeSalary(remitterAddress, contractorId, newSalary) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.changeSalary(contractorId, newSalary);
  let receipt = await tx.wait();
  return receipt;
}

async function changeStartingCycle(remitterAddress, contractorId, newStart) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.changeStartingCycle(contractorId, newStart);
  let receipt = await tx.wait();
  return receipt;
}

async function authorizeAgent(remitterAddress, contractorId, walletAddress, authorize) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.authorizeAgent(contractorId, walletAddress, authorize);
  let receipt = await tx.wait();
  return receipt;
}

async function advanceCycle(remitterAddress) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.advanceCycle(contractorId);
  let receipt = await tx.wait();
  return receipt;
}

async function setDefaultAuth(remitterAddress, defaultAuth) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.setDefaultAuth(defaultAuth);
  let receipt = await tx.wait();
  return receipt;
}

async function setMaxSalary(remitterAddress, maxSalary) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.setMaxSalary(maxSalary);
  let receipt = await tx.wait();
  return receipt;
}

async function setAdmin(remitterAddress, walletAddress, isAdmin) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.setAdmin(walletAddress, isAdmin);
  let receipt = await tx.wait();
  return receipt;
}

async function setSuperAdmin(remitterAddress, walletAddress, isSuperAdmin) {
  let remitter = await getRemitter(remitterAddress);
  let tx = await remitter.setSuperAdmin(contractorId, walletAddress, isSuperAdmin);
  let receipt = await tx.wait();
  return receipt;
}

async function viewContractor(remitterAddress, contractorId) {
  let remitter = await getRemitter(remitterAddress);
  let data = await remitter.contractors(contractorId);
  return {
    "name": data[0],
    "wallet": data[1],
    "perCycle": data[2],
    "startingCycle": data[3],
    "cyclesPaid": data[4]
  }
}

async function getId(remitterAddress, walletAddress) {
  let remitter = await getRemitter(remitterAddress);
  let data = await remitter.getId(walletAddress);
  return data;
}

async function viewState(remitterAddress) {
  let remitter = await getRemitter(remitterAddress);
  return {
    "totalPayroll": await remitter.totalPayroll(),
    "totalPendingCredits": await remitter.totalPendingCredits(),
    "totalPendingDebits": await remitter.totalPendingDebits(),
    "totalCredits": await remitter.totalCredits(),
    "totalDebits": await remitter.totalDebits(),
    "totalWorkers": await remitter.totalWorkers(),
    "maxSalary": await remitter.maxSalary(),
    "nonce": await remitter.nonce(),
    "cycleCount": await remitter.cycleCount(),
    "defaultAuth": await remitter.defaultAuth()
  }
}

module.exports = {
  deployRemitter,
  getRemitter,
  addCredit,
  addDebit,
  payCredit,
  sendPayment,
  checkAuthorization,
  addAuthorizedPayment,
  updateState,
  maxPayable,
  owedSalary,
  addContractor,
  changeName,
  changeWallet,
  changeSalary,
  changeStartingCycle,
  authorizeAgent,
  advanceCycle,
  setDefaultAuth,
  setMaxSalary,
  setAdmin,
  setSuperAdmin,
  viewContractor,
  getId,
  viewState
}
