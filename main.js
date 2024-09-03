
const home = document.querySelector('.homer');
home.addEventListener('click',()=>{
	fetchData('https://pokeapi.co/api/v2/pokemon/');
})
let names = await fetchDataForSearch('https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0');
const names2 = names.sort((a,b) =>{
	if (a>b){
		return 1;
	}
	else{
		return -1;
	}
});


async function fetchDataForSearch(url){
	try {
		const burger =[];
		const response = await fetch(url);
		
		if(!response.ok){
			throw new Error("Could not fetch resource");
		}
		const datas = await response.json();
		datas.results.forEach((data) =>{
			burger.push(data.name);
		});
		return burger;
		
	} catch (error) {
		console.error('Error fetching image:', error);
		return ['', 0, 0, 0, 0]; // Return a default value in case of error
	}
}

async function fetchImage(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error("Could not fetch resource");
		}
		const data = await response.json();
		const data_img = data.sprites.other.dream_world.front_default || data.sprites.front_default;

		// Extract stats
		const hp = data.stats[0].base_stat;
		const attack = data.stats[1].base_stat;
		const defense = data.stats[2].base_stat;
		const speed = data.stats[5].base_stat;
		
		

		return [data_img, hp, attack, defense, speed];
	} catch (error) {
		console.error('Error fetching image:', error);
		return ['', 0, 0, 0, 0]; // Return a default value in case of error
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

		const content = await generateContent(results);
		document.querySelector('.all').innerHTML = content;

		// After content is generated and added to the DOM, set up the event listeners
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

	prevButton.onclick = () => prevUrl && fetchData(prevUrl);
	nextButton.onclick = () => nextUrl && fetchData(nextUrl);
}
function getMatches(val){
	return names2.filter(name =>{
		// const regex =  new RegExp(val,'gi');
		// return name.match(regex);
		if(name.includes(val) && name.startsWith(val)){
			return name;
		}
		
	});
}
function getSearchDisplayOn(val) {
	const searchDisplay = document.querySelector('.search-results');

	searchDisplay.style.display = val ?'block':'none';
}

function getResults(val){
	const datas = getMatches(val);
	if(datas.length !==0){
		const container = document.querySelector('.search-results');
	 let con=``;
	datas.forEach((data)=>{
	
	con +=`<p class ="jkc"data-member="${data}">${data}</p>`
	});
	console.log(con);
	container.innerHTML=con;
	}
	const well =document.querySelectorAll('.jkc');
	well.forEach((item)=>{
			item.addEventListener('click',(tag)=>{
				getSearchResult(`https://pokeapi.co/api/v2/pokemon/${tag.target.textContent}`, `${tag.target.textContent}`);
			})
	})
	
    
	
}
function searchBar(){
	
	const search = document.querySelector('.search');
	
	search.addEventListener('input',(e)=>{
		
		
			getSearchDisplayOn(search.value);
			getResults(search.value);
			
			
			
				
	})
	search.addEventListener('change',(e)=>{
		
		
		getSearchDisplayOn(search.value);
		getResults(search.value);
		
		
		
			
})
	
}
async function getSearchResult(results,name) {
	const allContainer = document.querySelector('.all');

	const imageUrl = await fetchImage(results);

	allContainer.innerHTML = `
		
		<div class="container">
		
			<div class="image">
				<img src="${imageUrl[0]}" alt="${name}" >
			</div>
			<p>${name.toUpperCase()}</p>
			
			<div class="dis" style="display: none;">
				<p>HP: ${imageUrl[1]}</p>
				<p>Attack: ${imageUrl[2]}</p>
				<p>Defense: ${imageUrl[3]}</p>
				<p>Speed: ${imageUrl[4]}</p>
			</div>
		</div>
		`;
		const searchDisplay = document.querySelector('.search-results');
		searchDisplay.style.display='none';
		setupEventListeners();
		
		
}
async function generateContent(results) {
	const items = await Promise.all(results.map(async result => {
		const imageUrl = await fetchImage(result.url);

		return `
		
		<div class="container">
		
			<div class="image">
				<img src="${imageUrl[0]}" alt="${result.name}" >
			</div>
			<p>${result.name.toUpperCase()}</p>
			
			<div class="dis" style="display: none;">
				<p>HP: ${imageUrl[1]}</p>
				<p>Attack: ${imageUrl[2]}</p>
				<p>Defense: ${imageUrl[3]}</p>
				<p>Speed: ${imageUrl[4]}</p>
			</div>
		</div>
		`;
	}));

	return items.join('');
}

function setupEventListeners() {
	const images = document.querySelectorAll('.image img');
	images.forEach(img => {
		img.addEventListener('click', function () {
			const disDiv = this.closest('.container').querySelector('.dis');
			if (disDiv.style.display === 'none' || disDiv.style.display === '') {
				disDiv.style.display = 'block';
			} else {
				disDiv.style.display = 'none';
			}
		});
	});
	document.addEventListener('click',()=>{
		const searchDisplay = document.querySelector('.search-results');
		searchDisplay.style.display='none';
	})
	const displayable = document.querySelector('.search-results');
	displayable.addEventListener('click',()=>{
		const searchDisplay = document.querySelector('.search-results');
		searchDisplay.style.display='block';
	})
	
}

// Initialize the first fetch
fetchData('https://pokeapi.co/api/v2/pokemon/');










