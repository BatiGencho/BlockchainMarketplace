var Ownable = artifacts.require("./Ownable.sol");           //contract
var Destructible = artifacts.require("./Destructible.sol"); //contract
var SafeMath = artifacts.require("./SafeMath.sol");         //lib
var ProductLib = artifacts.require("./ProductLib.sol");     //lib
var MarketplaceI = artifacts.require("./MarketplaceI.sol"); //AC
var HelperFuncs = artifacts.require("./HelperFuncs.sol");   //lib
var Marketplace = artifacts.require("./Marketplace.sol");   //lib

module.exports = function(deployer) {
  deployer.deploy(Ownable);       //C
  deployer.deploy(Destructible);  //C
  //deployer.deploy(MarketplaceI);//C
  deployer.deploy(SafeMath);      //lib
  deployer.deploy(ProductLib);    //lib
  deployer.deploy(HelperFuncs);   //lib

  deployer.link(SafeMath, ProductLib);
  deployer.link(SafeMath, Marketplace);
  deployer.link(ProductLib, Marketplace);
  deployer.link(HelperFuncs, Marketplace);

  deployer.deploy(Marketplace);   //C
};
