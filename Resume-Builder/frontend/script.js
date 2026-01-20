document.addEventListener('DOMContentLoaded', function () {

    // --- DYNAMIC FIELDS ---
    document.getElementById('add-skill').addEventListener('click', () => {
        const list = document.getElementById('skills-list');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'e.g., JavaScript';
        input.className = 'w-full p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 skill-item';
        list.appendChild(input);
    });

    document.getElementById('add-portfolio').addEventListener('click', () => {
        const list = document.getElementById('portfolio-list');
        const div = document.createElement('div');
        div.className = 'portfolio-item flex gap-2';
        div.innerHTML = `
            <input type="text" placeholder="Link Name" class="w-1/2 p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 portfolio-name">
            <input type="url" placeholder="URL" class="w-1/2 p-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 portfolio-link">
        `;
        list.appendChild(div);
    });

    // --- FORM SUBMISSION & PREVIEW ---
    const form = document.getElementById('resume-form');
    const preview = document.getElementById('preview');
    const downloadBtn = document.getElementById('download-pdf');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const title = document.getElementById('title').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const profile = document.getElementById('profile').value;

        // Skills
        const skillElements = document.querySelectorAll('.skill-item');
        const skills = Array.from(skillElements).map(s => s.value).filter(s => s);

        // Portfolio
        const portfolioNames = document.querySelectorAll('.portfolio-name');
        const portfolioLinks = document.querySelectorAll('.portfolio-link');
        const portfolio = [];
        for(let i=0;i<portfolioNames.length;i++){
            if(portfolioNames[i].value && portfolioLinks[i].value){
                portfolio.push({name: portfolioNames[i].value, link: portfolioLinks[i].value});
            }
        }

        // --- Generate Preview HTML ---
        let html = `
            <h1>${name}</h1>
            <h3>${title}</h3>
            <p>Email: <a href="mailto:${email}">${email}</a> | Phone: ${phone} | Location: ${address}</p>
            <hr class="my-2">

            <div class="section-title">Profile</div>
            <p>${profile}</p>
        `;

        if(skills.length){
            html += `<div class="section-title">Skills</div>
                     <div class="skills-grid">`;
            skills.forEach(s => { html += `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">${s}</span>`; });
            html += `</div>`;
        }

        if(portfolio.length){
            html += `<div class="section-title">Portfolio</div><ul>`;
            portfolio.forEach(p => { html += `<li><a href="${p.link}" target="_blank">${p.name}</a></li>`; });
            html += `</ul>`;
        }

        preview.innerHTML = html;
        downloadBtn.style.display = "block";
    });

    // --- PDF DOWNLOAD ---
    downloadBtn.addEventListener('click', () => {
        const resumeContent = document.getElementById('preview');
        const nameInput = document.getElementById('name').value.trim() || 'Resume';
        const filename = `${nameInput.replace(/\s+/g,'-')}.pdf`;

        const opt = {
            margin: 0.5,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, backgroundColor: '#fff' },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().from(resumeContent.cloneNode(true)).set(opt).save();
    });

    // --- AI IMPROVE SUMMARY ---
    document.getElementById("ai-improve").addEventListener("click", async () => {
        const profileField = document.getElementById("profile");
        const originalText = profileField.value.trim();
        if (!originalText) return alert("Please enter your summary first!");
        profileField.value = "⏳ Improving your summary with AI...";
        try {
            const res = await fetch("http://localhost:3000/api/generate-summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: originalText }),
            });
            const data = await res.json();
            profileField.value = data.aiText || "⚠️ No AI response. Try again.";
        } catch (err) {
            console.error(err);
            profileField.value = "❌ Error connecting to AI server.";
        }
    });

    // --- AI Chatbot ---
    const aiInput = document.getElementById('ai-input');
    const aiSend = document.getElementById('ai-send');
    const aiMessages = document.getElementById('ai-messages');

    aiSend.addEventListener('click', async () => {
        const question = aiInput.value.trim();
        if (!question) return;

        const userMsg = document.createElement('p');
        userMsg.className = 'text-right text-blue-400';
        userMsg.textContent = `You: ${question}`;
        aiMessages.appendChild(userMsg);
        aiMessages.scrollTop = aiMessages.scrollHeight;
        aiInput.value = '';

        try {
            const response = await fetch('http://localhost:3000/api/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: question })
            });
            const data = await response.json();
            const aiMsg = document.createElement('p');
            aiMsg.className = 'text-left text-white';
            aiMsg.textContent = `AI: ${data.summary || "Sorry, no response."}`;
            aiMessages.appendChild(aiMsg);
            aiMessages.scrollTop = aiMessages.scrollHeight;
        } catch (err) {
            const aiMsg = document.createElement('p');
            aiMsg.className = 'text-left text-red-500';
            aiMsg.textContent = "AI: Failed to get response.";
            aiMessages.appendChild(aiMsg);
        }
    });

});
