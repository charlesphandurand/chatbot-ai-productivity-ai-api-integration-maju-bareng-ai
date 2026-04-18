const ChatUI = {
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    
    init() {
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
        
        this.chatInput.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const imageData = event.target.result;
                            this.handleSend(imageData);
                        };
                        reader.readAsDataURL(file);
                    }
                    break;
                }
            }
        });
        
        const chatArea = document.getElementById('chatMessages');
        chatArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            chatArea.style.background = 'rgba(139, 92, 246, 0.1)';
        });
        chatArea.addEventListener('dragleave', () => {
            chatArea.style.background = '';
        });
        chatArea.addEventListener('drop', (e) => {
            e.preventDefault();
            chatArea.style.background = '';
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageData = event.target.result;
                    this.handleSend(imageData);
                };
                reader.readAsDataURL(file);
            }
        });
    },
    
    handleSend(imageData = null) {
        const message = this.chatInput.value.trim();
        if (!message && !imageData) return;
        
        this.addUserMessage(message, imageData);
        this.chatInput.value = '';
        
        if (window.AIEngine) {
            window.AIEngine.processMessage(message, imageData);
        }
    },
    
    addUserMessage(text, imageData = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'user-message';
        
        let content = '';
        if (imageData) {
            content += `<img src="${imageData}" class="chat-image" alt="User uploaded image" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin-bottom: 8px;" />`;
        }
        if (text) {
            content += `<div class="message-content">${this.escapeHtml(text)}</div>`;
        }
        
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    },
    
    addBotMessage(html, isHtml = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'bot-message';
        
        const content = isHtml ? html : this.escapeHtml(html);
        
        messageDiv.innerHTML = `
            <div class="bot-avatar">🤖</div>
            <div class="message-content">
                ${content}
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    },
    
    addLoadingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'bot-message';
        messageDiv.id = 'loadingMessage';
        messageDiv.innerHTML = `
            <div class="bot-avatar">🤖</div>
            <div class="message-content loading">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    },
    
    removeLoadingMessage() {
        const loadingMsg = document.getElementById('loadingMessage');
        if (loadingMsg) loadingMsg.remove();
    },
    
    addDisclaimer() {
        const disclaimerDiv = document.createElement('div');
        disclaimerDiv.className = 'disclaimer-inline';
        disclaimerDiv.innerHTML = `
            <p>⚠️ <strong>Disclaimer:</strong> Informasi ini hanya untuk edukasi, bukan nasihat keuangan. Selalu DYOR.</p>
        `;
        this.chatMessages.appendChild(disclaimerDiv);
        this.scrollToBottom();
    },
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatPriceChange(change) {
        const isPositive = change >= 0;
        const className = isPositive ? 'positive-text' : 'negative-text';
        const sign = isPositive ? '📈' : '📉';
        return `<span class="${className}">${sign} ${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span>`;
    },
    
    highlightPrice(price) {
        return `<span class="data-highlight">${price}</span>`;
    }
};

window.ChatUI = ChatUI;
