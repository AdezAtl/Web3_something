/* ArtBlocks: every artwork on this page is drawn in the browser from its token hash. */

// ---------- Seeded randomness ----------

function hashString(str) {
    let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (let i = 0; i < str.length; i++) {
        const k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function tokenHash(seedText) {
    const rng = mulberry32(hashString(seedText));
    let out = '0x';
    for (let i = 0; i < 64; i++) out += Math.floor(rng() * 16).toString(16);
    return out;
}

function randomHash() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return '0x' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// ---------- Palettes & algorithms ----------

const PALETTES = [
    { bg: '#16143f', inks: ['#ffc23d', '#ff5c8a', '#4a6cff', '#3ddc97', '#f1f2f7'] },
    { bg: '#f1f2f7', inks: ['#16143f', '#4a6cff', '#ff5c8a', '#ffc23d'] },
    { bg: '#0e3b43', inks: ['#f4d35e', '#ee964b', '#f95738', '#faf0ca'] },
    { bg: '#ffc23d', inks: ['#16143f', '#ff5c8a', '#f1f2f7', '#4a6cff'] },
    { bg: '#2b0f3a', inks: ['#ff5c8a', '#ff9e7a', '#ffd6a5', '#9bf6ff'] },
    { bg: '#e9e4d8', inks: ['#1d3557', '#e63946', '#457b9d', '#2a9d8f'] },
];

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

function flowPaths(S, rng) {
    const f1 = 1 + rng() * 3, f2 = 1 + rng() * 3, ph1 = rng() * 6.28, ph2 = rng() * 6.28;
    const twist = 0.6 + rng() * 1.4;
    const angleAt = (x, y) =>
        (Math.sin((x / S) * f1 * Math.PI + ph1) + Math.cos((y / S) * f2 * Math.PI + ph2)) * twist * Math.PI;
    const paths = [];
    const count = 260;
    for (let i = 0; i < count; i++) {
        let x = rng() * S, y = rng() * S;
        const pts = [[x, y]];
        const len = 40 + rng() * 120;
        for (let s = 0; s < len; s++) {
            const a = angleAt(x, y);
            x += Math.cos(a) * S * 0.006;
            y += Math.sin(a) * S * 0.006;
            if (x < -10 || y < -10 || x > S + 10 || y > S + 10) break;
            pts.push([x, y]);
        }
        paths.push({ pts, w: S * (0.003 + rng() * rng() * 0.02), c: rng() });
    }
    return paths;
}

function strokePath(ctx, p, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = p.w;
    ctx.beginPath();
    p.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
}

const ALGORITHMS = {
    flow(ctx, S, rng, pal) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        flowPaths(S, rng).forEach(p => strokePath(ctx, p, pal.inks[Math.floor(p.c * pal.inks.length)]));
    },

    truchet(ctx, S, rng, pal) {
        const n = 4 + Math.floor(rng() * 6);
        const c = S / n;
        const ink = pick(rng, pal.inks);
        ctx.lineWidth = c * (0.12 + rng() * 0.22);
        ctx.lineCap = 'butt';
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const x = i * c, y = j * c;
                if (rng() < 0.18) {
                    ctx.fillStyle = pick(rng, pal.inks);
                    ctx.fillRect(x, y, c, c);
                }
                ctx.strokeStyle = ink;
                ctx.beginPath();
                if (rng() < 0.5) {
                    ctx.arc(x, y, c / 2, 0, Math.PI / 2);
                    ctx.moveTo(x + c, y + c / 2);
                    ctx.arc(x + c, y + c, c / 2, -Math.PI / 2, Math.PI, true);
                } else {
                    ctx.arc(x + c, y, c / 2, Math.PI / 2, Math.PI);
                    ctx.moveTo(x + c / 2, y + c);
                    ctx.arc(x, y + c, c / 2, 0, -Math.PI / 2, true);
                }
                ctx.stroke();
            }
        }
    },

    orbits(ctx, S, rng, pal) {
        const cx = S * (0.3 + rng() * 0.4), cy = S * (0.3 + rng() * 0.4);
        const rings = 8 + Math.floor(rng() * 10);
        const step = (S * 0.75) / rings;
        ctx.lineCap = 'round';
        for (let r = 1; r <= rings; r++) {
            ctx.lineWidth = step * (0.35 + rng() * 0.4);
            const arcs = 1 + Math.floor(rng() * 3);
            for (let a = 0; a < arcs; a++) {
                const start = rng() * Math.PI * 2;
                ctx.strokeStyle = pick(rng, pal.inks);
                ctx.beginPath();
                ctx.arc(cx, cy, r * step, start, start + 0.4 + rng() * 2.6);
                ctx.stroke();
            }
        }
    },

    strata(ctx, S, rng, pal) {
        let y = 0;
        const sunR = S * (0.12 + rng() * 0.12);
        const sunX = S * (0.25 + rng() * 0.5), sunY = S * (0.2 + rng() * 0.3);
        ctx.fillStyle = pick(rng, pal.inks);
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
        y = S * (0.4 + rng() * 0.15);
        while (y < S) {
            const h = S * (0.03 + rng() * 0.12);
            ctx.fillStyle = pick(rng, pal.inks);
            const inset = rng() < 0.5 ? S * rng() * 0.25 : 0;
            ctx.fillRect(inset, y, S - inset * (rng() < 0.5 ? 1 : 0), h);
            y += h + S * rng() * 0.02;
        }
    },

    dots(ctx, S, rng, pal) {
        const n = 10 + Math.floor(rng() * 10);
        const c = S / n;
        const fx = 1 + rng() * 4, fy = 1 + rng() * 4, ph = rng() * 6.28;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const v = (Math.sin((i / n) * fx * Math.PI + ph) * Math.cos((j / n) * fy * Math.PI) + 1) / 2;
                ctx.fillStyle = pal.inks[Math.floor(v * pal.inks.length) % pal.inks.length];
                ctx.beginPath();
                ctx.arc(i * c + c / 2, j * c + c / 2, (c / 2) * (0.15 + v * 0.8), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },
};

