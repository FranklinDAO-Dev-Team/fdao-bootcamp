import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PennCoin", function () {
  async function deployPennCoinFixture() {
    const initialSupply = 1_000_000;

    const [owner, otherAccount] = await ethers.getSigners();

    const pennCoinFactory = await ethers.getContractFactory("PennCoin");
    const pennCoin = await pennCoinFactory.deploy(initialSupply);

    return { pennCoin, initialSupply, owner, otherAccount };
  }

    describe("Deployment", function () {
        it("Should set the right initial supply", async function () {
            const { pennCoin, initialSupply } = await loadFixture(deployPennCoinFixture);

            expect(await pennCoin.totalSupply()).to.equal(initialSupply);
        });

        it("Should set the right owner", async function () {
            const { pennCoin, owner, initialSupply } = await loadFixture(deployPennCoinFixture);

            expect(await pennCoin.balanceOf(owner.address)).to.equal(initialSupply);
        });
    });
});
