import "/lib/cycle.js";

let Tierlist = [];
let currentDraggingElement;

function rebuildTierlist(){
    document.getElementById("tierlist").innerHTML = "";
    Tierlist.forEach(tier => {
        tier.makeHTML();
    });

    let listings = document.getElementsByClassName("listing");
    for(let i = 0; i < listings.length; i++){
        let element = listings[i]
        element.addEventListener("mousedown", mouseDownListing);
    }
}

function shuffleItem(array,item,down){
    if(!array.includes(item))
    {
        console.log("WUH WOH");
        return;
    }

    let oldIndex = array.findIndex((element) => element==item);
    if((oldIndex == 0 && !down) || (oldIndex == array.length-1 && down))
    {
        console.log("damn");
        return;
    }
    
    array.splice(oldIndex,1);
    if(down){
        array.splice(oldIndex+1,0,item);
    } else {
        array.splice(oldIndex-1,0,item);
    }
}

class Tier{
    items = [];
    name = "Tier";
    color = "#FFFFFF";

    constructor(name, color, items = []){
        this.name = name;
        this.color = color;
        this.items = items;
        Tierlist.splice(0,0,this);
    }

    getIndexOfItem(item){
        return this.items.findIndex((element) => element==item);
    }

    getItemFromElement(element){
        let chosenItem = null;
        this.items.forEach(item => {
            if(item.text == element.id)
            {
                chosenItem = item;
                return;
            }
        });
        return chosenItem;
    }

    addToTier(item, makeHTML = false){
        this.items.push(item);
        item.ownedTier = this;
        if(!makeHTML)
            return;

        let html = item.makeHTML();
        html.addEventListener("mousedown", mouseDownListing);
        let listingHolder = document.getElementById(this.name).querySelector(".listingHolder");
        listingHolder.appendChild(html);
        this.reorderItems();
    }

    removeItem(item){
        this.items.splice(this.getIndexOfItem(item),1);
    }

    moveItem(item,down){
        shuffleItem(this.items,item,down);
        this.reorderItems();
    }

    reorderItems(){
        for(let i = 0; i < this.items.length; i++){
            let element = document.getElementById(this.items[i].text);
            if(element == null)
            {
                console.log("fuck");
                this.items.splice(i);
                i--;
                continue;
            }
            element.style.order = i;
        }
    }

    makeHTML(){
        let thisTier = this;

        let tier = document.createElement("div");
        tier.className = "rank";
        tier.id = this.name;

        let rankLabel = tier.appendChild(document.createElement("div"));
        rankLabel.className = "rankLabel";
        rankLabel.innerHTML = this.name;

        let listingHolder = tier.appendChild(document.createElement("div"));
        listingHolder.className = "listingHolder";

        let controlHolder = tier.appendChild(document.createElement("div"));
        controlHolder.className = "controlHolder"

        let upArrow = document.createElement("button")
        upArrow.innerHTML = "↑";
        controlHolder.appendChild(upArrow);
        upArrow.addEventListener("click", function(){
            shuffleItem(Tierlist,thisTier,false);
            rebuildTierlist();
        });

        let downArrow = document.createElement("button")
        downArrow.innerHTML = "↓";
        controlHolder.appendChild(downArrow);
        downArrow.addEventListener("click", function(){
            shuffleItem(Tierlist,thisTier,true);
            rebuildTierlist();
        });

        let editButton = document.createElement("button")
        editButton.innerHTML = "✎";
        controlHolder.appendChild(editButton);
        editButton.addEventListener("click", function(){
            let text = window.prompt("Input Tier Name:")
            if(text == "" || text == null)
                return;
            thisTier.name = text;
            rebuildTierlist();
        });

        let deleteButton = document.createElement("button")
        deleteButton.innerHTML = "✖";
        controlHolder.appendChild(deleteButton);
        deleteButton.addEventListener("click", function(){
            if(Tierlist.length <= 1)
            {
                window.alert("You can't delete the only tier left!");
                return;
            }
            if(!window.confirm("Are you sure? All items within will be moved to the last tier."))
                    return;


            let lastTier = (Tierlist[Tierlist.length-1] == thisTier) ? Tierlist[Tierlist.length-2] : Tierlist[Tierlist.length-1];
            thisTier.items.forEach(element => {
                //thisTier.removeItem(element);
                lastTier.addToTier(element);
            });
            Tierlist.splice(Tierlist.findIndex((element) => element==thisTier),1);
            rebuildTierlist();
        });
        
        this.items.forEach(item => {
            listingHolder.appendChild(item.makeHTML());
        });

        tier.style.borderLeftColor = this.color

        document.getElementById("tierlist").appendChild(tier);
    }
}

function findItemByElement(element){
    let chosenItem = null;
    Tierlist.forEach(tier => {
        let item = tier.getItemFromElement(element)
        if(item != null)
        {
            chosenItem = item;
            return;
        }
    });
    return chosenItem;
}



