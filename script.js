/**
 * @fileoverview Main script for the Peddy pet adoption platform
 * This file handles all core functionality including pet listings,
 * category filtering, adoption process, and pet details modal
 */

// ==================== API Constants ====================
const API_BASE_URL = 'https://openapi.programming-hero.com/api/peddy';

// ==================== Helper Functions ====================
/**
 * Handles undefined or null text values
 * @param {string|null|undefined} text - The text to check
 * @returns {string} The original text or "No data" if invalid
 */
function handle(text) {
   if (text === undefined || text === null) {
      return "No data";
   }
   return text;
}

// ==================== Pet Category Functions ====================
/**
 * Fetches and displays pet categories as clickable cards
 */
async function cards_function() {
   const res = await fetch("https://openapi.programming-hero.com/api/peddy/categories");
   const data = await res.json();
   const categories = data.categories;
   const cardsContainer = document.getElementById("cards-container");


   for (const index of categories) {
      const catagory = index.category

      const card = document.createElement("button");
      card.setAttribute("type", "button");
      card.setAttribute("id", catagory);
      card.setAttribute("class", "border-1 border-stone-400 px-18 py-6 card bg-base-100 m-2 px-4 flex flex-row items-center justify-center gap-4");
      card.setAttribute("onclick", `handleCardClick( '${catagory}' )`);
      card.innerHTML = `
      <img src="${index.category_icon}" class="card-img-top h-10 w-10" alt="${catagory} image">
         <h2> ${catagory} </h2>
      `;

      cardsContainer.appendChild(card);
   }

}

/**
 * Handles click events on category cards
 * @param {string} catagory - The selected pet category
 */
async function handleCardClick(catagory) {
   // Remove active style from all cards
   const allButtons = document.querySelectorAll("#cards-container button");
   allButtons.forEach(btn => {
      btn.setAttribute("class", "border-1 border-stone-400 px-18 py-6 card bg-base-100 m-2 px-4 flex flex-row items-center justify-center gap-4 ");
   });

   // Hide all pet cards
   const pets = document.getElementById("pets");
   pets.innerHTML = "";

   // Fetch and display pets of the clicked category
   const res = await fetch(`https://openapi.programming-hero.com/api/peddy/category/${catagory}`);
   const data = await res.json();
   const petsData = data.data;

   petsData.forEach(pet => {
      const petCard = document.createElement("div");
      petCard.setAttribute("class", "card w-96 bg-base-100 shadow-xl m-2");
      // Show loading spinner
      const spinner = document.createElement("div");
      spinner.setAttribute("class", "flex justify-center items-center h-64 w-full");
      spinner.innerHTML = `

         <svg class="animate-spin h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
         <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
         <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
         </svg>
      `;
      petCard.appendChild(spinner);

      // Render actual content after at least 2 seconds
      (async () => {
         const start = Date.now();
         const render = () => {
          petCard.innerHTML = `
            <figure><img src="${pet.image}" alt="${pet.pet_name} image" class="h-64 w-full object-cover"></figure>
            <div class="card-body">
            <h2 class="card-title text-2xl">${pet.pet_name}</h2>
            <p>Breed: ${handle(pet.breed)}</p>
            <p>Birth: ${handle(pet.date_of_birth)}</p>
            <p>gender: ${handle(pet.gender)}</p>
            <p>price: ${handle(pet.price)}</p>
            <div class="card-actions justify-end">
            <button class="btn btn-success btn-outline" onclick="like_func('${pet.pet_name}', '${pet.petId}')">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
            Like
            </button>
            <button class="btn btn-success btn-outline adopt-btn">Adopt</button>
            <button class="btn btn-success" data-pet-id="${pet.petId}">Details</button>
            </div>
            </div>
          `;
          // Attach adoption process to the "Adopt" button
          const adoptBtn = petCard.querySelector('.adopt-btn');
          if (adoptBtn) {
            adoptBtn.onclick = function () {
               const btn = this;
               let count = 3;
               btn.disabled = true;
               const originalText = btn.textContent;
               const countdown = setInterval(() => {
                  if (count > 0) {
                     btn.textContent = `Adopting in ${count--}...`;
                  } else {
                     clearInterval(countdown);
                     btn.textContent = "Adopted";
                     btn.classList.remove("btn-outline");
                     btn.classList.add("btn-success", "opacity-70");
                  }
               }, 700);
            };
         }
         // Attach details process to the "Details" button
         const detailsBtn = petCard.querySelector('.details-btn');
         if (detailsBtn) {
            detailsBtn.addEventListener('click', function () {
               window.showPetDetails && window.showPetDetails(pet.petId);
            });
         }
         };
         const elapsed = Date.now() - start;
         if (elapsed < 2000) {
         setTimeout(render, 2000 - elapsed);
         } else {
         render();
         }
      })();
      pets.appendChild(petCard);
      });

      // Show message if no pets are available
      if (!petsData || petsData.length === 0) {
      const noPetsMsg = document.createElement("div");
      noPetsMsg.setAttribute("class", "text-center text-gray-500 text-xl my-8");
      noPetsMsg.textContent = "No pets available for this category.";
      pets.appendChild(noPetsMsg);
      }
   

   // ✅ Move this OUTSIDE the forEach loop
   const clickedBtn = document.getElementById(catagory);
   clickedBtn.setAttribute("class", "bg-green-200 text-white border-2 border-green-600 px-18 py-6 card m-2 px-4 flex rounded-2xl flex-row items-center justify-center gap-4");

   }

