const feedbackList = document.querySelector("#feedback-list");
const statusSection = document.querySelector("#status");
const form = document.querySelector("#feedback-form");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const messageInput = document.querySelector("#message");

let editingId = null;

const handleGet = async () => {
    statusSection.textContent = "Loading feedback";
    feedbackList.replaceChildren();

    try {

        const res = await fetch("/api/feedback");

        if(!res.ok) {
            throw new Error("Failed to fetch messages");
        }

        const data = await res.json();

        statusSection.textContent = "";

        renderFeedback(data.feedback);

    } catch(err) {
        statusSection.textContent = err.message;
    }
};

const handlePost = async (e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(form));

    try {
        const res = await fetch("/api/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to save the feedback.");
        }

        const data = await res.json();
        renderFeedback(data.feedback);

        form.reset();
        statusSection.textContent = "Feedback submitted successfully!";

    } catch (err) {
        statusSection.textContent = err.message;
    }
};


const handleDelete = async (id) => {

    try {

        const res = await fetch(`/api/feedback/${id}`, {
            method: "DELETE"
        });

        if(!res.ok) {
            throw new Error("Unable to delete feedback");
        }

        const data = await res.json();

        renderFeedback(data.feedback);
        
    } catch (err) {
        statusSection.textContent = err.message;
    }
};

const handlePut = async (e, id) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(form));

    try {
        const res = await fetch(`/api/feedback/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })

        if(!res.ok){
            throw new Error("Unable to update feedback");
        }

        const data = await res.json();
        renderFeedback(data.feedback);

        editingId = null;
        form.reset();

    } catch(err) {
        statusSection.textContent = err.message;
    }
}


const renderFeedback = (arr) => {

    statusSection.textContent = "";

    feedbackList.replaceChildren();

    if(arr.length === 0) {
        statusSection.textContent = "No feedback yet.";
        return;
    }

        arr.forEach(({ id, name, email, rating, message }) => {
            const feedbackCard = document.createElement("div");
            feedbackCard.classList.add("feedback-card");

            const feedbackName = document.createElement("p");
            feedbackName.textContent = name;

            const feedbackEmail = document.createElement("p");
            feedbackEmail.textContent = email;

            const feedbackRating = document.createElement("p");
            feedbackRating.textContent = `Rating: ${rating}/5`;

            const feedbackMessage = document.createElement("p");
            feedbackMessage.textContent = message;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";

            deleteBtn.addEventListener("click", async () => {
               await handleDelete(id);
            });

            editBtn.addEventListener("click", () => {
                nameInput.value = name;
                emailInput.value = email; 
                messageInput.value = message;

                const radio = document.querySelector(`input[name="rating"][value="${rating}"]`);
                radio.checked = true;

                editingId = id;
            })

            feedbackCard.append(
                feedbackName,
                feedbackEmail,
                feedbackRating,
                feedbackMessage,
                deleteBtn,
                editBtn
            );

            feedbackList.append(feedbackCard);
        });

}

form.addEventListener("submit", (e) => {
    if(editingId === null){
        handlePost(e);
    } else {
        handlePut(e, editingId);
    }
});
handleGet();