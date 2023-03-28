import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button,
  useNFTCollection,
  MediaRenderer
} from "@thirdweb-dev/react";
import { NFTCollection } from "@thirdweb-dev/sdk";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import NFTCard from "../components/NFTCard";
import {
  nftCollectionAddress,
  stakingContractAddress,
  tokenContractAddress,
} from "../consts/contactAddresses";
import styles from "../styles/Home.module.css";

const Stake: NextPage = () => {
  const address = useAddress();
  const { contract: useNFTCollection } = useContract(
    nftCollectionAddress,
    "nft-collection"
  );
  const { contract: tokenContract } = useContract(
    tokenContractAddress,
    "token"
  );
  const { contract, isLoading } = useContract(stakingContractAddress);
  const { data: ownedNfts } = useOwnedNFTs(useNFTCollection, address);
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
      <center><h1 className={styles.center}><MediaRenderer src="https://ipfs.thirdwebcdn.com/ipfs/QmQv2duGBZq6G88u2V68pjgushTeXMP15jPoTzUxwYgzyH
        /Dashed_Jelly_sci-fi_mad_scientist_lab_with_jelly_wads_and_fungu_1e004539-2367-4d97-a963-09efb1b61434.png" 
      width="2400" height="1200"
     /></h1></center></div>;
  }
  function App() {
    return <ConnectWallet />;
  }
  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Welcome To Jelly LabZ 2.1</h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />
      <br/>
            <ConnectWallet />
      {!address ? (
        <div>
       
        </div>
      ) : (
        <>
          <h3 className={styles.h3}>Sending your Jelly companion to work in the labs can be a great way to earn some extra $Jelly. 
            <br/>Each hour your jelly companion completes a task, they earn one jelly token. 
            <br/>On occasion when targets are hit more tokens can be sent per hour, providing even 
            better earning potential, and reward. 
            <br/>
            <br/>This can be a great way to give your jelly 
            companion a sense of purpose and responsibility. <br/>
            <br/>Just make sure to monitor their workload and make sure they dont get overwhelmed!
            
          </h3>
          <div className={styles.tokenGrid}>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Claimable $JELLY</h3>
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
            Claim Earnings
          </Web3Button>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2>Send Home</h2>
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
          <h2>Available to work</h2>
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
