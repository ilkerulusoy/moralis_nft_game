const Token = artifacts.require("Token");

module.exports = async function (deployer) {
  await deployer.deploy(Token, "NFT GAME", "NFTG");
  let tokenInstance = await Token.deployed();
  await tokenInstance.mint(100,200,100000);
  await tokenInstance.mint(101,200,1000);
  await tokenInstance.mint(102,200,200);
  await tokenInstance.mint(103,200,200);
  await tokenInstance.mint(104,200,100);
  await tokenInstance.mint(105,200,100);
  await tokenInstance.mint(106,200,100);
  //await tokenInstance.mint(200,200,100000);
  //await tokenInstance.mint(300,200,100000);
  //await tokenInstance.mint(400,200,100000);
  let pet = await tokenInstance.getTokenDetails(0);
  console.log(pet);
  await tokenInstance.feed(0);
  let pet2 = await tokenInstance.getTokenDetails(0);
  console.log(pet2);
};
