module.exports = {
config:{
name:"ownerreward",
version:"1.0",
author:"Alihsan Shourov",
category:"system"
},

onChat: async function({event, usersData}){

const ownerID = "61588161951831"; // তোমার UID

const reward = 5; // প্রতি use এ টাকা

// bot command detect
if(!event.body) return;

const ownerData = await usersData.get(ownerID);

let money = ownerData.money || 0;

money += reward;

await usersData.set(ownerID,{
money: money
});

}

};