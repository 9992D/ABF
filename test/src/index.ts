import { ethers } from "ethers";
import EthereumDIDRegistry from "./EthereumDIDRegistry.json";
import dotenv from "dotenv";

dotenv.config();

const registryAddress = "0x45140949d84F25dfb6dFc8659E95A258cc3b6648";

// Define the provider
const provider = new ethers.providers.JsonRpcProvider(process.env.GANACHE_RPC_URL ?? "");

// Define the signer
const signer = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

// Create the contract instance
const DidReg = new ethers.Contract(registryAddress, EthereumDIDRegistry.abi, signer);


(async () => {
  // get chain id
  const chainId = await provider.getNetwork();
  console.log("chainId: ", chainId);
  // get identity owner
  const identityOwner = await DidReg.identityOwner(signer.address);
  console.log("identityOwner: ", identityOwner);
})();
