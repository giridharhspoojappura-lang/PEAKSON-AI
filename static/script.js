function updateTime(){

    const now = new Date();

    document.getElementById("time").innerHTML =
        now.toLocaleTimeString();

    document.getElementById("date").innerHTML =
        now.toDateString();
}

setInterval(updateTime,1000);

updateTime();

const greetings = [
    "Welcome back Sir.",
    "Systems online.",
    "Awaiting your command.",
    "How may I assist you today?"
];

window.onload = function(){

    const chatbox = document.getElementById("chatbox");

    const now = new Date();

    let timeGreeting;

    if(now.getHours() < 12)
        timeGreeting = "Good Morning Sir.";
    else if(now.getHours() < 18)
        timeGreeting = "Good Afternoon Sir.";
    else
        timeGreeting = "Good Evening Sir.";

    const randomGreetings = [
        "All systems operational.",
        "Awaiting your command.",
        "Ready to assist you.",
        "Systems online and functioning normally.",
        "Welcome back Sir.",
        "PEAKSON is ready."
    ];

    const randomMessage =
        randomGreetings[Math.floor(Math.random() * randomGreetings.length)];

    chatbox.innerHTML += `
<div id="welcomeScreen" class="welcome-container">

    <div class="bot-label">
        PEAKSON AI
    </div>

    <div class="bot-msg welcome-msg">
        <strong>${timeGreeting}</strong><br><br>
        ${randomMessage}
    </div>

</div>
`;
};

document.getElementById("fileInput")
.addEventListener("change", function(){

    const file = this.files[0];

    if(file){
        document.getElementById("fileName").textContent =
            file.name;
    }
});

document.getElementById("sendBtn")
.addEventListener("click", function(){
    speechSynthesis.cancel();
    const msg = document.getElementById("message").value;

    if(msg.trim() === "") return;
    const welcome = document.getElementById("welcomeScreen");

if(welcome){
    welcome.remove();
}

    const chatbox = document.getElementById("chatbox");

    chatbox.innerHTML += `
    <div class="sender-label user-label">
        YOU
    </div>

    <div class="user-msg">
        ${msg}
    </div>
`;

fetch("/chat",{
    method:"POST",
    headers:{
        "Content-Type":"application/json"
    },
    body:JSON.stringify({
        message:msg
    })
})
.then(response => response.json())
.then(data => {

    chatbox.innerHTML += `
    <div class="sender-label bot-label">
        PEAKSON AI
    </div>

    <div class="bot-msg">
        ${data.response
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/\n/g, "<br>")}
    </div>
`;

    speak(data.response);

    chatbox.scrollTop = chatbox.scrollHeight;
});

    document.getElementById("message").value="";

    chatbox.scrollTop = chatbox.scrollHeight;
});

const recognition = new webkitSpeechRecognition();

recognition.lang = "en-US";

document.getElementById("micBtn")
.addEventListener("click", () => {

    recognition.start();

    document.getElementById("recordingIndicator")
        .className = "recording-active";

    document.getElementById("stopBtn")
        .style.display = "block";

});

document.getElementById("stopBtn")
.addEventListener("click", () => {

    recognition.stop();

    document.getElementById("recordingIndicator")
        .className = "recording-hidden";

    document.getElementById("stopBtn")
        .style.display = "none";

});

recognition.onend = () => {

    document.getElementById("recordingIndicator")
        .className = "recording-hidden";

    document.getElementById("stopBtn")
        .style.display = "none";

};

recognition.onresult = (event) => {

    console.log("Speech detected");

    const text = event.results[0][0].transcript;

    console.log(text);

    document.getElementById("message").value = text;
};
recognition.onerror = (event) => {
    console.log("Speech Error:", event.error);
};
function speak(text){

    speechSynthesis.cancel();

    const mode = document.getElementById("voiceMode").value;

    if(mode === "Mute")
        return;

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = speechSynthesis.getVoices();

    const selectedVoice = voices.find(v =>
        v.name.includes(mode)
    );

    if(selectedVoice){
        utterance.voice = selectedVoice;
    }

    speechSynthesis.speak(utterance);
}
document.getElementById("stopSpeechBtn")
.addEventListener("click", () => {

    speechSynthesis.cancel();

});
document.getElementById("message")
.addEventListener("keydown", function(event){

    if(event.key === "Enter" && !event.shiftKey){

        event.preventDefault();

        document.getElementById("sendBtn").click();
    }

});

document.getElementById("fileInput")
.addEventListener("change", async function(){

    const file = this.files[0];

    if(!file) return;

    document.getElementById("fileName").textContent =
        file.name;

    let formData = new FormData();

    formData.append("file", file);

    const response = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    const chatbox = document.getElementById("chatbox");

    chatbox.innerHTML += `
    <div class="sender-label bot-label">
        PEAKSON AI
    </div>

    <div class="bot-msg">
        ${data.response
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/\n/g, "<br>")}
    </div>
`;

    chatbox.scrollTop = chatbox.scrollHeight;
});