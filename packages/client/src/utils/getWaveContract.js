import { ethers } from "ethers";

import abi from "./WavePortal.json"

const contractAddress = "0x4f5D963b57F6c6e44d9623F72a4AB808d742CCf8";
const contractABI = abi.abi;

export const getWavePortalContract = (isReadOnly) => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Ethereum object doesn't exist!");
      return;
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const user = isReadOnly? provider : provider.getSigner();
    const wavePortalContract = new ethers.Contract(
      contractAddress,
      contractABI,
      user
   );
   return wavePortalContract;
};
