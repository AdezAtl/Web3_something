<DOCUMENT filename="script.js">
// Sample NFT data (expanded with more items and descriptions)
const nftData = [
    {
        id: 1,
        title: "Cosmic Journey #124",
        creator: "SpaceArtist",
        price: 2.5,
        image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400",
        description: "A mesmerizing journey through the cosmos, featuring vibrant nebulae and distant galaxies."
    },
    {
        id: 2,
        title: "Digital Dreams #42",
        creator: "DreamWeaver",
        price: 1.8,
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",
        description: "Surreal digital landscapes that blend reality with imagination."
    },
    {
        id: 3,
        title: "Abstract Thoughts #78",
        creator: "MindPainter",
        price: 3.2,
        image: "https://images.unsplash.com/photo-1543857778-c4a1a569e358?w=400",
        description: "An abstract representation of human thoughts and emotions."
    },
    {
        id: 4,
        title: "Neon City #15",
        creator: "UrbanArtist",
        price: 4.1,
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
        description: "Vibrant neon lights illuminating a futuristic cityscape."
    },
    {
        id: 5,
        title: "Ocean Waves #33",
        creator: "NatureLover",
        price: 1.5,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        description: "Calming ocean waves crashing against rocky shores."
    },
    {
        id: 6,
        title: "Mystic Forest #89",
        creator: "ForestSpirit",
        price: 2.8,
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400",
        description: "An enchanted forest filled with mystery and magic."
    },
    {
        id: 7,
        title: "Pixel Paradise #56",
        creator: "RetroGamer",
        price: 0.9,
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400",
        description: "A nostalgic pixel art paradise inspired by classic games."
    },
    {
        id: 8,
        title: "Quantum Leap #101",
        creator: "SciFiMaster",
        price: 5.5,
        image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400",
        description: "Visualizing quantum phenomena in a stunning digital artwork."
    }
];

// Sample collection data (made dynamic)
const collectionData = [
    {
        title: "CyberPunks",
        floor: "0.85 ETH",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300"
    },
    {
        title: "Art Blocks",
        floor: "1.2 ETH",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300"
    },
    {
        title: "Bored Ape",
        floor: "45 ETH",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300"
    },
    {
        title: "Crypto Kitties",
        floor: "0.5 ETH",
        image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=300"
    }
];

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const disconnectWalletBtn = document.getElementById('disconnectWallet');
const walletInfo = document.getElementById('walletInfo');
const walletAddress = document.getElementById('walletAddress');
const balance = document.getElementById('balance');
const nftGrid = document.getElementById('nftGrid');
const collectionsGrid = document.getElementById('collectionsGrid');
const nftSearch = document.getElementById('nftSearch');
const sortSelect = document.getElementById('sortSelect');
const nftModal = document.getElementById('nftModal');
const closeModal = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalCreator = document.getElementById('modalCreator');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadNFTs();
    loadCollections();
    setupEventListeners();
    checkWalletConnection();
});

// Load NFTs into the grid
function loadNFTs(filteredData = nftData) {
    nftGrid.innerHTML = '';
    
    filteredData.forEach(nft => {
        const nftElement = document.createElement('div');
        nftElement.className = 'nft-item';
        nftElement.innerHTML = `
            <img src="${nft.image}" alt="${nft.title}" class="nft-image" loading="lazy">
            <div class="nft-details">
                <h3 class="nft-title">${nft.title}</h3>
                <p class="nft-creator">By ${nft.creator}</p>
                <div class="nft-price">${nft.price} ETH</div>
            </div>
        `;
        
        nftElement.addEventListener('click', () => showNFTModal(nft));
        
        nftGrid.appendChild(nftElement);
    });
}

// Load Collections
function loadCollections() {
    collectionsGrid.innerHTML = '';
    
    collectionData.forEach(collection => {
        const collectionElement = document.createElement('div');
        collectionElement.className = 'collection-card';
        collectionElement.innerHTML = `
            <img src="${collection.image}" alt="${collection.title}" loading="lazy">
            <div class="collection-info">
                <h4>${collection.title}</h4>
                <p>Floor: ${collection.floor}</p>
            </div>
        `;
        
        collectionsGrid.appendChild(collectionElement);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Wallet connection
    connectWalletBtn.addEventListener('click', connectWallet);
    disconnectWalletBtn.addEventListener('click', disconnectWallet);
    
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
            const target = this.textContent === 'Explore' ? '#explore' : '#create';
            document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Search and sort
    nftSearch.addEventListener('input', filterAndSortNFTs);
    sortSelect.addEventListener('change', filterAndSortNFTs);
    
    // Modal close
    closeModal.addEventListener('click', () => nftModal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === nftModal) nftModal.classList.add('hidden');
    });
}

// Filter and Sort NFTs
function filterAndSortNFTs() {
    const searchTerm = nftSearch.value.toLowerCase();
    const sortValue = sortSelect.value;
    
    let filtered = nftData.filter(nft => 
        nft.title.toLowerCase().includes(searchTerm) || 
        nft.creator.toLowerCase().includes(searchTerm)
    );
    
    if (sortValue === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'title-asc') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === 'title-desc') {
        filtered.sort((a, b) => b.title.localeCompare(a.title));
    }
    
    loadNFTs(filtered);
}

// Show NFT Modal
function showNFTModal(nft) {
    modalImage.src = nft.image;
    modalImage.alt = nft.title;
    modalTitle.textContent = nft.title;
    modalCreator.textContent = `By ${nft.creator}`;
    modalPrice.textContent = `${nft.price} ETH`;
    modalDescription.textContent = nft.description || 'No description available.';
    nftModal.classList.remove('hidden');
}

// Simulate wallet connection with localStorage persistence
function connectWallet() {
    const fakeAddress = '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b';
    const fakeBalance = (Math.random() * 10).toFixed(2);
    
    localStorage.setItem('walletAddress', fakeAddress);
    localStorage.setItem('balance', fakeBalance);
    
    updateWalletUI(fakeAddress, fakeBalance);
    showNotification('Wallet connected successfully!');
}

function disconnectWallet() {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('balance');
    
    connectWalletBtn.classList.remove('hidden');
    walletInfo.classList.add('hidden');
    showNotification('Wallet disconnected.');
}

function checkWalletConnection() {
    const storedAddress = localStorage.getItem('walletAddress');
    const storedBalance = localStorage.getItem('balance');
    
    if (storedAddress && storedBalance) {
        updateWalletUI(storedAddress, storedBalance);
    }
}

function updateWalletUI(address, bal) {
    walletAddress.textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    balance.textContent = `${bal} ETH`;
    connectWalletBtn.classList.add('hidden');
    walletInfo.classList.remove('hidden');
}

// Show notification (optimized with CSS classes)
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
</DOCUMENT>