class Item{
    ownedTier;
    text = "Item";
    image = "";

    constructor(text, image = "", ownedTier = null){
        this.ownedTier = ownedTier;
        this.text = text;
        this.image = image;
    }   
    makeHTML(){
        let thisItem = this;
        let listing = document.createElement("div");
        listing.innerHTML = this.text;
        listing.className = "listing";
        if(this.image != "")
        {
            let img = document.createElement("img");
            img.src = this.image;
            listing.appendChild(img);
        }

        let deleteButton = document.createElement("button")
        deleteButton.innerHTML = "✖";
        listing.appendChild(deleteButton);
        deleteButton.addEventListener("click", function(){
            thisItem.ownedTier.removeItem(thisItem);
            rebuildTierlist();
        })


        listing.id = this.text;
        return listing;
    }
}

let tier = new Tier("Unranked", "#FFF");

/*
for(let i = 0; i < 10; i++){
    let testItem = new Item("IDK STUFF " + i, "https://images.pexels.com/photos/18069008/pexels-photo-18069008.jpeg?cs=srgb&dl=pexels-shoaib-asif-18069008.jpg&fm=jpg");
    tier.addToTier(testItem);
    //document.getElementById("testlist").appendChild(testItem.makeHTML());
}*/

tier.makeHTML();



function mouseDownListing(event){
    let listing = event.srcElement;
    listing.className += " ghost";
    currentDraggingElement = listing;
}



document.addEventListener("mouseup", function(event){
    if(currentDraggingElement == null)
        return;
    currentDraggingElement.className = currentDraggingElement.className.replace(" ghost","");

    currentDraggingElement = null;
})

document.getElementById("tierlist").addEventListener("mousemove", function(e){
    if(currentDraggingElement != null){
        var rect = currentDraggingElement.getBoundingClientRect();
        var y = e.clientY - (rect.top + (rect.height / 2));  //y position within the element.

        let item = findItemByElement(currentDraggingElement);
        let tier = item.ownedTier;
        let index = tier.getIndexOfItem(item);

        if(y > (rect.height / 2)){
            if(index == tier.items.length-1)
            {
                let tierIndex = Tierlist.findIndex((element) => element==tier);
                if(Tierlist[tierIndex+1] == undefined)
                    return;

                tier.removeItem(item);
                tier.reorderItems();
                let newTier = Tierlist[tierIndex+1];
                newTier.addToTier(item);
                newTier.reorderItems();
                document.getElementById(newTier.name).querySelector(".listingHolder").appendChild(document.getElementById(item.text));
                return;
            }

            tier.moveItem(tier.getItemFromElement(currentDraggingElement),true);
        } else if (y < - (rect.height / 2)) {
            if(index == 0){
                let tierIndex = Tierlist.findIndex((element) => element==tier);
                if(Tierlist[tierIndex-1] == undefined)
                    return;

                tier.removeItem(item);
                tier.reorderItems();
                let newTier = Tierlist[tierIndex-1];
                newTier.addToTier(item);
                newTier.reorderItems();
                document.getElementById(newTier.name).querySelector(".listingHolder").appendChild(document.getElementById(item.text));
                return;
            }

            tier.moveItem(tier.getItemFromElement(currentDraggingElement),false);
        }
    }
})

document.getElementById("addtierbutton").addEventListener("click",function(event){
    let name = document.getElementById("tiername").value;
    document.getElementById("tiername").value = "";
    if(name == "")
        return;
    let color = document.getElementById("tiercolor").value;

    let tier = new Tier(name,color);
    tier.makeHTML();
    rebuildTierlist();
})

document.getElementById("additembutton").addEventListener('click',function(event){
    
    let name = document.getElementById("itemname").value;
    if(name == "")
        return;
    let image = document.getElementById("itemimg").value;

    let item = new Item(name,image);
    Tierlist[Tierlist.length-1].addToTier(item,true);
})

document.getElementById("savebutton").addEventListener("click",function(){

    let listData = JSON.stringify(JSON.decycle(Tierlist));
    let bb = new Blob([listData], {type: "text/plain"});
    let a = document.createElement("a");
    a.download = document.getElementById("savename").value + ".tlist";
    a.href = window.URL.createObjectURL(bb);
    a.click();
})

document.getElementById("loadbutton").addEventListener("click", function(){
    const selectedFile = document.getElementById("loadlistFile").files[0];
    let reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            Tierlist = [];
            let tempTierlist = JSON.retrocycle(JSON.parse(reader.result));
            for(let i = tempTierlist.length-1; i >= 0; i--){
                let element = tempTierlist[i];
                let tier = new Tier(element.name,element.color);

                element.items.forEach(itemelement => {
                    let item = new Item(itemelement.text,itemelement.image,tier);
                    tier.addToTier(item);
                });
            }
            tempTierlist.forEach(element => {

            });

            rebuildTierlist();
        },
        false
    );

    if(selectedFile)
        reader.readAsText(selectedFile);
})


rebuildTierlist();