// ==================== Pet Display Functions ====================
/**
 * Updates the content of a pet card with pet data
 * @param {HTMLElement} petCard - The card element to update
 * @param {Object} pet - The pet data object
 */
function updatePetCard(petCard, pet) {
    petCard.innerHTML = `
        <figure><img src="${pet.image}" alt="${pet.pet_name} image" class="h-64 w-full object-cover"></figure>
        <div class="card-body">
            <h2 class="card-title text-2xl">${pet.pet_name}</h2>
            <p>Breed: ${handle(pet.breed)}</p>
            <p>Birth: ${handle(pet.date_of_birth)}</p>
            <p>gender: ${handle(pet.gender)}</p>
            <p>price: ${handle(pet.price)}</p>
            <div class="card-actions justify-end">
                <button class="btn btn-success btn-outline" onclick="like_func('${pet.pet_name}', '${pet.petId}')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    Like
                </button>
                <button class="btn btn-success btn-outline adopt-btn">Adopt</button>
                <button class="btn btn-success" data-pet-id="${pet.petId}">Details</button>
            </div>
        </div>
    `;
}

/**
 * Fetches and displays all pets in the main view
 */
async function pets_func() {
   const res = await fetch("https://openapi.programming-hero.com/api/peddy/pets");
   const data = await res.json();
   const pets = document.getElementById("pets");
   data.pets.forEach(pet => {
      const petCard = document.createElement("div");
      petCard.setAttribute("class", "card lg:w-96 sm:w-60 bg-base-100 shadow-xl m-2");
      // Show loading spinner
      const spinner = document.createElement("div");
      spinner.setAttribute("class", "flex justify-center items-center h-64 w-full");
      spinner.innerHTML = `

         <svg class="animate-spin h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
         <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
         <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
         </svg>
      `;
      petCard.appendChild(spinner);

      // Fetch pet details with at least 2 seconds spinner
      (async () => {
         const start = Date.now();
         // Actual content rendering
         const render = () => {
         petCard.innerHTML = `
            <figure><img src="${pet.image}" alt="${pet.pet_name} image" class="h-64 w-full object-cover"></figure>
            <div class="card-body">
            <h2 class="card-title text-2xl">${pet.pet_name}</h2>
            <p>Breed: ${handle(pet.breed)}</p>
            <p>Birth: ${handle(pet.date_of_birth)}</p>
            <p>gender: ${handle(pet.gender)}</p>
            <p>price: ${handle(pet.price)}</p>
            <div class="card-actions justify-end">
               <button class="btn btn-success btn-outline" onclick="like_func('${pet.pet_name}', '${pet.petId}')">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
               Like
               </button>
               <button class="btn btn-success btn-outline adopt-btn">Adopt</button>
               <button class="btn btn-success" data-pet-id="${pet.petId}">Details</button>
            </div>
            </div>
         `;

         // Attach adoption process to the "Adopt" button
         const adoptBtn = petCard.querySelector('.adopt-btn');
         if (adoptBtn) {
            adoptBtn.onclick = function () {
               const btn = this;
               let count = 3;
               btn.disabled = true;
               const originalText = btn.textContent;
               const countdown = setInterval(() => {
                  if (count > 0) {
                     btn.textContent = `Adopting in ${count--}...`;
                  } else {
                     clearInterval(countdown);
                     btn.textContent = "Adopted";
                     btn.classList.remove("btn-outline");
                     btn.classList.add("btn-success", "opacity-70");
                  }
               }, 700);
            };
         }
         // Attach details process to the "Details" button
         const detailsBtn = petCard.querySelector('.details-btn');
         if (detailsBtn) {
            detailsBtn.addEventListener('click', function () {
               window.showPetDetails && window.showPetDetails(pet.petId);
            });
         }
         };
         const elapsed = Date.now() - start;
         if (elapsed < 2000) {
         setTimeout(render, 2000 - elapsed);
         } else {
         render();
         }
      })();
      pets.appendChild(petCard);

   });
      // Adoption process
   petCard.querySelector('button.btn-outline[onclick^="adoptPet"]').onclick = function () {
   const btn = this;
   let count = 3;
   btn.disabled = true;
   const originalText = btn.textContent;
   const countdown = setInterval(() => {
      if (count > 0) {
         btn.textContent = `Adopting in ${count--}...`;
      } else {
         clearInterval(countdown);
         btn.textContent = "Adopted";
         btn.classList.remove("btn-outline");
         btn.classList.add("btn-success", "opacity-70");
      }
   }, 700);
   };
   // Modal HTML (add only once)
   if (!document.getElementById("pet-details-modal")) {
      const modal = document.createElement("div");
      modal.id = "pet-details-modal";
      modal.style.display = "none";
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100vw";
      modal.style.height = "100vh";
      modal.style.background = "rgba(0,0,0,0.5)";
      modal.style.zIndex = "1000";
      modal.innerHTML = `
      <div id="pet-details-content" style="background:white;max-width:700px;margin:5% auto;padding:2rem;position:relative;border-radius:1rem;">
         <div id="pet-details-body"></div>
      </div>
      `;
      document.body.appendChild(modal);

      };
   }

