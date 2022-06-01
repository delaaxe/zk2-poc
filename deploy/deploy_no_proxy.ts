import { utils, Wallet, Provider } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

const logBalance = async (address: string, provider: Provider) => {
  const balance = await provider.getBalance(address);
  console.log(
    `${address} ETH L2 balance is ${ethers.utils.formatEther(balance)}`
  );
};

export default async function (hre: HardhatRuntimeEnvironment) {
  // Initialize the wallet
  const signer = new Wallet(process.env.PRIVATE_KEY as string);
  const signerAddress = await signer.getAddress();
  console.log(`Signer address is ${signerAddress}`);

  // Create deployer object and load the artifact of the contract we want to deploy.
  const deployer = new Deployer(hre, signer);
  const accountArtifact = await deployer.loadArtifact("ArgentAccountNoProxy");
  const { provider } = deployer.zkWallet;

  const account1 = await deployer.deploy(accountArtifact, [signerAddress]);
  console.log(`Account 1 was deployed to ${account1.address}`);

  const account2 = await deployer.deploy(accountArtifact, [
    "0x3274aAb2ebBF7F397d08EAaA89880426Dd3daAdD",
  ]);
  console.log(`Account 2 was deployed to ${account2.address}`);

  // Transfer from signer to account 1
  const transferHandle = await deployer.zkWallet.transfer({
    to: account1.address,
    amount: ethers.utils.parseEther("0.0001"),
  });
  await transferHandle.wait();

  await logBalance(account1.address, provider);
  await logBalance(account2.address, provider);

  // Interact with account 1 (transfer to account 2)
  const calldata = utils.IERC20.encodeFunctionData("transfer", [
    account2.address,
    ethers.utils.parseEther("0.00002365"),
  ]);
  const executeHandle = await account1.execute(utils.ETH_ADDRESS, calldata);
  await executeHandle.wait();

  await logBalance(account1.address, provider);
  await logBalance(account2.address, provider);
}
