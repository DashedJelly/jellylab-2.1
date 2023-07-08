import {
  ConnectWallet,
  MediaRenderer,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useNFT,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button,
  
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import NFTCard from "../components/NFTCard";
import {
  nftDropContractAddress,
  stakingContractAddress,
  tokenContractAddress,
} from "../consts/contactAddresses";
import styles from "../styles/Home.module.css";
import { NFTDropContractInput } from "@thirdweb-dev/sdk/solana";
import { NFTDrop } from "@thirdweb-dev/sdk/evm";

const [claimableRewards, setClaimableRewards] = useState<BigNumber>();

const Stake: NextPage = () => {
  const address = useAddress();
  const { contract: contractAddress } = useContract(
    nftDropContractAddress,
    "nftdrop"
  );
  const { contract: tokenContract } = useContract(
    tokenContractAddress,
    "token"
  );
  const { contract, isLoading } = useContract(stakingContractAddress);
  const { data: ownedNfts } = useOwnedNFTs("nftdrop", "0x1db022332b4DA18863660C96bD5b5dbe16F9D6f5" );
  const { data: tokenBalance } = useTokenBalance("token", "0xbb71538BB1db7c2C8C5bD78D1b443e440b697d66");
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  const { data: stakedTokens } = useContractRead(
    contract,
    "getStakeInfo"
  );

  
  useEffect(() => {
    if (!contract || !address) return;

    async function loadClaimableRewards() {
      const stakeInfo = await contract?.call("0x8d4fC6951E8C3a8e37486D994Db986Cc11AA05A8");
      setClaimableRewards(stakeInfo[1]);
    }

    loadClaimableRewards();
  }, [address, contract]);

  async function stakeNft(id: string) {
    if (!address) return;

    const isApproved = await contract?.isApproved(
      address,
      stakingContractAddress
    );
    if (!isApproved) {
      await ?.setApprovalForAll(stakingContractAddress, true);
    }
    await contract?.call("stake", [id]);
  }

  if (isLoading) {
    return <div>
      <center><h1 className={styles.center}><MediaRenderer src="ipfs://QmQv2duGBZq6G88u2V68pjgushTeXMP15jPoTzUxwYgzyH/Dashed_Jelly_sci-fi_mad_scientist_lab_with_jelly_wads_and_fungu_1e004539-2367-4d97-a963-09efb1b61434.png" width="2400" height="1200"
     /></h1></center></div>;
  }
  function App() {
    return <ConnectWallet />;
  }
  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>JellyGoonZ Capture Reward System</h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />
      <br/>
            <ConnectWallet />
      {!address ? (
        <div>
      
        </div>
      ) : (
        <>
          <h3 className={styles.h3}>Sending your Jelly companion to work 
            
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