import { useNavigate } from "react-router-dom";
import "./StartAuctionPage.css"
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { AUCTION_ABI, AUCTION_ADDRESS } from "./utils";

interface IAuctionDetails {
    contractAddress: string;
    nftNumber: number;
    minBid: number;
    endTime: number;
}

function StartAuctionPage() {
    const navigate = useNavigate();

    const [auctionDetails, setAuctionDetails] = useState<IAuctionDetails>({
        contractAddress: '',
        nftNumber: 0,
        minBid: 0,
        endTime: 0,
    });

    useEffect(() => {
        if (!window.ethereum.isConnected()) {
            navigate('/connect-wallet');
        }
    }, []);
    
    const startAuction = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const auctionContract = new ethers.Contract(
            AUCTION_ADDRESS,
            AUCTION_ABI,
            signer
        );

        const tx = await auctionContract.startAuction(
            auctionDetails.contractAddress,
            auctionDetails.nftNumber,
            auctionDetails.endTime - Date.now(),
            auctionDetails.minBid,
        );

        await tx.wait();
        
        console.log(tx);
    }
    
    return (
        <div className="wrapper">
            <form>
                <label htmlFor="contractaddress">Contract Address</label>
                <input type="text" id="contractaddress" placeholder="Contract Address" value={auctionDetails.contractAddress} onChange={(e) => setAuctionDetails({...auctionDetails, contractAddress: e.target.value})}/>
                <label htmlFor="nftnumber">NFT Number</label>
                <input type="number" step={1} id="nftnumber" placeholder="NFT Number" value={auctionDetails.nftNumber} onChange={(e) => setAuctionDetails({...auctionDetails, nftNumber: Number(e.target.value)})}/>
                <label htmlFor="minbid">Minimum Bid</label>
                <input type="number" min={0} step="any" id="midbid" placeholder="Minimum Bid" value={auctionDetails.minBid} onChange={(e) => setAuctionDetails({...auctionDetails, minBid: Number(e.target.value)})}/>                
                <label htmlFor="endtime">End Time</label>
                <input type="datetime-local" id="endtime" name="endtime" value={auctionDetails.endTime} onChange={(e) => setAuctionDetails({...auctionDetails, endTime: Number(e.target.value)})}/>
                <input type="submit" value="Start New Auction" onClick={startAuction}/>
            </form>
        </div>
    )    
}

export default StartAuctionPage;
