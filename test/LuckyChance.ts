import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("LuckyChance", function () {
  async function deployLuckyChanceFixture() {
    const houseFee = 5;
    const seed = 1;
    const maxGameLength = 100;

    const [owner, otherAccount] = await ethers.getSigners();

    const luckyChanceFactory = await ethers.getContractFactory("LuckyChance");
    const luckyChance = await luckyChanceFactory.deploy(houseFee, maxGameLength, seed);

    return { luckyChance, houseFee, maxGameLength, owner, otherAccount };
  }

    describe("Deployment", function () {
        it("Should set the right house fee", async function () {
            const { luckyChance, houseFee } = await loadFixture(deployLuckyChanceFixture);

            expect(await luckyChance.houseFee()).to.equal(houseFee);
        });
        
        it("Should set the right max game length", async function () {
            const { luckyChance, maxGameLength } = await loadFixture(deployLuckyChanceFixture);

            expect(await luckyChance.maxGameLength()).to.equal(maxGameLength);
        });

        it("Should set the right owner", async function () {
            const { luckyChance, owner } = await loadFixture(deployLuckyChanceFixture);

            expect(await luckyChance.owner()).to.equal(owner.address);
        });
    });
    
    describe("Start Game", function () {
        it("Should revert if gameLength is zero", async function () {
            const { luckyChance } = await loadFixture(deployLuckyChanceFixture);
            await expect(luckyChance.startGame(0, 1)).to.be.revertedWith("game must have a non-zero duration");
        });
        
        it("Should revert if gameLength is greater than maxGameLength", async function () {
            const { luckyChance } = await loadFixture(deployLuckyChanceFixture);
            await expect(luckyChance.startGame(101, 1)).to.be.revertedWith("game must have a duration less than or equal to the maximum allowable duration");
        });

        it("Should revert if maxBet is zero", async function () {
            const { luckyChance } = await loadFixture(deployLuckyChanceFixture);
            await expect(luckyChance.startGame(1, 0)).to.be.revertedWith("game must have a non-zero maximum bet");
        });

        it("Should create a new game", async function () {
            const { luckyChance, owner } = await loadFixture(deployLuckyChanceFixture);
            await luckyChance.startGame(1, 1);
            expect(await luckyChance.maxGameId()).to.equal(1);
            
            const gameInfo = await luckyChance.gameInfos(1);
            expect(gameInfo.gameLength).to.equal(1);
            expect(gameInfo.maxBet).to.equal(1);
            const latestBlock = await ethers.provider.getBlock("latest");
            if (!latestBlock || !latestBlock.timestamp) {
                throw new Error("latest block not found");
            }
            expect(gameInfo.endTime).to.equal(latestBlock.timestamp + 1);
        });

        it("Should create a new game for each call to startGame", async function () {
            const { luckyChance, owner } = await loadFixture(deployLuckyChanceFixture);
            await luckyChance.startGame(1, 1);
            await luckyChance.startGame(1, 1);
            await luckyChance.startGame(1, 1);
            expect(await luckyChance.maxGameId()).to.equal(3);
        });
    });

    describe("Submit Bid", function () {
        it("Should revert if game id is 0", async function () {
            const { luckyChance } = await loadFixture(deployLuckyChanceFixture);
            await expect(luckyChance.submitBet(0, { value: 1 })).to.be.revertedWith("game does not exist");
        });

        it("Should revert if game id is greater than maxGameId", async function () {
            const { luckyChance } = await loadFixture(deployLuckyChanceFixture);
            await expect(luckyChance.submitBet(1, { value: 1 })).to.be.revertedWith("game does not exist");
        });

        it("Should revert if no bet is sent", async function () {
            const { luckyChance } = await loadFixture(deployLuckyChanceFixture);
            await luckyChance.startGame(100, 1);
            await expect(luckyChance.submitBet(1)).to.be.revertedWith("bet must have a non-zero value");
        });

        it("Should revert if the game is over", async function () {
            const { luckyChance } = await loadFixture(deployLuckyChanceFixture);
            await luckyChance.startGame(1, 1);
            await time.increase(2);
            await expect(luckyChance.submitBet(1, { value: 1 })).to.be.revertedWith("game must still be ongoing");
        });
        
        it("Should revert if the bet is greater than the max bet", async function () {
            const { luckyChance } = await loadFixture(deployLuckyChanceFixture);
            await luckyChance.startGame(100, 1);
            await expect(luckyChance.submitBet(1, { value: 2 })).to.be.revertedWith("total bet must not be larger than the maximum allowable bet");
        });
        
        it("Should revert if the total bet is greater than the max bet", async function () {
            const { luckyChance } = await loadFixture(deployLuckyChanceFixture);
            await luckyChance.startGame(100, 1);
            await luckyChance.submitBet(1, { value: 1 });
            await expect(luckyChance.submitBet(1, { value: 1 })).to.be.revertedWith("total bet must not be larger than the maximum allowable bet");
        })

        it("Should correctly add a new bet to the pool", async function () {
            const { luckyChance, owner } = await loadFixture(deployLuckyChanceFixture);
            await luckyChance.startGame(100, 1);
            await luckyChance.submitBet(1, { value: 1 });
            const gameInfo = await luckyChance.gameInfos(1);
            expect(gameInfo.totalPot).to.equal(1);
            expect(await luckyChance.getNumBettors(1)).to.equal(1);
            expect(await luckyChance.getBettorAtIndex(1, 0)).to.equal(owner.address);
            expect(await luckyChance.getBettorBetAmount(1, owner.address)).to.equal(1);
        });

        it("Should correctly add repeat bets to the pool", async function () {
            const { luckyChance, owner } = await loadFixture(deployLuckyChanceFixture);
            await luckyChance.startGame(100, 2);
            await luckyChance.submitBet(1, { value: 1 });
            await luckyChance.submitBet(1, { value: 1 });
            const gameInfo = await luckyChance.gameInfos(1);
            expect(gameInfo.totalPot).to.equal(2);
            expect(await luckyChance.getNumBettors(1)).to.equal(1);
            expect(await luckyChance.getBettorAtIndex(1, 0)).to.equal(owner.address);
            expect(await luckyChance.getBettorBetAmount(1, owner.address)).to.equal(2);
        });

        it("Should correctly add new bets to the pool", async function () {
            const { luckyChance, owner, otherAccount } = await loadFixture(deployLuckyChanceFixture);
            await luckyChance.startGame(100, 1);
            await luckyChance.submitBet(1, { value: 1 });
            await luckyChance.connect(otherAccount).submitBet(1, { value: 1 });
            const gameInfo = await luckyChance.gameInfos(1);
            expect(gameInfo.totalPot).to.equal(2);
            expect(await luckyChance.getNumBettors(1)).to.equal(2);
            expect(await luckyChance.getBettorAtIndex(1, 0)).to.equal(owner.address);
            expect(await luckyChance.getBettorAtIndex(1, 1)).to.equal(otherAccount.address);
            expect(await luckyChance.getBettorBetAmount(1, owner.address)).to.equal(1);
            expect(await luckyChance.getBettorBetAmount(1, otherAccount.address)).to.equal(1);
        });
    });
});