function drawArtwork(canvas, hash, algorithm) {
    const S = canvas.width;
    const ctx = canvas.getContext('2d');
    const rng = mulberry32(hashString(hash));
    const pal = PALETTES[Math.floor(rng() * PALETTES.length)];
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, S, S);
    ALGORITHMS[algorithm](ctx, S, rng, pal);
}

const imageCache = new Map();
function artworkImage(hash, algorithm, size = 480) {
    const key = `${hash}-${algorithm}-${size}`;
    if (!imageCache.has(key)) {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        drawArtwork(c, hash, algorithm);
        imageCache.set(key, c.toDataURL('image/png'));
    }
    return imageCache.get(key);
}

// ---------- Data ----------

const collectionData = [
    { id: 'driftlines', title: 'Driftlines', artist: 'Mara Okafor', algorithm: 'flow', color: '#ffc23d' },
    { id: 'tilework', title: 'Tilework', artist: 'Jun Takeda', algorithm: 'truchet', color: '#4a6cff' },
    { id: 'orbitals', title: 'Orbitals', artist: 'Ines Duarte', algorithm: 'orbits', color: '#ff5c8a' },
    { id: 'strata', title: 'Strata', artist: 'Teodor Lind', algorithm: 'strata', color: '#3ddc97' },
    { id: 'halftone', title: 'Halftone Fields', artist: 'Priya Nair', algorithm: 'dots', color: '#f1f2f7' },
];

