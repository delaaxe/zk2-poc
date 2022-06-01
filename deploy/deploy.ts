import { utils, Wallet, Contract, Provider } from "zksync-web3";
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
  const accountArtifact = await deployer.loadArtifact("ArgentAccount");
  const proxyArtifact = await deployer.loadArtifact("Proxy");
  const { provider } = deployer.zkWallet;

  const accountInterface = new ethers.utils.Interface(accountArtifact.abi);

  // Deploy ArgentAccount implementation
  const accountContract = await deployer.deploy(accountArtifact, []);
  const implementation = accountContract.address;
  console.log(`Account Implementation was deployed to ${implementation}`);

  const initdata = (signer: string) =>
    accountInterface.encodeFunctionData("initialize", [signer]);

  // Deploy Proxy accounts
  const proxy1 = await deployer.deploy(proxyArtifact, [
    implementation,
    initdata(signerAddress),
  ]);
  console.log(`Proxy 1 was deployed to ${proxy1.address}`);
  const proxy2 = await deployer.deploy(proxyArtifact, [
    implementation,
    initdata("0x3274aAb2ebBF7F397d08EAaA89880426Dd3daAdD"),
  ]);
  console.log(`Proxy 2 was deployed to ${proxy2.address}`);

  // Transfer from signer to account 1
  const transferHandle = await deployer.zkWallet.transfer({
    to: proxy1.address,
    amount: ethers.utils.parseEther("0.0001"),
  });
  await transferHandle.wait();

  await logBalance(proxy1.address, provider);
  await logBalance(proxy2.address, provider);

  // Interact with account 1 (transfer to account 2)
  const account1 = new Contract(
    proxy1.address,
    accountArtifact.abi,
    deployer.zkWallet
  );
  const calldata = utils.IERC20.encodeFunctionData("transfer", [
    proxy2.address,
    ethers.utils.parseEther("0.00002365"),
  ]);
  const executeHandle = await account1.execute(utils.ETH_ADDRESS, calldata);
  await executeHandle.wait();

  await logBalance(proxy1.address, provider);
  await logBalance(proxy2.address, provider);
}
