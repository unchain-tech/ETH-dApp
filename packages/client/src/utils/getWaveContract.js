import { ethers } from "ethers";

import abi from "./WavePortal.json"

const contractAddress = "0x3a87963C4C3e0c9C18c770e3d2D9397876eA7f5A";
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
