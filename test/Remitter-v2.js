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
  })

  it('Getters', async function() {
    const currency = await remitter.native();
    const defaultAuth = await remitter.defaultAuth();
    const maxSalary = await remitter.maxSalary();
    expect(currency).to.equal(usdc.address);
    expect(defaultAuth.eq(5000)).to.equal(true);
    expect(maxSalary.eq(10000)).to.equal(true);
  })
})
