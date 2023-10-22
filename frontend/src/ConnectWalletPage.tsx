import { useNavigate } from "react-router-dom";
import "./ConnectWalletPage.css"

function ConnectWalletPage() {
    const navigate = useNavigate();

    const handleConnectWallet = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.enable();
                navigate('/');
            } catch (e) {
                console.error(e);
            }
        } else {
            console.error("no ethereum wallet connected");
        }
    }

    return (
        <div className="container">
            <button className="button" onClick={handleConnectWallet}>Connect Wallet</button>
        </div>
    )
};

export default ConnectWalletPage;