// Sample NFT data
const nftData = [
    {
        id: 1,
        title: "Cosmic Journey #124",
        creator: "SpaceArtist",
        price: "2.5 ETH",
        image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400"
    },
    {
        id: 2,
        title: "Digital Dreams #42",
        creator: "DreamWeaver",
        price: "1.8 ETH",
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400"
    },
    {
        id: 3,
        title: "Abstract Thoughts #78",
        creator: "MindPainter",
        price: "3.2 ETH",
        image: "https://images.unsplash.com/photo-1543857778-c4a1a569e358?w=400"
    },
    {
        id: 4,
        title: "Neon City #15",
        creator: "UrbanArtist",
        price: "4.1 ETH",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400"
    },
    {
        id: 5,
        title: "Ocean Waves #33",
        creator: "NatureLover",
        price: "1.5 ETH",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
    },
    {
        id: 6,
        title: "Mystic Forest #89",
        creator: "ForestSpirit",
        price: "2.8 ETH",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400"
    }
];

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletInfo = document.getElementById('walletInfo');
const walletAddress = document.getElementById('walletAddress');
const balance = document.getElementById('balance');
const nftGrid = document.getElementById('nftGrid');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadNFTs();
    setupEventListeners();
});

// Load NFTs into the grid
function loadNFTs() {
    nftGrid.innerHTML = '';
    
    nftData.forEach(nft => {
        const nftElement = document.createElement('div');
        nftElement.className = 'nft-item';
        nftElement.innerHTML = `
            <img src="${nft.image}" alt="${nft.title}" class="nft-image">
            <div class="nft-details">
                <h3 class="nft-title">${nft.title}</h3>
                <p class="nft-creator">By ${nft.creator}</p>
                <div class="nft-price">${nft.price}</div>
            </div>
        `;
        
        nftElement.addEventListener('click', () => {
            alert(`You clicked on ${nft.title}! This would open a detailed view in a real application.`);
        });
        
        nftGrid.appendChild(nftElement);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Wallet connection
    connectWalletBtn.addEventListener('click', connectWallet);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Hero buttons
    document.querySelectorAll('.hero-buttons .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent === 'Explore') {
                document.querySelector('#explore').scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                document.querySelector('#create').scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Simulate wallet connection
function connectWallet() {
    // In a real application, this would connect to a Web3 wallet like MetaMask
    const fakeAddress = '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b';
    const fakeBalance = (Math.random() * 10).toFixed(2);
    
    // Update UI
    walletAddress.textContent = `${fakeAddress.substring(0, 6)}...${fakeAddress.substring(fakeAddress.length - 4)}`;
    balance.textContent = `${fakeBalance} ETH`;
    
    // Show wallet info and hide connect button
    connectWalletBtn.classList.add('hidden');
    walletInfo.classList.remove('hidden');
    
    // Show success message
    showNotification('Wallet connected successfully!');
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        transform: translateX(150%);
        transition: transform 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add some CSS for notifications (dynamically)
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #8a2be2, #4a00e0);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        transform: translateX(150%);
        transition: transform 0.3s ease-out;
    }
`;
document.head.appendChild(style);