// ==================== Like Feature ====================
/**
 * Handles the like functionality for pets
 * @param {string} pet_name - Name of the pet
 * @param {string} id - Pet ID
 */
const liked = document.getElementById("liked")
async function like_func(pet_name,id) {
   const likeButton = document.querySelector(`button[onclick="like_func('${pet_name}', '${id}')"]`);

      likeButton.classList.add("btn-error");
      likeButton.innerHTML = `
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
         </svg>
         Liked
      `;
   // Create a new liked pet element
   const likedPet = document.createElement("img");
   likedPet.setAttribute("class", "bg-green-100 rounded-lg");


   // Fetch the pet data from the API
   const res = await fetch(`https://openapi.programming-hero.com/api/peddy/pet/${id}`);
   const data = await res.json();
   const pet = data.petData;
   console.log(pet);
   likedPet.src = pet.image;
   likedPet.alt = `${pet.pet_name} image`;
   likedPet.classList.add("h-40", "w-40", "object-cover", "m-2", "rounded-lg", "border-2", "border-green-500","border-solid");
   likedPet.setAttribute("title", pet.pet_name);

   liked.appendChild(likedPet);
   

}

// ==================== Modal Management ====================
/**
 * Creates the pet details modal structure
 * @returns {HTMLElement} The created modal element
 */
