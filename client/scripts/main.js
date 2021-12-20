/** Connect to Moralis server */
const serverUrl = "https://bnxgs8otj3kp.usemoralis.com:2053/server";
const appId = "micWkJVwFOayEP6ZdSSZB61cjwn8756q9yQy2Xqh";
const CONTRACT_ADDRESS = "0x63ca4fC5103F3650034EDd1cE488867B66C2304c";
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
    let user = getUser();
    if (user) {
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
    $('#pet_starvation_time').html(pet.starvation_time);
}

function getAbi(){
    return new Promise( (res) => {
        $.getJSON("assets/abi/Token.json", ( (json) => {
            console.log(json.abi);
            res(json.abi);
        }))
    })
}

document.getElementById("btn-login").onclick = login;
document.getElementById("btn-logout").onclick = logOut;

init();