const nftData = [
    { id: 1, collection: 'driftlines', number: 124, price: 2.5, description: 'Hundreds of lines follow a hidden current across the canvas. The hash sets the current’s shape and the palette.' },
    { id: 2, collection: 'tilework', number: 42, price: 1.8, description: 'Quarter-circle tiles, each turned one of two ways, joining into a single winding path.' },
    { id: 3, collection: 'orbitals', number: 78, price: 3.2, description: 'Broken rings around an off-centre point, like a long exposure of something circling.' },
    { id: 4, collection: 'strata', number: 15, price: 4.1, description: 'A low sun over stacked bands of colour. Band heights and the horizon line come from the hash.' },
    { id: 5, collection: 'halftone', number: 33, price: 1.5, description: 'A grid of dots whose sizes trace an interference pattern between two waves.' },
    { id: 6, collection: 'driftlines', number: 89, price: 2.8, description: 'A tighter current than most Driftlines outputs, with lines that curl back on themselves.' },
    { id: 7, collection: 'tilework', number: 56, price: 0.9, description: 'A small grid with heavy strokes, so the path reads almost like lettering.' },
    { id: 8, collection: 'orbitals', number: 101, price: 5.5, description: 'One of the densest Orbitals outputs, with eighteen rings.' },
    { id: 9, collection: 'strata', number: 7, price: 3.6, description: 'An early mint from the series, with a high horizon and thin bands.' },
    { id: 10, collection: 'halftone', number: 210, price: 1.1, description: 'Low-frequency waves give this one large, slow blooms of dots.' },
    { id: 11, collection: 'driftlines', number: 3, price: 6.2, description: 'The third Driftlines output ever minted.' },
    { id: 12, collection: 'tilework', number: 300, price: 1.4, description: 'The final piece in the Tilework edition.' },
].map(nft => {
    const col = collectionData.find(c => c.id === nft.collection);
    return {
        ...nft,
        title: `${col.title} #${nft.number}`,
        creator: col.artist,
        algorithm: col.algorithm,
        hash: tokenHash(`${col.id}-${nft.number}`),
    };
});

collectionData.forEach(col => {
    const items = nftData.filter(n => n.collection === col.id);
    col.floor = Math.min(...items.map(n => n.price));
    col.items = items.length;
    col.cover = items[0];
});

// ---------- DOM ----------

const $ = id => document.getElementById(id);
const connectWalletBtn = $('connectWallet');
const disconnectWalletBtn = $('disconnectWallet');
const walletInfo = $('walletInfo');
const walletAddress = $('walletAddress');
const balance = $('balance');
const networkInfo = $('networkInfo');
const nftGrid = $('nftGrid');
const emptyState = $('emptyState');
const collectionsGrid = $('collectionsGrid');
const collectionFilter = $('collectionFilter');
const nftSearch = $('nftSearch');
const sortSelect = $('sortSelect');
const nftModal = $('nftModal');
const modalCanvas = $('modalCanvas');

let activeCollection = '';
let currentNFT = null;
let wallet = null; // { address, demo }

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
    drawHero(randomHash());
    renderFilters();
    loadNFTs();
    loadCollections();
    setupEventListeners();
    checkWalletConnection();
});

// ---------- Hero ----------

let heroFrame = null;
function drawHero(hash) {
    const canvas = $('heroCanvas');
    const ctx = canvas.getContext('2d');
    const S = canvas.width;
    const rng = mulberry32(hashString(hash));
    const pal = PALETTES[0];
    const paths = flowPaths(S, rng);
    $('heroHash').textContent = hash;
    $('heroHash').title = hash;

    cancelAnimationFrame(heroFrame);
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, S, S);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const colorOf = p => pal.inks[Math.floor(p.c * pal.inks.length)];

    if (reduceMotion) {
        paths.forEach(p => strokePath(ctx, p, colorOf(p)));
        return;
    }
    let i = 0;
    const perFrame = 4;
    const tick = () => {
        for (let k = 0; k < perFrame && i < paths.length; k++, i++) strokePath(ctx, paths[i], colorOf(paths[i]));
        if (i < paths.length) heroFrame = requestAnimationFrame(tick);
    };
    tick();
}

// ---------- Artworks ----------

