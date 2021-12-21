/** Connect to Moralis server */
const serverUrl = "https://bnxgs8otj3kp.usemoralis.com:2053/server";
const appId = "micWkJVwFOayEP6ZdSSZB61cjwn8756q9yQy2Xqh";
const CONTRACT_ADDRESS = "0xF61FB7CFd88b5751f93963E29B88dE6fb2E6B984";
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

        let petId = 0;
        window.web3 = await Moralis.enableWeb3();
        let abi = await getAbi();
        let contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
        console.log(ethereum.selectedAddress);
        let data = await contract.methods.getTokenDetails(petId).call({from: ethereum.selectedAddress});
        let pet = new Pet(petId, data.damage, data.magic, data.lastMeal, data.endurance);
        renderPet(pet);
    } else {
        $('#game').hide();
        $('#btn-login').show();
    }
}

function renderPet(pet){
    $('#pet_id').html(pet.id);
    $('#pet_damage').html(pet.damage);
    $('#pet_magic').html(pet.magic);
    $('#pet_endurance').html(pet.endurance);
    $('#btn-feed').attr('data-pet-id', pet.id);

    let deathTime = new Date((parseInt(pet.lastMeal) + parseInt(pet.endurance)) * 1000 );
    let now = new Date();

    if (now >  deathTime) {
        $('#pet_starvation_time').html('<b>DEAD</b>');
    } else {
        $('#pet_starvation_time').html(deathTime);
    }
    
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
$('#btn-feed').click(() => {
    console.log('feeed');
    let petId = $('#btn-feed').attr('data-pet-id');
    feed(petId);
});


init();