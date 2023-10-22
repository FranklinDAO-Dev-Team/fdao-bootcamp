import { BrowserRouter, Route, Routes } from "react-router-dom"
import HomePage from "./HomePage"
import "./App.css"
import NFTPage from "./NFTPage"
import StartAuctionPage from "./StartAuctionPage"
import ConnectWalletPage from "./ConnectWalletPage"

function App() {
  return (
    <div className="background">
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={HomePage} />
        <Route path="/start-auction" Component={StartAuctionPage}/>
        <Route path="/:id" Component={NFTPage} />
        <Route path="/connect-wallet" Component={ConnectWalletPage} />
      </Routes>
    </BrowserRouter>
    </div>
  )
}

export default App