function renderFilters() {
    const all = [{ id: '', title: 'All' }, ...collectionData];
    collectionFilter.innerHTML = '';
    all.forEach(col => {
        const b = document.createElement('button');
        b.className = 'chip';
        b.type = 'button';
        b.dataset.collection = col.id;
        b.setAttribute('aria-pressed', String(col.id === activeCollection));
        if (col.color) {
            const sw = document.createElement('span');
            sw.className = 'chip-swatch';
            sw.style.background = col.color;
            b.appendChild(sw);
        }
        b.append(col.title);
        b.addEventListener('click', () => setCollection(col.id));
        collectionFilter.appendChild(b);
    });
}

function setCollection(id) {
    activeCollection = id;
    collectionFilter.querySelectorAll('.chip').forEach(c =>
        c.setAttribute('aria-pressed', String(c.dataset.collection === id))
    );
    filterAndSortNFTs();
}

function loadNFTs(list = nftData) {
    nftGrid.innerHTML = '';
    emptyState.hidden = list.length > 0;
    list.forEach(nft => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'art-item';
        item.innerHTML = `
            <img src="${artworkImage(nft.hash, nft.algorithm)}" alt="" width="480" height="480">
            <span class="art-label">
                <span class="art-title"></span>
                <span class="art-price">${nft.price} ETH</span>
                <span class="art-creator"></span>
            </span>`;
        item.querySelector('.art-title').textContent = nft.title;
        item.querySelector('.art-creator').textContent = nft.creator;
        item.setAttribute('aria-label', `${nft.title} by ${nft.creator}, ${nft.price} ETH`);
        item.addEventListener('click', () => showNFTModal(nft));
        nftGrid.appendChild(item);
    });
}

function filterAndSortNFTs() {
    const term = nftSearch.value.trim().toLowerCase();
    const sort = sortSelect.value;
    const list = nftData.filter(
        n =>
            (!activeCollection || n.collection === activeCollection) &&
            (n.title.toLowerCase().includes(term) || n.creator.toLowerCase().includes(term))
    );
    const sorters = {
        'price-asc': (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        'title-asc': (a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }),
    };
    if (sorters[sort]) list.sort(sorters[sort]);
    loadNFTs(list);
}

// ---------- Collections ----------

function loadCollections() {
    collectionsGrid.innerHTML = '';
    [...collectionData]
        .sort((a, b) => b.floor - a.floor)
        .forEach(col => {
            const li = document.createElement('li');
            li.className = 'collection-row';
            li.innerHTML = `
                <button type="button">
                    <img src="${artworkImage(col.cover.hash, col.algorithm, 160)}" alt="" width="64" height="64">
                    <span class="collection-name"><span class="t"></span><span class="collection-artist"></span></span>
                    <span class="collection-stat items">${col.items}<small>listed</small></span>
                    <span class="collection-stat">${col.floor} ETH<small>floor</small></span>
                </button>`;
            li.querySelector('.t').textContent = col.title;
            li.querySelector('.collection-artist').textContent = `by ${col.artist}`;
            li.querySelector('button').addEventListener('click', () => {
                setCollection(col.id);
                $('explore').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
            });
            collectionsGrid.appendChild(li);
        });
}

// ---------- Modal ----------

function showNFTModal(nft) {
    currentNFT = nft;
    const col = collectionData.find(c => c.id === nft.collection);
    drawArtwork(modalCanvas, nft.hash, nft.algorithm);
    modalCanvas.setAttribute('aria-label', `${nft.title}, a generative artwork`);
    $('modalCollection').textContent = `${col.title} collection`;
    $('modalTitle').textContent = nft.title;
    $('modalCreator').textContent = `by ${nft.creator}`;
    $('modalDescription').textContent = nft.description;
    $('modalHash').textContent = nft.hash;
    $('modalPrice').textContent = `${nft.price} ETH`;
    $('buyButton').textContent = `Buy for ${nft.price} ETH`;
    nftModal.showModal();
}

function buyCurrent() {
    if (!currentNFT) return;
    if (!wallet) {
        showNotification('Connect a wallet to buy this piece.');
        connectWallet();
        return;
    }
    showNotification(`This is a demo marketplace, so no transaction was sent for ${currentNFT.title}.`);
}

