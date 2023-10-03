// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Auction {
    /* Payout Variables */

    // the amount of profit from each auction taken by the house (as a percent)
    // i.e. houseFee = 5 means house takes 5% of each auction
    uint public houseFee;

    // address of the owner of the smart contract
    // we will check this when paying out the tokens
    address payable public owner;

    /* Auction Variables */

    // holds the maximum duration an auction can have
    // if this is set to 0, auctions can have any duration
    uint public maxAuctionLength;

    // holds the latest auction id (for validation)
    // we will track each auction by a unique id, starting at 1 (so we don't accidentally enter an invalid auction)
    uint public maxAuctionId;

    // contains information about the current state of a single auction
    struct AuctionInfo {
        // address of the NFT contract
        address nftContract;
        // id of the NFT
        uint nftId;
        // length of the auction in seconds
        uint auctionLength;
        // end time of the auction
        uint endTime;
        // mininum bid amount
        uint minBid;
        // keeps track of the amount each user has bid
        mapping(address => uint) bids;
        // keeps track of whether users have claimed their money back
        mapping(address => bool) claimed;
        // tracks the current winner of the auction
        address winner;
        // tracks the original owner of the NFT
        address payable originalOwner;
    }

    // will keep track of the info for each auction
    mapping(uint => AuctionInfo) public auctionInfos;

    // emmitted when a user starts an auction
    event StartAuction(
        uint auctionId,
        address nftContract,
        uint nftId,
        uint auctionLength,
        uint endTime
    );

    // emitted when a user submits a bid
    event Bid(address bidder, uint amount);

    // emitted when a user claims their money back
    event Claim(address bidder, uint amount);

    // emitted when an auction ends
    event EndAuction(uint auctionId, address winner, uint amount);

    constructor(uint _houseFee, uint _maxAuctionLength) {
        require(_houseFee <= 100, "House fee cannot be greater than 100%");

        // set the owner of the contract to the address that deployed it
        owner = payable(msg.sender);

        // set the house fee
        houseFee = _houseFee;

        // set the max auction length
        maxAuctionLength = _maxAuctionLength;
    }

    /* View Functions */
    // gets the amount a person has bid on an auction
    function getBid(uint auctionId, address bidder) public view returns (uint) {
        return auctionInfos[auctionId].bids[bidder];
    }

    // gets the current highest bid on an auction
	function getHighestBid(uint _auctionId) public view returns (uint) {
        return auctionInfos[_auctionId].bids[auctionInfos[_auctionId].winner];
    }

    /* Action Functions */
    // startAuction starts an auction for a given NFT
    function startAuction(
        address _nftContract,
        uint _nftId,
        uint _auctionLength,
        uint _minBid
    ) public returns (uint) {
        require(_auctionLength > 0, "auction length must be greater than 0");
        if (maxAuctionLength > 0) {
            require(
                _auctionLength <= maxAuctionLength,
                "auction length is too long"
            );
        }

        IERC721 nftContractInstance = IERC721(_nftContract);
        require(
            nftContractInstance.ownerOf(_nftId) == msg.sender,
            "you do not own this NFT"
        );
        require(
            nftContractInstance.getApproved(_nftId) == address(this),
            "contract is not approved to transfer this NFT"
        );

        // take ownership of the NFT
        nftContractInstance.transferFrom(msg.sender, address(this), _nftId);

        maxAuctionId++;
        auctionInfos[maxAuctionId].nftContract = _nftContract;
        auctionInfos[maxAuctionId].nftId = _nftId;
        auctionInfos[maxAuctionId].auctionLength = _auctionLength;
        auctionInfos[maxAuctionId].endTime = block.timestamp + _auctionLength;
        auctionInfos[maxAuctionId].minBid = _minBid;
        auctionInfos[maxAuctionId].originalOwner = payable(msg.sender);

        emit StartAuction(
            maxAuctionId,
            _nftContract,
            _nftId,
            _auctionLength,
            auctionInfos[maxAuctionId].endTime
        );

        return maxAuctionId;
    }

    // bid submits a bid for a given auction
    function bid(uint _auctionId) public payable returns (uint) {
        require(_auctionId > 0, "auction does not exist");
        require(_auctionId <= maxAuctionId, "auction does not exist");

        AuctionInfo storage auctionInfo = auctionInfos[_auctionId];
        require(block.timestamp < auctionInfo.endTime, "auction has ended");

        uint newBid = auctionInfo.bids[msg.sender] + msg.value;

        require(
            newBid >= auctionInfo.minBid,
            "bid is lower than the minimum bid"
        );
        require(
            newBid > auctionInfo.bids[auctionInfo.winner],
            "bid is lower than the current highest bid"
        );

        auctionInfo.bids[msg.sender] = newBid;
        auctionInfo.winner = msg.sender;

        emit Bid(msg.sender, newBid);

        return newBid;
    }

    // claim allows a user to claim their money back if they are not the winner of an auction
    function claim(uint _auctionId) public returns (uint) {
        require(_auctionId > 0, "auction does not exist");
        require(_auctionId <= maxAuctionId, "auction does not exist");

        AuctionInfo storage auctionInfo = auctionInfos[_auctionId];
        require(
            block.timestamp >= auctionInfo.endTime,
            "auction has not ended"
        );
        require(
            auctionInfo.winner != msg.sender,
            "you are the winner of this auction"
        );

        uint amount = auctionInfo.bids[msg.sender];
        require(amount > 0, "you have not bid on this auction");
        require(
            !auctionInfo.claimed[msg.sender],
            "you have already claimed your money back"
        );

        auctionInfo.claimed[msg.sender] = true;
        payable(msg.sender).transfer(amount);

        emit Claim(msg.sender, amount);

        return amount;
    }

    // endAuction ends an auction and pays out the winner
    function endAuction(uint _auctionId) public returns (uint) {
        require(_auctionId > 0, "auction does not exist");
        require(_auctionId <= maxAuctionId, "auction does not exist");

        AuctionInfo storage auctionInfo = auctionInfos[_auctionId];
        require(
            block.timestamp >= auctionInfo.endTime,
            "auction has not ended"
        );

        // pay the house fee
        uint houseFeeAmount = (auctionInfo.bids[auctionInfo.winner] *
            houseFee) / 100;
        payable(owner).transfer(houseFeeAmount);

        // pay the original owner
        uint originalOwnerAmount = auctionInfo.bids[auctionInfo.winner] -
            houseFeeAmount;
        auctionInfo.originalOwner.transfer(originalOwnerAmount);

        // transfer the NFT to the winner
        IERC721 nftContractInstance = IERC721(auctionInfo.nftContract);
        nftContractInstance.transferFrom(
            address(this),
            auctionInfo.winner,
            auctionInfo.nftId
        );

        emit EndAuction(_auctionId, auctionInfo.winner, originalOwnerAmount);

        return originalOwnerAmount;
    }
}
