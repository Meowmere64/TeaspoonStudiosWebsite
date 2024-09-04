import Cookies from "./js-cookie/api.mjs"

let images = [
    "DONTLOOKATHIM.png",
    "DONTMAKEASOUND.png",
    "FLESH_BONES_EYES_BLEEDING_CRACKED_BROKEN_I_MANGLED_HIS_SKIN_AND_NOW_HE_WALKS_THE_HALLS_AGAIN.png",
    "LISTENCLOSELY.png",
    "WATCHCLOSELY.png",
    "iamstillhere.png",
    "online.png"
]

let index = Math.floor(Math.random()*images.length);

let ee = Math.floor(Math.random()*100);

document.getElementById("teaser").src = "Images/" + images[index];

let val = Cookies.get('firstVisit');



if(val == undefined){
    document.getElementById("teaser").src = "Images/online.png";
    Cookies.set('firstVisit', 1);
}


if(ee == 69){
    document.getElementById("teaser").src = "Images/scott-scott_the_woz.gif";
    document.getElementById("teaser").className = "ee";
}