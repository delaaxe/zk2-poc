import { utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

export default async function (hre: HardhatRuntimeEnvironment) {
  // Initialize the wallet
  const signer = new Wallet(process.env.PRIVATE_KEY as string);
  const signerAddress = await signer.getAddress();
  console.log(`Signer address is ${signerAddress}`);

  // Create deployer object
  const deployer = new Deployer(hre, signer);

  // deployer.zkWallet is the signer connected to L1 and L2 providers

  const l1Balance = await deployer.zkWallet.getBalanceL1();
  console.log(`ETH L1 balance is ${ethers.utils.formatEther(l1Balance)}`);

  const l2Balance = await deployer.zkWallet.getBalance();
  console.log(`ETH L2 balance is ${ethers.utils.formatEther(l2Balance)}`);

  const depositAmount = ethers.utils.parseEther("0.001");
  const depositHandle = await deployer.zkWallet.deposit({
    to: deployer.zkWallet.address,
    token: utils.ETH_ADDRESS,
    amount: depositAmount,
  });
  console.log(`L1 deposit tx_hash is ${depositHandle.hash}`);
  await depositHandle.wait();
}
