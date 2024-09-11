
document.addEventListener("DOMContentLoaded", () => {
    // Show loader as soon as the page starts loading
    loader();

    // Call fetchDataWithCheck to load data when the page loads
    
    const savedPageUrl = localStorage.getItem('currentPageUrl');
    const savedPageNo = localStorage.getItem('currentPageNo') || 1;
    const pageUrl = savedPageUrl || 'https://pokeapi.co/api/v2/pokemon/';
    
    // Call fetchDataWithCheck to load data when the page loads
    updatePageNo(savedPageNo);
    fetchDataWithCheck(pageUrl);
});

function loader(time){
    
        const loader = document.querySelector('.spinner');
        const content  = document.querySelector('.all');
        loader.style.display='block';
        content.style.display='none'
        setTimeout(() =>{
            loader.style.display='none';
            content.style.display='grid';
        },time)

}


async function isOnline() {
    try {
        
        // Try to fetch a small static resource from a reliable server
        const response = await fetch('https://www.google.com/favicon.ico', { method: 'HEAD', mode: 'no-cors' });
        return response.ok || response.status === 0; // This confirms we're online
    } catch (error) {
        return false; // If fetch fails, we assume we're offline
    }
}

async function fetchDataWithCheck(url) {
loader();
    const onlineStatus = await isOnline();
    if (!onlineStatus) {
        
        const displayForOffline = document.querySelector('.error-msg');
            displayForOffline.style.display=`block`;
            displayForOffline.innerHTML=`<h3>YOU ARE OFFLINE</h3>`
            loader(0);
        return;
    }
    fetchData(url);
}

const home = document.querySelector('.homer');
home.addEventListener('click', () => {
    localStorage.setItem('currentPageNo', 1);
    localStorage.setItem('currentPageUrl', 'https://pokeapi.co/api/v2/pokemon/');
    updatePageNo(1);
    fetchDataWithCheck('https://pokeapi.co/api/v2/pokemon/');
});

let names = await fetchDataForSearch('https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0');
const names2 = names.sort((a, b) => {
    return a > b ? 1 : -1;
});

async function fetchDataForSearch(url) {
    try {
        const onlineStatus = await isOnline();
        if (!onlineStatus) {
            const displayForOffline = document.querySelector('.error-msg');
            displayForOffline.style.display=`block`;
            displayForOffline.innerHTML=`<h3>YOU ARE OFFLINE</h3>`
            
            return ['', 0, 0, 0, 0];
        }

        const burger = [];
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Could not fetch resource");
        }
        const datas = await response.json();
        datas.results.forEach((data) => {
            burger.push(data.name);
        });
        return burger;

    } catch (error) {
        console.error('Error fetching data:', error);
        return ['', 0, 0, 0, 0];
    }
}

async function fetchImage(url) {
    try {
        const onlineStatus = await isOnline();
        if (!onlineStatus) {
            alert("You are offline. Cannot fetch images.");
            return ['', 0, 0, 0, 0];
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Could not fetch resource");
        }
        const data = await response.json();
        const data_img = data.sprites.other.dream_world.front_default || data.sprites.front_default;

        const hp = data.stats[0].base_stat;
        const attack = data.stats[1].base_stat;
        const defense = data.stats[2].base_stat;
        const speed = data.stats[5].base_stat;

        return [data_img, hp, attack, defense, speed];
    } catch (error) {
        console.error('Error fetching image:', error);
        return ['', 0, 0, 0, 0];
    }
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Could not fetch resource");
        }

        const data = await response.json();
        const { results, previous, next } = data;

        updateNavigationButtons(previous, next);

        localStorage.setItem('currentPageUrl', url);

        const currentPageNo = parseInt(localStorage.getItem('currentPageNo') || 1);
        updatePageNo(currentPageNo); 


        if (previous) localStorage.setItem('previousPageUrl', previous);
        if (next) localStorage.setItem('nextPageUrl', next);

        const content = await generateContent(results);
        const allContainer = document.querySelector('.all');
        allContainer.replaceChildren(...content);
        loader(0);
        setupEventListeners();
        searchBar();

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateNavigationButtons(prevUrl, nextUrl) {
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    
    prevButton.disabled = !prevUrl;
    nextButton.disabled = !nextUrl;

    localStorage.setItem('previousPageUrl', prevUrl || '');
    localStorage.setItem('nextPageUrl', nextUrl || '');
    
     prevButton.onclick = () => {
        if (prevUrl) {
            const currentPageNo = parseInt(localStorage.getItem('currentPageNo') || 1) - 1;
            localStorage.setItem('currentPageNo', currentPageNo); // Decrease page number
            fetchDataWithCheck(prevUrl);
        }
    };
    nextButton.onclick = () => {
        if (nextUrl) {
            const currentPageNo = parseInt(localStorage.getItem('currentPageNo') || 1) + 1;
            localStorage.setItem('currentPageNo', currentPageNo); // Increase page number
            fetchDataWithCheck(nextUrl);
        }
    };
}
function updatePageNo(pageNo){
    const pageNoSpan = document.querySelector('.page-no');
    pageNoSpan.textContent=`${pageNo}`;
}

