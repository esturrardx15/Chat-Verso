/* =====================================================================================
 * ARQUIVO: script.js
 * FUNÇÃO: Lógica do cliente para a aplicação de chat.
 * DESCRIÇÃO: Este script gerencia a conexão com o servidor Socket.IO,
 *            envia e recebe eventos de chat (mensagens, digitação, etc.),
 *            e manipula o DOM para exibir as informações na tela.
 * ===================================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Conecta ao servidor Socket.IO. O 'io()' busca o servidor que serviu a página.
    const socket = io();

    // Elementos do DOM
    const messagesContainer = document.getElementById('messages');
    const messageForm = document.getElementById('form'); // ID do formulário no index.html
    const messageInput = document.getElementById('input'); // ID do campo de texto no index.html
    const typingIndicator = document.getElementById('typing-indicator');
    const replyPreview = document.getElementById('reply-preview');
    const replyPreviewText = document.getElementById('reply-preview-text');
    const cancelReplyBtn = document.getElementById('cancel-reply');

    // Variáveis de estado
    let typingTimer;
    const TYPING_TIMER_LENGTH = 1500; // ms
    let currentReplyToId = null; // Armazena o ID da mensagem que está sendo respondida

    // Pega o nome de usuário da tag <strong> injetada no template pelo Flask
    const usernameElement = document.getElementById('username');

    // Adiciona o evento para o botão de cancelar resposta
    cancelReplyBtn.addEventListener('click', clearReplyContext);
    const username = usernameElement ? usernameElement.textContent : 'Anônimo';

    // Adiciona evento para fechar a resposta com a tecla 'Esc'
    document.addEventListener('keydown', (e) => {
        // Verifica se a tecla pressionada foi 'Escape'
        if (e.key === 'Escape') {
            clearReplyContext();
        }
    });

    // 1. Evento de Conexão: Junta-se ao chat
    socket.on('connect', () => {
        console.log('Conectado ao servidor com o id:', socket.id);
        if (username) {
            socket.emit('join', { username: username });
        }
    });

    // 2. Envio de Mensagem
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = messageInput.value.trim();

        if (messageText) {
            const messageData = {
                text: messageText,
                reply_to: currentReplyToId
            };
            socket.emit('message', messageData);
            messageInput.value = '';
            clearReplyContext(); // Limpa o contexto de resposta após o envio
            socket.emit('stop_typing'); // Garante que o "digitando" pare
        }
    });

    // 3. Recebimento de Mensagem
    socket.on('message', (data) => {
        addMessage(data);
        // Remove o indicador de "digitando" do usuário que enviou a mensagem
        clearTypingIndicator(data.username);
    });

    // 4. Recebimento de Atualização de Usuário (entrada/saída)
    socket.on('user_update', (data) => {
        const updateElement = document.createElement('li'); // Usar <li> para consistência
        updateElement.classList.add('system-message'); // Classe para mensagens do sistema
        updateElement.textContent = data.message;
        messagesContainer.appendChild(updateElement);
        scrollToBottom(); // Garante que a rolagem ocorra
    });

    // 5. Lógica de "Digitando..."
    messageInput.addEventListener('input', () => {
        clearTimeout(typingTimer);
        socket.emit('typing');
        typingTimer = setTimeout(() => {
            socket.emit('stop_typing');
        }, TYPING_TIMER_LENGTH);
    });

    const typingUsers = new Set();

    socket.on('user_typing', (data) => {
        typingUsers.add(data.username);
        updateTypingIndicator();
    });

    socket.on('user_stop_typing', (data) => {
        typingUsers.delete(data.username);
        updateTypingIndicator();
    });

    function updateTypingIndicator() {
        if (typingUsers.size === 0) {
            typingIndicator.textContent = '';
        } else {
            const users = Array.from(typingUsers);
            if (users.length === 1) {
                typingIndicator.textContent = `${users[0]} está digitando...`;
            } else {
                typingIndicator.textContent = `${users.join(', ')} estão digitando...`;
            }
        }
    }

    function clearTypingIndicator(username) {
        if (typingUsers.has(username)) {
            typingUsers.delete(username);
            updateTypingIndicator();
        }
    }

    // 6. Funções Auxiliares da Interface
    function addMessage(data) {
        const { id, text, username: msgUsername, color, sid, reply_context } = data;
        const isUser = sid === socket.id;
    
        const item = document.createElement('li');
        item.dataset.messageId = id; // Armazena o ID da mensagem no elemento
    
        // Adiciona classes para alinhar a mensagem (direita ou esquerda)
        if (isUser) {
            item.classList.add('user-message');
        } else {
            item.classList.add('other-message');
            item.style.backgroundColor = color; // Aplica a cor para outros usuários
        }
    
        let innerHTML = '';
    
        // Adiciona contexto de resposta, se houver
        if (data.reply_context) {
            innerHTML += `<div class="reply-context"><strong>${data.reply_context.username}</strong><br>${data.reply_context.text}</div>`;
        }
    
        // Adiciona o texto da mensagem principal
        const textSpan = document.createElement('span');
        textSpan.classList.add('message-text');
        // Adiciona o nome do usuário apenas se a mensagem for de outra pessoa
        textSpan.textContent = isUser ? text : `${msgUsername}: ${text}`;
        
        // Cria um container para o texto para que o contexto da resposta fique acima dele
        const messageContentWrapper = document.createElement('div');
        messageContentWrapper.style.flexGrow = '1'; // Faz o texto ocupar o espaço disponível
        messageContentWrapper.innerHTML = innerHTML; // Adiciona o contexto da resposta
        messageContentWrapper.appendChild(textSpan); // Adiciona o texto da mensagem DENTRO do wrapper
    
        item.appendChild(messageContentWrapper); // Adiciona o wrapper completo ao item da lista
        // Adiciona evento ao botão de responder
        const replyButton = document.createElement('button');
        replyButton.classList.add('reply-button');
        replyButton.innerHTML = '&#x21A9;'; // Seta de resposta
        replyButton.onclick = () => setReplyContext(item); // Passa o elemento da mensagem inteiro
        item.appendChild(replyButton);

        // Adiciona o evento de clique duplo para responder
        item.addEventListener('dblclick', () => setReplyContext(item)); // Passa o elemento da mensagem inteiro

        // --- Lógica de arrastar para responder (Mobile) ---
        let touchStartX = 0;
        const swipeThreshold = 80; // Distância em pixels para ativar a resposta

        item.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            // Remove a transição durante o arrasto para um movimento suave
            item.style.transition = 'none';
        }, { passive: true });

        item.addEventListener('touchmove', (e) => {
            let currentX = e.changedTouches[0].screenX;
            let diffX = currentX - touchStartX;

            // Permite arrastar apenas da esquerda para a direita e dá o feedback visual
            if (diffX > 0) {
                const dragDistance = Math.min(diffX, 100); // Limita o arrasto a 100px
                item.style.transform = `translateX(${dragDistance}px)`;
            }
        }, { passive: true });

        item.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            // Adiciona a transição de volta para a animação de retorno
            item.style.transition = 'transform 0.3s ease-out';
            item.style.transform = 'translateX(0)'; // Faz a mensagem voltar à posição original

            // Se o deslize foi suficiente, ativa a resposta
            if (touchEndX > touchStartX + swipeThreshold) {
                setReplyContext(item); // Passa o elemento da mensagem inteiro
            }
        });
    
        // Adiciona a mensagem completa ao container
        messagesContainer.appendChild(item);
        scrollToBottom();
    }

    function setReplyContext(messageItem) {
        // Extrai as informações diretamente do elemento HTML da mensagem
        const messageId = messageItem.dataset.messageId;
        const messageTextElement = messageItem.querySelector('.message-text');
        if (!messageTextElement) return; // Segurança: não faz nada se o texto não for encontrado

        const fullText = messageTextElement.textContent;
        // Extrai o nome de usuário e o texto da mensagem
        const [targetUsername, ...messageParts] = fullText.split(': ');
        const messageText = messageParts.join(': ');
        
        currentReplyToId = messageId;
        // Mostra a pré-visualização da resposta
        replyPreviewText.innerHTML = `Respondendo a <strong>${targetUsername}</strong>: <span class="preview-message-text">${messageText}</span>`;
        replyPreview.style.display = 'block';
        messageInput.placeholder = `Respondendo a ${targetUsername}...`; // Atualiza o placeholder
        messageInput.focus();
    }

    function clearReplyContext() {
        currentReplyToId = null;
        replyPreview.style.display = 'none'; // Esconde a pré-visualização
        messageInput.placeholder = 'Digite sua mensagem...';
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});