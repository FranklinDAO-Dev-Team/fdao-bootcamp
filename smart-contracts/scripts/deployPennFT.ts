import { ethers } from "hardhat";

async function main() {
  const pennFT = await ethers.deployContract("PennFT", []);

  await pennFT.waitForDeployment();

  console.log(
    `PennFT deployed to ${pennFT.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
