const pools = require("../pools.json");
const tokens = require("../tokens.json");

async function main() {

  let self = "0x8B4441E79151e3fC5264733A3C5da4fF8EAc16c1";
  let spookyFactory = "0x5D479c2a7FB79E12Ac4eBBAeDB0322B4d5F9Fd02";
  let spookyRouter = "0xcCAFCf876caB8f9542d6972f87B5D62e1182767d";

  let provider = new ethers.providers.JsonRpcProvider("https://rpc.ftm.tools");

  let WFTM = await ethers.getContractFactory("WrappedFtm");
  let SteakHouseV2 = await ethers.getContractFactory("SteakHouseV2");
  let TestERC20 = await ethers.getContractFactory("TestERC20");
  let UniFactory = await ethers.getContractFactory("UniswapV2Factory");
  let UniRouter = await ethers.getContractFactory("UniswapV2Router02");
  let UniToken = await ethers.getContractFactory("UniswapV2ERC20");
  //let ChefToken = await ethers.getContractFactory("ReaperToken");

  let router = UniRouter.attach(spookyRouter);
  let factory = UniFactory.attach(spookyFactory);
  //let reaperToken = await ethers.getContract("ReaperToken");

  let wftm = await WFTM.attach("0x31b0a9047C633f622cd107F53C95495D6aaC52C0");
  let dai = await TestERC20.attach("0xc5092e9855f7790bD47388b084EffA46503a7696");
  let rp3r = await TestERC20.attach("0x8fc134b89a92a816A33116fD3ACff6f5849F64ff");
  let rp3rwftmlp = await UniToken.attach("0x4116a9ac8821441d6B286c5d9058E725e5942628");
  let chef = await MasterChef.attach("0x2FcE2a13039E4abCc4dD1938F99Cdd40935A80B5");

  await dai.mint(self, ethers.utils.parseEther("1000000000"));
  await rp3r.mint(self, ethers.utils.parseEther("300000000"));
  await wftm.mint(self, ethers.utils.parseEther("4000000000"));

  let daiBalance = await dai.balanceOf(self);
  let rp3rBalance = await rp3r.balanceOf(self);
  let wftmBalance = await wftm.balanceOf(self);

  console.log("dai balance " +daiBalance);
  console.log("rp3r balance " +rp3rBalance);
  console.log("wftm balance " +wftmBalance);

  let block = await provider.getBlock();

  let chef = await SteakHouseV2.deploy([rp3r.address], [ethers.utils.parseEther("1")], 1626199439);

  console.log("chef " +chef.address);

  let tx = await factory.createPair(wftm.address, rp3r.address);
  await tx.wait();
  let pairAddress = await factory.getPair(wftm.address, rp3r.address);
  console.log("pairAddress: " +pairAddress);

  await addLiquidity(
    router,
    factory,
    pairAddress,
    wftm.address,
    rp3r.address,
    ethers.utils.parseEther("100000"),
    ethers.utils.parseEther("10000")
  );

  await chef.add(500, pairAddress);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