// ---------- Events ----------

function setupEventListeners() {
    connectWalletBtn.addEventListener('click', connectWallet);
    disconnectWalletBtn.addEventListener('click', disconnectWallet);
    $('regenerate').addEventListener('click', () => drawHero(randomHash()));
    nftSearch.addEventListener('input', filterAndSortNFTs);
    sortSelect.addEventListener('change', filterAndSortNFTs);
    $('closeModal').addEventListener('click', () => nftModal.close());
    nftModal.addEventListener('click', e => {
        if (e.target === nftModal) nftModal.close();
    });
    $('buyButton').addEventListener('click', buyCurrent);
    $('startCreating').addEventListener('click', () => {
        if (!wallet) connectWallet();
        else showNotification('Publishing projects isn’t available in this demo yet.');
    });
}

// ---------- Wallet ----------

const CHAINS = { '0x1': 'Ethereum', '0xaa36a7': 'Sepolia', '0x89': 'Polygon', '0xa': 'Optimism', '0xa4b1': 'Arbitrum', '0x2105': 'Base' };

const store = {
    get: k => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
    remove: k => { try { localStorage.removeItem(k); } catch { /* storage unavailable */ } },
};

async function connectWallet() {
    const eth = window.ethereum;
    if (eth) {
        try {
            const [address] = await eth.request({ method: 'eth_requestAccounts' });
            if (!address) return;
            store.set('walletMode', 'injected');
            await setConnected(address, false);
            showNotification('Wallet connected.');
        } catch (err) {
            showNotification(err && err.code === 4001 ? 'Connection cancelled in your wallet.' : 'Couldn’t connect. Unlock your wallet and try again.');
        }
        return;
    }
    // No browser wallet: fall back to a clearly labelled demo account.
    store.set('walletMode', 'demo');
    await setConnected('0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', true);
    showNotification('No browser wallet found, so you’re connected to a demo account.');
}

async function setConnected(address, demo) {
    wallet = { address, demo };
    walletAddress.textContent = `${address.slice(0, 6)}…${address.slice(-4)}`;
    walletAddress.title = address;
    connectWalletBtn.hidden = true;
    walletInfo.hidden = false;

    if (demo) {
        balance.textContent = '4.20 ETH';
        networkInfo.textContent = 'Demo';
        return;
    }
    try {
        const [weiHex, chainId] = await Promise.all([
            window.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] }),
            window.ethereum.request({ method: 'eth_chainId' }),
        ]);
        const eth = Number(BigInt(weiHex) / 10n ** 14n) / 1e4;
        balance.textContent = `${eth.toFixed(eth < 10 ? 3 : 2)} ETH`;
        networkInfo.textContent = CHAINS[chainId] || `Chain ${parseInt(chainId, 16)}`;
    } catch {
        balance.textContent = '';
        networkInfo.textContent = '';
    }
}

function disconnectWallet() {
    wallet = null;
    store.remove('walletMode');
    connectWalletBtn.hidden = false;
    walletInfo.hidden = true;
    showNotification('Wallet disconnected.');
}

async function checkWalletConnection() {
    const mode = store.get('walletMode');
    if (mode === 'demo') {
        setConnected('0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', true);
    } else if (mode === 'injected' && window.ethereum) {
        try {
            const [address] = await window.ethereum.request({ method: 'eth_accounts' });
            if (address) setConnected(address, false);
        } catch { /* wallet locked */ }
    }
    if (window.ethereum && window.ethereum.on) {
        window.ethereum.on('accountsChanged', accounts => {
            if (!wallet || wallet.demo) return;
            if (accounts.length) setConnected(accounts[0], false);
            else disconnectWallet();
        });
        window.ethereum.on('chainChanged', () => {
            if (wallet && !wallet.demo) setConnected(wallet.address, false);
        });
    }
}

// ---------- Toasts ----------

function showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    $('toastRegion').appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}
