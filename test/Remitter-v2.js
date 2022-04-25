const { expect } = require("chai");
const { ethers } = require("hardhat");

let remitter;
let usdc;
let superAdmin, admin, emp1;

describe('Remitter-v2', function () {
  beforeEach(async function () {
    [superAdmin, admin, emp1] = await ethers.getSigners();

    const USDC = await ethers.getContractFactory('TestToken');
    usdc = await USDC.deploy();

    const Remitter = await ethers.getContractFactory('Remitterv2');
    remitter = await Remitter.deploy(usdc.address, 5000, 10000);
    await remitter.deployed();

    await usdc.transfer(remitter.address, 1_000_000);
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
    await remitter.addContractor(999, "bebis", emp1.address, 6000, 0);

    const totalWorkers = await remitter.totalWorkers();
    expect(totalWorkers).to.equal(1);

    const name = (await remitter.contractors(999)).name;
    expect(name).to.equal("bebis");

    var owedSalary = (await remitter.owedSalary(999))[0];
    expect(owedSalary).to.equal(0);
    await expect(remitter.advanceCycle()).to.emit(remitter, 'AdvanceCycle').withArgs(0, 0, 0, 1);
    owedSalary = (await remitter.owedSalary(999))[0];
    expect(owedSalary).to.equal(6000);
    await expect(remitter.advanceCycle()).to.emit(remitter, 'AdvanceCycle').withArgs(1, 0, 0, 1);
    owedSalary = (await remitter.owedSalary(999))[0];
    expect(owedSalary).to.equal(12000);

    await remitter.connect(emp1).makePayment(999, emp1.address, 9000);
    const balance = await usdc.balanceOf(emp1.address);
    expect(balance).to.equal(9000);
    await expect(remitter.advanceCycle()).to.emit(remitter, 'AdvanceCycle').withArgs(2, 12000, 9000, 1);
    await remitter.connect(emp1).makePayment(999, emp1.address, 9000);
    await expect(remitter.connect(emp1).makePayment(999, emp1.address, 1)).to.be.reverted;
  })
})