function getMatches(val) {
    return names2.filter(name => name.includes(val) && name.startsWith(val));
}

function getSearchDisplayOn(val) {
    const searchDisplay = document.querySelector('.search-results');
    searchDisplay.style.display = val ? 'block' : 'none';
}

function getResults(val) {
    

    const datas = getMatches(val);
    if (datas.length !== 0) {
        const container = document.querySelector('.search-results');
        container.innerHTML = '';

        datas.forEach((data) => {
            const p = document.createElement('p');
            p.className = 'jkc';
            p.textContent = data;
            p.dataset.member = data;
            container.appendChild(p);
        });

        container.addEventListener('click', (event) => {
            if (event.target && event.target.classList.contains('jkc')) {
                console.log('clicked');
                getSearchResult(`https://pokeapi.co/api/v2/pokemon/${event.target.textContent}`, event.target.textContent);
            }
        });
    }
}

function searchBar() {
    const search = document.querySelector('.search');

    search.addEventListener('input', (e) => {
        getSearchDisplayOn(search.value);
        getResults(search.value.toLowerCase());
    });
}

async function getSearchResult(results, name) {
    const allContainer = document.querySelector('.all');

    const imageUrl = await fetchImage(results);

    const containerDiv = document.createElement('div');
    containerDiv.className = 'container';

    const imageDiv = document.createElement('div');
    imageDiv.className = 'image';

    const img = document.createElement('img');
    img.src = imageUrl[0];
    img.alt = name;
    imageDiv.appendChild(img);

    const nameParagraph = document.createElement('p');
    nameParagraph.textContent = name.toUpperCase();

    const disDiv = document.createElement('div');
    disDiv.className = 'dis';
    disDiv.style.display = 'none';

    const hpParagraph = document.createElement('p');
    hpParagraph.textContent = `HP: ${imageUrl[1]}`;
    disDiv.appendChild(hpParagraph);

    const attackParagraph = document.createElement('p');
    attackParagraph.textContent = `Attack: ${imageUrl[2]}`;
    disDiv.appendChild(attackParagraph);

    const defenseParagraph = document.createElement('p');
    defenseParagraph.textContent = `Defense: ${imageUrl[3]}`;
    disDiv.appendChild(defenseParagraph);

    const speedParagraph = document.createElement('p');
    speedParagraph.textContent = `Speed: ${imageUrl[4]}`;
    disDiv.appendChild(speedParagraph);

    containerDiv.appendChild(imageDiv);
    containerDiv.appendChild(nameParagraph);
    containerDiv.appendChild(disDiv);

    allContainer.replaceChildren(containerDiv);

    const searchDisplay = document.querySelector('.search-results');
    searchDisplay.style.display = 'none';

    setupEventListeners();
}

async function generateContent(results) {
    const content = await Promise.all(results.map(async result => {
        const imageUrl = await fetchImage(result.url);

        const containerDiv = document.createElement('div');
        containerDiv.className = 'container';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'image';

        const img = document.createElement('img');
        img.src = imageUrl[0];
        img.alt = result.name;
        imageDiv.appendChild(img);

        const nameParagraph = document.createElement('p');
        nameParagraph.textContent = result.name.toUpperCase();

        const disDiv = document.createElement('div');
        disDiv.className = 'dis';
        disDiv.style.display = 'none';

        const hpParagraph = document.createElement('p');
        hpParagraph.textContent = `HP: ${imageUrl[1]}`;
        disDiv.appendChild(hpParagraph);

        const attackParagraph = document.createElement('p');
        attackParagraph.textContent = `Attack: ${imageUrl[2]}`;
        disDiv.appendChild(attackParagraph);

        const defenseParagraph = document.createElement('p');
        defenseParagraph.textContent = `Defense: ${imageUrl[3]}`;
        disDiv.appendChild(defenseParagraph);

        const speedParagraph = document.createElement('p');
        speedParagraph.textContent = `Speed: ${imageUrl[4]}`;
        disDiv.appendChild(speedParagraph);

        containerDiv.appendChild(imageDiv);
        containerDiv.appendChild(nameParagraph);
        containerDiv.appendChild(disDiv);

        return containerDiv;
    }));

    return content;
}

function setupEventListeners() {
    const images = document.querySelectorAll('.image img');
    images.forEach(img => {
        img.addEventListener('click', function () {
            const disDiv = this.closest('.container').querySelector('.dis');
            disDiv.style.display = disDiv.style.display === 'none' || disDiv.style.display === '' ? 'block' : 'none';
        });
    });

    document.addEventListener('click', (event) => {
        const searchDisplay = document.querySelector('.search-results');
        const searchBar = document.querySelector('.search');

        if (!searchBar.contains(event.target) && !searchDisplay.contains(event.target)) {
            searchDisplay.style.display = 'none';
        }
    });

    const displayable = document.querySelector('.search-results');
    displayable.addEventListener('click', () => {
        const searchDisplay = document.querySelector('.search-results');
        searchDisplay.style.display = 'block';
    });
}

// Initial fetch of data



