import { useNavigate } from "react-router-dom";
import "./NFTPage.css"
import { useEffect } from "react";

function NFTPage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!window.ethereum.isConnected()) {
            navigate('/connect-wallet');
        }
    }, []);

    return (
        <div className='full-container'>
            <div className="image-container">
                <img className="image" src="https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2021%2F10%2Fbored-ape-yacht-club-nft-3-4-million-record-sothebys-metaverse-0.jpg?w=960&cbr=1&q=90&fit=max" />
                <div className="box">
                    <h2>BAYC #0001</h2>
                </div>
            </div>
            <div className="info">
                <h3>
                    Current Owner: 0x123456<br/>
                    Minimum Bid: 1 ETH<br/>
                    Highest Bid: 1 ETH<br />
                    Time Remaning: 1d12h30m0s
                </h3>
                <form className="image-container">
                    <input type="number" min={0} max={false} step="any" placeholder="Enter New Bid" />
                    <input type="submit" value="Submit Bid"/>
                </form>
            </div>
        </div>
    )
}

export default NFTPage;
