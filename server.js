import express from "express";
import path from "node:path";
import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use("/", express.static("public"));
const packageFile = path.resolve("data", "history.json");

function readJsonFile() {
    const file = fs.readFileSync(packageFile, {
        encoding: "utf-8",
        flag: "r+"
    });
    return JSON.parse(file);
};

function writeToJsonFile(data) {
    fs.writeFileSync(packageFile, JSON.stringify(data));
};

app.get("/", (req, res) => {
    res.sendFile(path.resolve("public", "index.html")); //<----------
});
app.use(bodyParser.json());

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

app.post("/cardManager", (req, res) => {
    try {
        if (!req.body.cardName) {
            throw new ValidationError("Missing a card");
        }
        if (!req.body.deck) {
            throw new ValidationError("Missing deck assignment");
        }
        const data = readJsonFile();
        data.push({
            id: uuidv4(), bought: false, prio: 3,
            cardName: req.body.cardName, deck: req.body.deck,
        });
        writeToJsonFile(data);
        res.send({message: `${req.body.cardName} has been added`});
    } catch (error) {
        console.error(JSON.stringify({ error: error.message, fn: "/cardManager"}));
        if (error instanceof ValidationError) {
            res.status(400).send({ error: error.message });
        } else {
            res.status(500).send({ error: "Unable to write a new card"});
        }
    }
});

app.get("/shoppingList", (req, res) => {
    try {
        const data = readJsonFile();
        res.send(data);
    } catch (error) {
        console.log(JSON.stringify({ error: error.message, fn: "/shoppingList"}));
        res.status(500).send({ error: "Unable to load shopping list"});
    }
});

app.put("/cardManager/bought/:id", (req, res) => {
    try {
        const data = readJsonFile().map((item) => {
            if (item.id === req.params.id) {
                item.bought = !item.bought;
            }
            return item;
        });
        writeToJsonFile(data);
        res.json(data.filter((d) => d.id === req.params.id));
    } catch (error) {
        console.log(error);
        res.status(500)
        .send({ error: "Unable to update. Try again later..."});
    }
});

app.put("/cardManager/type/:id", (req, res) => {
    try {
        if (req.body.type > 3) {
            throw new ValidationError("");
        }
        const data = readJsonFile().map((data) => {
            if (data.id === req.params.id) {
                data.type = Number.parseInt(req.body.type);
            }
            return data;
        });
        writeToJsonFile(data);
        res.json(data.filter((d) => d.id === req.params.id));
    } catch (error) {
        console.error(JSON.stringify({ error: error.message,
            fn: "/cardManager/type/:id"}),);//<---------
        if (error instanceof ValidationError) {
            res.status(400).send({error: error.message});
        } else {
            res.status(500)
                .send({error: "Someething went wrong. Try again later..."});
        }
    }
});

app.delete("/cardManager/delete/:id", (req, res) => {
    try {
        const data = readJsonFile().filter((d) => d.id !== req.params.id);
        writeToJsonFile(data);
        res.send("data");
    } catch (error) {}
});

app.listen(port, () => {
    console.log(`Server is ready on port: ${port}`);
});
