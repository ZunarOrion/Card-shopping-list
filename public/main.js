console.log("Main is working");

let cardName = "";
let deck = "";
let shoppingList = [];

const cardInput = document.getElementById("cardInput");
const deckInput = document.getElementById("deckInput");
const submit = document.getElementById("submitButton");
const list = document.getElementById("cardShoppingList");
const loadingMessage = document.getElementById("loading");
const errorMessage = document.getElementById("errorNotification");

const createEntry = async () => {
    const res = await fetch(`/cardManager`, {
        method: "POST",
        body: JSON.stringify({
            cardName,
            deck,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const body = await res.json();
    if (!res.ok) {
        throw new Error(body.errorMessage);
    }
    const greeting = body.message;
    document.getElementById("addedMessage").innerHTML = greeting;
    cardInput.value = "";
    deckInput.value = "";
    cardName = "";
    deck = "";
    renderShoppingList();
};

const getShoppingList = async () => {
    const res = await fetch("/shoppingList");
    const body = await res.json();
    if (!res.ok) {
        throw new Error(body.errorMessage);
    }
    shoppingList = body;
};

const updateBought = async (event) => {
    const res = await fetch(`/cardManager/bought/${event.target.id}`, {
        method: "PUT",
    });
    const body = res.json();
    if (!res.ok) {
        throw new Error(body.errorMessage);
    }
    renderShoppingList();
};

const updateType = async (event) => {
    const res = await fetch(`/cardManager/type/${event.target.id}`, {
        method: "PUT",
        body: JSON.stringify({
            type: event.target.value,
        }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const body = res.json();
    if (!res.ok) {
        throw new Error(body.errorMessage);
    }
    renderShoppingList();
};

const deleteEntry = async (event) => {
    await fetch(`/cardManager/delete/${event.target.id}`, {
        method: "DELETE",
    });
    renderShoppingList();
};

const createLiNoDataAvailable = () => {
    const container = document.createElement("li");
    container.textContent = "No data available";
    return container;
};

const createCheckBoxColumn = (item) => {
    const container = document.createElement("div");
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.id = item.id;
    checkBox.checked = item.bought;
    container.appendChild(checkBox);
    checkBox.addEventListener("click", updateBought);
    return container;
};

const createTypeDropdown = (item) => {
    const container = document.createElement("div");
    const dropdown = document.createElement("select");
    dropdown.id = item.id;
    const typeArr = [1, 2, 3];
    for (type of typeArr) {
        dropdown.options.add(new Option(type, type));
    }
    dropdown.value = item.type;
    dropdown.addEventListener("change", updateType);
    container.appendChild(dropdown);
    return container;
};

const createTextNodeColumn = (item) => {
    const container = document.createElement("div");
    container.textContent = `${item.cardName} ${item.deck}`;
    if (item.bought) {
        container.style.textDecoration = "line-through";
    } else {
        container.style.textDecoration = "none";
    }
    return container;
};

const createRemoveButtonColumn = (id) => {
    const container = document.createElement("div");
    const button = document.createElement("button");
    button.id = id;
    button.innerHTML = "X";
    container.appendChild(button);
    container.addEventListener("click", deleteEntry);
    return container;
};

const createLiElementRow = (item) => {
    const container = document.createElement("li");
    if (item.bought) {
        container.style.backgroundColor = "green";
        container.style.borderRadius = "5px";
    }
    container.appendChild(createCheckBoxColumn(item));
    container.appendChild(createTypeDropdown(item));
    container.appendChild(createTextNodeColumn(item));
    container.appendChild(createRemoveButtonColumn(item.id));
    return container;
};

const sortTypes = () => shoppingList.sort((a, b) => {
    if (a.type < b.type) {
        return -1;
    }
    if (a.type > b.type) {
        return 1;
    }
    return 0;
});

const renderShoppingList = async () => {
    try {
        await getShoppingList();
        list.innerHTML = "";
        if (shoppingList.length) {
            for (n of sortTypes()) {
                const listElement = createLiElementRow(n);
                list.appendChild(listElement);
            }
        } else {
            const el = createLiNoDataAvailable();
            list.appendChild(el);
        }
    } catch (errorM) {
        errorMessage.textContent = errorMessage.message;
    }
};

const handleCard = (event) => {
    cardName = event.target.value;
    event.target.value = cardName;
};

const handleDeck = (event) => {
    deck = event.target.value;
    event.target.value = deck;
};

const handleEnterKeyPress = (event, nameType) => {
    if (event.key === "Enter") {
        if (nameType === "cardName") {
            handleCard(event);
        }
        if (nameType === "deck") {
            handleDeck(event);
        }
        if (!cardName) {
            errorMessage.textContent = "No card submitted";
            return;
        }
        if (!deck) {
            errorMessage.textContent = "No deck submitted";
            return;
        }
        errorMessage.innerText = "";
        createEntry();
    }
};

submit.addEventListener("click", createEntry);

cardInput.addEventListener("change", handleCard);
deckInput.addEventListener("change", handleDeck);

cardInput.addEventListener("keypress", (event) =>
    handleEnterKeyPress(event, "cardName"));
deckInput.addEventListener("keypress", (event) =>
    handleEnterKeyPress(event, "deck"));

document.addEventListener("DOMContentLoaded", renderShoppingList);
