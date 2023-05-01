import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button,
  useNFTDropContractAddress,
  MediaRenderer

} from "@thirdweb-dev/react";
import { NFTCollection } from "@thirdweb-dev/sdk";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import NFTCard from "../components/NFTCard";
import {
  nftDropAddress,
  stakingContractAddress,
  tokenContractAddress,
} from "../consts/contactAddresses";
import styles from "../styles/Home.module.css";

const Stake: NextPage = () => {
  const address = useAddress();
  const { contract: useNFTCollection } = useContract(
    nftDropAddress,
    "nft-collection"
  );
  const { contract: tokenContract } = useContract(
    tokenContractAddress,
    "token"
  );
  const { contract, isLoading } = useContract(stakingContractAddress);
  const { data: ownedNfts } = useOwnedNFTs(useNFTDropContractAddress, address);
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  const { data: stakedTokens } = useContractRead(
    contract,
    "getStakeInfo",
    address
  );

  useEffect(() => {
    if (!contract || !address) return;

    async function loadClaimableRewards() {
      const stakeInfo = await contract?.call("getStakeInfo", address);
      setClaimableRewards(stakeInfo[1]);
    }

    loadClaimableRewards();
  }, [address, contract]);

  async function stakeNft(id: string) {
    if (!address) return;

    const isApproved = await useNFTCollection?.isApproved(
      address,
      stakingContractAddress
    );
    if (!isApproved) {
      await useNFTCollection?.setApprovalForAll(stakingContractAddress, true);
    }
    await contract?.call("stake", [id]);
  }

  if (isLoading) {
    return <div>
      <center><h1 className={styles.center}>LOADING.....
</h1></center></div>;
  }
  function App() {
    return <ConnectWallet />;
  }
  return (
    <div className={styles.container}>
      <h1 className={styles.nftBoxGrid}><MediaRenderer src="https://ipfs.thirdwebcdn.com/ipfs/QmaFsijetNjokyHEis9dVwed6aQPDSZbiXZT6AKoNrYk2W/JellyGoonZ%20Banner.png" width="300"
     /></h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />
      
            <ConnectWallet />
      {!address ? (
        <div>
     
        </div>
      ) : (
        <>
        
        <h1 className={styles.h1}>
          <br/>
       The JellyGoonZ : Capture Reward System 
       </h1>
       <hr className={`${styles.divider} ${styles.spacerbottom}`} />
       <h3 className={styles.h3}>
       Contract Address : 0x8d4fC6951E8C3a8e37486D994Db986Cc11AA05A8
       <hr className={`${styles.divider} ${styles.spacerTop}`} />
       
          </h3>
          <div className={styles.tokenGrid}>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>$JELLY Earned</h3>
              <p className={styles.tokenValue}>
                <b>
                  {!claimableRewards
                    ? "Loading..."
                    : ethers.utils.formatUnits(claimableRewards, 18)}
                </b>{" "}
                {tokenBalance?.symbol}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Current Holdings</h3>
              <p className={styles.tokenValue}>
                <b>{tokenBalance?.displayValue}</b> {tokenBalance?.symbol}
              </p>
            </div>
          </div>

          <Web3Button
            action={(contract) => contract.call("claimRewards")}
            contractAddress={stakingContractAddress}
          >
            Claim Rewards
          </Web3Button>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Set Free</h2>
          <div className={styles.nftBoxGrid}>
            {stakedTokens &&
              stakedTokens[0]?.map((stakedToken: BigNumber) => (
                <NFTCard
                  tokenId={stakedToken.toNumber()}
                  key={stakedToken.toString()}
                />
                
              ))}
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Captured</h2>
          <div className={styles.nftBoxGrid}>
            {ownedNfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata.name}</h3>
                <Web3Button
                  contractAddress={stakingContractAddress}
                  action={() => stakeNft(nft.metadata.id)}
                >
                  Send to the LabZ
                </Web3Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Stake;