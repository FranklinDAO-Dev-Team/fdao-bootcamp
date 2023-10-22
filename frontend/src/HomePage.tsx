import { useEffect, useState } from 'react';
import './HomePage.css'
import NFTCard from './NFTCard';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { AUCTION_ABI, AUCTION_ADDRESS } from './utils';

interface IAuction {
    nftContract: string;
    nftId: number;
    auctionLength: number;
    endTime: number;
    minBid: number;
    winner: string;
    originalOwner: string;
}

function HomePage() {
    const navigate = useNavigate();
    
    const [auctions, setAuctions] = useState<IAuction[]>([]);

    useEffect(() => {
        if (!window.ethereum.isConnected()) {
            navigate('/connect-wallet');
            return;
        }

        const fetchAuctions = async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const auctionContract = new ethers.Contract(
                AUCTION_ADDRESS,
                AUCTION_ABI,
                signer
            );

            const maxAuctionId = await auctionContract.maxAuctionId();
            
            const contractAuctions = [];
            for (let i = 0; i < maxAuctionId; i++) {
                const auction = await auctionContract.auctionInfos(i);
                contractAuctions.push(auction);
            }
            
            setAuctions(contractAuctions);
        };
        
        fetchAuctions();
    }, []);
    

return (
    <div>
        <div className='topbar horizontal-box'>
            <h1 className='title-text'>Auction Site</h1>
            <button className='box vertical-margin' onClick={() => navigate('start-auction')}>
                New Auction
            </button>
        </div>
        <div className='cards-container'>
            {
                auctions.map((auction, i) => (
                    <NFTCard contractAddress={auction.nftContract} id={i} />))
            }
        </div>
    </div>
)
}

export default HomePage;