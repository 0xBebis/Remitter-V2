const { expect } = require("chai");
const { ethers } = require("hardhat");

let remitter;
let usdc;
let superAdmin, admin, emp1;

describe('Remitter-v2', function () {
  beforeEach(async function () {
    [superAdmin, admin, emp1] = await ethers.getSigners();

    const USDC = await ethers.getContractFactory('TestToken');
    usdc = await USDC.deploy('USDC', 'USDC', 6);

    const Remitter = await ethers.getContractFactory('Remitterv2');
    remitter = await Remitter.deploy(usdc.address, 5000, 10000);

    await usdc.transfer(remitter.address, 1_000_000);

    await remitter.setAdmin(admin.address, true);
  })

  it('Getters', async function() {
    const currency = await remitter.native();
    const defaultAuth = await remitter.defaultAuth();
    const maxSalary = await remitter.maxSalary();
    expect(currency).to.equal(usdc.address);
    expect(defaultAuth.eq(5000)).to.equal(true);
    expect(maxSalary.eq(10000)).to.equal(true);
  })

  it('One contractor', async function() {
    await remitter.addContractor("bebis", emp1.address, 6000, 0);
    const id = await remitter.getId(emp1.address);

    const totalWorkers = await remitter.totalWorkers();
    expect(totalWorkers).to.equal(1);

    const name = (await remitter.contractors(id)).name;
    expect(name).to.equal("bebis");

    let owedSalary = (await remitter.owedSalary(id))[0];
    expect(owedSalary).to.equal(0);
    await expect(remitter.advanceCycle()).to.emit(remitter, 'AdvanceCycle').withArgs(0, 0, 0, 1);
    owedSalary = (await remitter.owedSalary(id))[0];
    expect(owedSalary).to.equal(6000);
    await remitter.updateState([id]);
    await expect(remitter.advanceCycle()).to.emit(remitter, 'AdvanceCycle').withArgs(1, 6000, 0, 1);
    owedSalary = (await remitter.owedSalary(id))[0];
    expect(owedSalary).to.equal(6000);

    await remitter.connect(emp1).sendPayment(id, emp1.address, 9000);
    const balance = await usdc.balanceOf(emp1.address);
    expect(balance).to.equal(9000);
    await expect(remitter.advanceCycle()).to.emit(remitter, 'AdvanceCycle').withArgs(2, 12000, 9000, 1);
    await remitter.connect(emp1).sendPayment(id, emp1.address, 9000);
    await expect(remitter.connect(emp1).sendPayment(id, emp1.address, 1)).to.be.reverted;

    await remitter.connect(admin).addCredit(id, 2500);
    await remitter.connect(admin).addCredit(id, 2500);
    await expect(remitter.connect(admin).addCredit(id, 1)).to.be.reverted;
  })
})
