import { ethers } from "hardhat";

async function main() {
    const houseFee = 5;
    const maxAuctionLength = 60 * 60 * 24 * 7; // 7 days

  const auction = await ethers.deployContract("Auction", [houseFee, maxAuctionLength]);

  await auction.waitForDeployment();

  console.log(
    `Auction deployed to ${auction.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