function createModal() {
    const modal = document.createElement("div");
    modal.id = "pet-details-modal";
    modal.style.display = "none";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.5)";
    modal.style.zIndex = "1000";
    modal.innerHTML = `
        <div id="pet-details-content" style="background:white;max-width:700px;margin:5% auto;padding:2rem;position:relative;border-radius:1rem;">
            <div id="pet-details-body"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

/**
 * Shows pet details in the modal
 * @param {string} petId - ID of the pet to display
 */
window.showPetDetails = async function(petId) {
      console.log(petId);
      const res = await fetch(`https://openapi.programming-hero.com/api/peddy/pet/${petId}`);
      const data = await res.json();
      const pet = data.petData;
      const body = document.getElementById("pet-details-body");
      body.innerHTML = `
      <img src="${pet.image}" alt="${pet.pet_name} image" class="w-full h-64 object-cover rounded-lg mb-4">
      <h2 class="text-2xl font-bold mb-2">${pet.pet_name}</h2>
      <p><strong>Breed:</strong> ${handle(pet.breed)}</p>
      <p><strong>Birth:</strong> ${handle(pet.date_of_birth)}</p>
      <p><strong>Gender:</strong> ${handle(pet.gender)}</p>
      <p><strong>Price:</strong> ${handle(pet.price)}</p>
      <p><strong>Description:</strong> ${handle(pet.description)}</p>
      <p><strong>Color:</strong> ${handle(pet.color)}</p>
      <p><strong>Weight:</strong> ${handle(pet.weight)}</p>
      <p><strong>Location:</strong> ${handle(pet.location)}</p>
      <hr class="my-4">
      <p><strong>Info</strong> ${handle(pet.pet_details)}</p>
      <button id="close-pet-details" class="btn btn-success mt-4 w-full">Close</button>
      `;
      document.getElementById("pet-details-modal").style.display = "block";
      document.getElementById("close-pet-details").onclick = function() {
      document.getElementById("pet-details-modal").style.display = "none";
   };
}

// ==================== Event Listeners ====================
// Sort button click handler
document.getElementById("sort").addEventListener("click", async function () {
   const petsContainer = document.getElementById("pets");
   const petCards = Array.from(petsContainer.children);

   petCards.sort((a, b) => {
      console.log(a,b)
      const priceA = parseFloat(a.querySelector("p:nth-child(5)").textContent.replace(/[^0-9.]/g, "")) || 0;
      const priceB = parseFloat(b.querySelector("p:nth-child(5)").textContent.replace(/[^0-9.]/g, "")) || 0;
      return priceA - priceB;
   });

   petsContainer.innerHTML = "";
   petCards.reverse(); 
   petCards.forEach(card => petsContainer.appendChild(card));
});

// Global click handler for details buttons
document.addEventListener('click', async function(e) {
    if (e.target.hasAttribute('data-pet-id')) {
        const petId = e.target.getAttribute('data-pet-id');
        const modal = document.getElementById("pet-details-modal") || createModal();
        
        try {
            const res = await fetch(`https://openapi.programming-hero.com/api/peddy/pet/${petId}`);
            const data = await res.json();
            const pet = data.petData;
            
            const body = document.getElementById("pet-details-body");
            body.innerHTML = `
                <img src="${pet.image}" alt="${pet.pet_name} image" class="w-full h-64 object-cover rounded-lg mb-4">
                <h2 class="text-2xl font-bold mb-2">${pet.pet_name}</h2>
                <p><strong>Breed:</strong> ${handle(pet.breed)}</p>
                <p><strong>Birth:</strong> ${handle(pet.date_of_birth)}</p>
                <p><strong>Gender:</strong> ${handle(pet.gender)}</p>
                <p><strong>Price:</strong> ${handle(pet.price)}</p>
                <p><strong>Description:</strong> ${handle(pet.description)}</p>
                <p><strong>Color:</strong> ${handle(pet.color)}</p>
                <p><strong>Weight:</strong> ${handle(pet.weight)}</p>
                <p><strong>Location:</strong> ${handle(pet.location)}</p>
                <hr class="my-4">
                <p><strong>Info</strong> ${handle(pet.pet_details)}</p>
                <button id="close-pet-details" class="btn btn-success mt-4 w-full">Close</button>
            `;
            
            modal.style.display = "block";
            document.getElementById("close-pet-details").onclick = () => modal.style.display = "none";
        } catch (error) {
            console.error('Error fetching pet details:', error);
        }
    }
});

// ==================== Initialize Application ====================
// Start the application by fetching categories and pets
cards_function();
pets_func();