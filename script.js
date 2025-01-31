document.addEventListener("DOMContentLoaded", function () {
    const authContainer = document.getElementById("auth-container");
    const mainContent = document.getElementById("main-content");
    const authTitle = document.getElementById("auth-title");
    const authEmail = document.getElementById("auth-email");
    const authPassword = document.getElementById("auth-password");
    const authButton = document.getElementById("auth-button");
    const toggleAuth = document.getElementById("toggle-auth");
    const logoutBtn = document.getElementById("logout-btn");

    let isLogin = true;

    // Toggle between login/signup
    toggleAuth.addEventListener("click", () => {
        isLogin = !isLogin;
        authTitle.textContent = !isLogin ? "Login" : "Sign Up";
        authButton.textContent = !isLogin ? "Login" : "Sign Up";
        toggleAuth.innerHTML = !isLogin ? "Don't have an account? <span>Sign Up</span>" : "Already have an account? <span>Login</span>";
    });

    // Handle authentication
    authButton.addEventListener("click", () => {
        if (authEmail.value && authPassword.value) {
            localStorage.setItem("user", authEmail.value); // Store user session
            authContainer.style.display = "none";
            mainContent.style.display = "block";
        } else {
            alert("Please enter valid credentials.");
        }
    });

    // Logout functionality
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        mainContent.style.display = "none";
        authContainer.style.display = "flex";
    });

    // Check if user is already logged in
    if (localStorage.getItem("user")) {
        authContainer.style.display = "none";
        mainContent.style.display = "block";
    }
});


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD4IT9myMiTJGs6-GK87DGv8rEoGPEodpc",
    authDomain: "ai-powered-resume-writer-9fc21.firebaseapp.com",
    projectId: "ai-powered-resume-writer-9fc21",
    storageBucket: "ai-powered-resume-writer-9fc21.firebasestorage.app",
    messagingSenderId: "972623710882",
    appId: "1:972623710882:web:317f6617a46b7ca15825fb",
    measurementId: "G-XQ12Q3DQ0J"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Elements
const authContainer = document.getElementById("auth-container");
const mainContent = document.getElementById("main-content");
const authTitle = document.getElementById("auth-title");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authButton = document.getElementById("auth-button");
const toggleAuth = document.getElementById("toggle-auth");
const logoutBtn = document.getElementById("logout-btn");
const resumeForm = document.getElementById("resume-form");
const resumePreview = document.getElementById("resume-preview");
const downloadBtn = document.getElementById("download-btn");

let isLogin = true;

// Toggle between Login & Sign Up
toggleAuth.addEventListener("click", () => {
    isLogin = !isLogin;
    authTitle.textContent = isLogin ? "Login" : "Sign Up";
    authButton.textContent = isLogin ? "Login" : "Sign Up";
    toggleAuth.innerHTML = isLogin ? "Don't have an account? <span>Sign Up</span>" : "Already have an account? <span>Login</span>";
});

// Handle Authentication (Signup/Login)
authButton.addEventListener("click", () => {
    const email = authEmail.value;
    const password = authPassword.value;

    if (email && password) {
        if (isLogin) {
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    authContainer.style.display = "none";
                    mainContent.style.display = "block";
                })
                .catch(error => alert(error.message));
        } else {
            auth.createUserWithEmailAndPassword(email, password)
                .then(() => alert("Account created successfully! Please log in."))
                .catch(error => alert(error.message));
        }
    } else {
        alert("Please enter email and password.");
    }
});

// Logout
logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
        mainContent.style.display = "none";
        authContainer.style.display = "flex";
    });
});

// Handle Resume Form Submission
resumeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("resume-email").value;
    const experience = document.getElementById("experience").value;

    const openaiApiKey = "YOUR_OPENAI_API_KEY"; // Replace with your OpenAI API Key

    const prompt = `Generate a professional resume for:
    Name: ${name}
    Email: ${email}
    Experience: ${experience}`;

    try {
        const response = await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                prompt: prompt,
                max_tokens: 300
            })
        });

        const data = await response.json();
        const aiResume = data.choices[0].text.trim();

        // Display AI-Generated Resume
        resumePreview.innerHTML = `
            <h3>${name}</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Experience:</strong> ${experience}</p>
            <hr>
            <p>${aiResume}</p>
        `;

        // Save to Firestore
        const user = auth.currentUser;
        if (user) {
            await db.collection("resumes").doc(user.uid).set({
                name: name,
                email: email,
                experience: experience,
                aiResume: aiResume
            });
            alert("Resume saved successfully!");
        }
    } catch (error) {
        console.error("Error generating resume:", error);
        alert("AI generation failed. Please try again.");
    }
});

// Download Resume as PDF
downloadBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name = document.getElementById("name").value || "No Name";
    const email = document.getElementById("resume-email").value || "No Email";
    const experience = document.getElementById("experience").value || "No Experience";
    const aiResume = resumePreview.innerText || "Generated resume will appear here.";

    doc.setFont("helvetica", "bold");
    doc.text("Resume", 105, 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${name}`, 20, 40);
    doc.text(`Email: ${email}`, 20, 50);
    doc.text(`Experience:`, 20, 60);
    doc.text(experience, 20, 70, { maxWidth: 170 });

    doc.text(`AI Generated Resume:`, 20, 90);
    doc.text(aiResume, 20, 100, { maxWidth: 170 });

    doc.save("Resume.pdf");
});
