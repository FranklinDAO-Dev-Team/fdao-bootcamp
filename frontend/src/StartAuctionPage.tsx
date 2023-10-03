import "./StartAuctionPage.css"

function StartAuctionPage() {
    return (
        <div className="wrapper">
            <form>
                <label htmlFor="contractaddress">Contract Address</label>
                <input type="text" id="contractaddress" placeholder="Contract Address"/>
                <label htmlFor="nftnumber">NFT Number</label>
                <input type="number" step={1} id="nftnumber" placeholder="NFT Number" />
                <label htmlFor="minbid">Minimum Bid</label>
                <input type="number" min={0} step="any" id="midbid" placeholder="Minimum Bid"/>
                <label htmlFor="endtime">End Time</label>
                <input type="datetime-local" id="endtime" name="endtime"/>
                <input type="submit" value="Start New Auction"/>
            </form>
        </div>
    )    
}

export default StartAuctionPage;
