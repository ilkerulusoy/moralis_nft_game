/** Connect to Moralis server */
const serverUrl = "https://bnxgs8otj3kp.usemoralis.com:2053/server";
const appId = "micWkJVwFOayEP6ZdSSZB61cjwn8756q9yQy2Xqh";
const CONTRACT_ADDRESS = "0xae59E4fc39057DaEB320c762fb44d92B6B65D7f7";
Moralis.start({ serverUrl, appId });

let Pet = class {
    constructor(id, damage, magic, lastMeal, endurance) {
        this.damage = damage;
        this.magic = magic;
        this.lastMeal = lastMeal;
        this.endurance = endurance;
        this.id = id;
        this.starvation_time = 0;
    }
}

async function init(){
  renderGame();
}

function getUser() {
    try {
        let user = Moralis.User.current();
        return user;
    } catch {
        return null;
    }
}

/** Add from here down */
async function login() {
  let user = Moralis.User.current();
  if (!user) {
   try {
      user = await Moralis.authenticate({ signingMessage: "Hello World!" });
      console.log(user);
      console.log(user.get('ethAddress'));
      renderGame();
   } catch(error) {
     console.log(error)
   }
  }
}

async function logOut() {
  await Moralis.User.logOut();
  console.log("logged out");
  renderGame();
}

async function renderGame() {
    console.log('render game');
    let user = getUser();
    if (user) {
        console.log('user logged');
        $('#game').show();
        $('#btn-login').hide();

        window.web3 = await Moralis.enableWeb3();
        let abi = await getAbi();
        let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
        console.log(ethereum.selectedAddress);
        let petList = await contract.methods.getAllTokensForUser(ethereum.selectedAddress).call({from: ethereum.selectedAddress});
        console.log(petList);
        $('#pet-row').empty();
        petList.forEach(async (petId) => {
            let data = await contract.methods.getTokenDetails(petId).call({from: ethereum.selectedAddress});
            let pet = new Pet(petId, data.damage, data.magic, data.lastMeal, data.endurance);
            renderPet(pet);
        })
        $('#game').show();
    } else {
        $('#game').hide();
        $('#btn-login').show();
    }
}

function renderPet(pet){

    let deathTime = new Date((parseInt(pet.lastMeal) + parseInt(pet.endurance)) * 1000 );
    let now = new Date();
    let dateStr = '';

    if (now >  deathTime) {
        dateStr = '<b>DEAD</b>';
    } else {
        dateStr = deathTime;
    }

    var htmlString = `
    <div class="col-md-4 card">
        <img class="card-img-top pet_img" src="assets/pet.png" id="pet_img">
        <div class="card-body">
            <div>Id : <span class="pet_id">${pet.id}</span></div>
            <div>Damage : <span class="pet_damage">${pet.damage}</span></div>
            <div>Magic : <span class="pet_magic">${pet.magic}</span></div>
            <div>Endurance : <span class="pet_endurance">${pet.endurance}</span></div>
            <div>Time to startvation : <span class="pet_starvation_time">${dateStr}</span></div>
            <button id="pet_${pet.id}" data-pet-id="${pet.id}" class="btn btn-primary btn-block btn-feed">Feed</button>
        </div>
    </div>
    `;

    let element = $.parseHTML(htmlString);
    $('#pet-row').append(element);

    $(`#pet_${pet.id}`).click(() => {
        console.log('feeed');
        feed(pet.id);
    });
    
}

function getAbi(){
    return new Promise( (res) => {
        $.getJSON("assets/abi/Token.json", ( (json) => {
            console.log(json.abi);
            res(json.abi);
        }))
    })
}

async function feed(petId){
    console.log(petId);
    let abi = await getAbi();
    let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
    console.log(ethereum.selectedAddress);
    let data = await contract.methods.feed(petId).send({from: ethereum.selectedAddress}).on("receipt", ( () => {
        console.log('done');
        renderGame();
    }))
}

document.getElementById("btn-login").onclick = login;
document.getElementById("btn-logout").onclick = logOut;

init();