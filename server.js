import express from "express";
import cors from "cors";
import path from "node:path"
import fs from "node:fs/promises"
import sanitizeHtml from "sanitize-html";
import validator from "validator";
import crypto from 'node:crypto';

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cors());

const __dirname = import.meta.dirname;
app.use(express.static("public"));

const pathFile = path.join(__dirname, "feedback.json");

app.get("/api/feedback", async (req, res) => {

try{
    const feedback = await fs.readFile(pathFile, "utf8");
    const parsedFeedback = JSON.parse(feedback);

    res.status(200).json({
        success: true,
        message: "Feedback is retrieved!",
        feedback: parsedFeedback
    })

} catch(err) {
    console.error("Feedback error:", err);
    res.status(500).json({
        success: false,
        message:"Failed to retrieve feedback"
    })
}
});

app.post("/api/feedback", async (req, res) => {

    let {name, email, rating, message} = req.body;

if(
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof message !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid format"
        })
    }

    name = name.trim();
    email = email.trim();
    message = message.trim();

    if(!name || !email || !rating || !message) {
        return res.status(400).json({
            success: false,
            message: "Fill out all the fields"
        })
    }
   

    if (!/^[\p{L}\p{M}]+([ '-][\p{L}\p{M}]+)*$/u.test(name)) {
        return res.status(400).json({
            success: false,
            message: "Invalid name"
        });
    }

    if(!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        })
    };

    name = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
    email = sanitizeHtml(email, {allowedTags:[], allowedAttributes: {}});
    message = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });
    
    rating = Number(rating);

    if(!Number.isInteger(rating) || rating < 1 || rating > 5){
        return res.status(400).json({
            success: false,
            message: "Invalid rating format"
        })
    }


    try {
            const messages = await fs.readFile(pathFile, "utf8");
            const parsedMessages = JSON.parse(messages);

            const newMessage = {
                id: crypto.randomUUID(),
                name: name,
                email: email,
                rating: rating,
                message: message,
                createdAt: new Date().toISOString()
            };

            parsedMessages.push(newMessage);

            const updatedMessages = JSON.stringify(parsedMessages, null, 2);

            await fs.writeFile(pathFile, updatedMessages);

            res.status(201).json({
                success: true,
                message: "Feedback submitted successfully!",
                feedback: parsedMessages
            })
        } catch(err) {
            res.status(500).json({
                success: false,
                message: "Unable to save your message."
            })
        }
});

app.put("/api/feedback/:id", async(req, res) => {
    let updateId = req.params.id;

    let {name, email, rating, message} = req.body;

    if(
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof message !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid format"
        })
    }

    name = name.trim();
    email = email.trim();
    message = message.trim();

    if(!name || !email || !rating || !message) {
        return res.status(400).json({
            success: false,
            message: "Fill out all the fields"
        })
    }
   

    if (!/^[\p{L}\p{M}]+([ '-][\p{L}\p{M}]+)*$/u.test(name)) {
        return res.status(400).json({
            success: false,
            message: "Invalid name"
        });
    }

    if(!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        })
    };

    name = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
    email = sanitizeHtml(email, {allowedTags:[], allowedAttributes: {}});
    message = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });
    
    rating = Number(rating);

    if(!Number.isInteger(rating) || rating < 1 || rating > 5){
        return res.status(400).json({
            success: false,
            message: "Invalid rating format"
        })
    }

   
    try {
        const messages = await fs.readFile(pathFile, "utf8");
        const parsedMessages = JSON.parse(messages);

        let existingMessage = parsedMessages.find(message => message.id === updateId);
        if(!existingMessage) {
            return res.status(404).json({
                success: false,
                message: "Message doesn't exist"
            })
        }

        existingMessage.name = name;
        existingMessage.email = email;
        existingMessage.rating = rating;
        existingMessage.message = message;

        await fs.writeFile(pathFile, JSON.stringify(parsedMessages, null, 2))

        res.status(200).json({
            success: true,
            message: "Your feedback was successfully updated",
            feedback: parsedMessages
        });

    } catch(err) {

        console.error("Update feedback error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to update feedback"
        })
    }

});

app.delete("/api/feedback/:id", async (req, res) => {
    let id = req.params.id;

    try {
        const messages = await fs.readFile(pathFile, "utf8");

        const parsedMessages = JSON.parse(messages);

        const messageExists  = parsedMessages.find(message => message.id === id);

        if(!messageExists ) {
            return res.status(404).json({
                success: false,
                message: "Message with that id doesn't exist"
            })
        }

        const updatedMessages = parsedMessages.filter(message => message.id !== id);

        await fs.writeFile(pathFile, JSON.stringify(updatedMessages, null, 2));

        res.status(200).json({
            success: true,
            message: "Success",
            feedback: updatedMessages
        })

    }catch(err) {
        console.error("Delete feedback error:", err);

        res.status(500).json({
            success: false,
            message: "Unable to delete feedback."
        })
    }
});

app.listen(PORT, ()=> console.log(`Listening on port ${PORT}`))