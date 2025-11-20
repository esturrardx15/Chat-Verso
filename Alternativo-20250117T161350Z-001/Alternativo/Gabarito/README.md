# Chat Verso - Aplicação de Chat em Tempo Real



**Chat Verso** é uma aplicação de chat web completa e funcional, construída com Python no backend e JavaScript puro no frontend. Ela demonstra a comunicação em tempo real usando WebSockets, gerenciamento de usuários, e funcionalidades modernas de UI/UX como indicador de digitação e resposta a mensagens.

## ✨ Funcionalidades Principais

- **Chat em Tempo Real**: Mensagens são enviadas e recebidas instantaneamente sem a necessidade de recarregar a página, graças ao Flask-SocketIO.
- **Múltiplos Usuários**: Vários usuários podem entrar no chat com nomes de usuário únicos.
- **Identificação por Cores**: Cada usuário recebe uma cor aleatória e única para seus balões de mensagem, facilitando a identificação visual.
- **Mensagens do Sistema**: Notificações automáticas aparecem quando um usuário entra ou sai do chat.
- **Indicador de "Digitando..."**: Mostra em tempo real quando outro usuário está escrevendo uma mensagem.
- **Responder a Mensagens**: Uma funcionalidade completa que permite responder a uma mensagem específica através de três métodos:
  - **Desktop**: Clique duplo na mensagem ou clique no botão de resposta que aparece ao passar o mouse.
  - **Mobile**: Deslize a mensagem da esquerda para a direita.
- **Animação de Resposta (Mobile)**: Ao deslizar para responder, a mensagem acompanha o movimento do dedo, fornecendo um feedback visual intuitivo.
- **Acessível em Rede Local**: O servidor é configurado para ser acessível por qualquer dispositivo (como celulares e outros computadores) na mesma rede Wi-Fi.
- **Design Responsivo**: A interface se adapta a telas de diferentes tamanhos, proporcionando uma boa experiência tanto em desktops quanto em dispositivos móveis.

---

## 🚀 Tecnologias Utilizadas

- **Backend**:
  - **Python 3**: Linguagem de programação principal.
  - **Flask**: Micro-framework web para criar as rotas e a estrutura do servidor.
  - **Flask-SocketIO**: Extensão do Flask que habilita a comunicação bidirecional baseada em eventos (WebSockets) entre o cliente e o servidor.

- **Frontend**:
  - **HTML5**: Estrutura da página web.
  - **CSS3**: Estilização da interface, incluindo o layout flexbox e animações.
  - **JavaScript (Vanilla)**: Lógica do lado do cliente para interagir com o servidor Socket.IO, manipular o DOM e gerenciar eventos de UI.

---

## 📂 Estrutura do Projeto

```
Gabarito/
├── app.py             # O coração do backend: servidor Flask e lógica do SocketIO.
├── index.html         # A página principal do chat, com toda a estrutura, CSS e JavaScript.
├── login.html         # A página de login para o usuário inserir seu nome.
└── README.md          # Este arquivo.
```

### `app.py`

Este é o servidor backend. Suas principais responsabilidades são:
- Iniciar um servidor web com Flask.
- Gerenciar conexões de clientes via SocketIO.
- Manter um registro dos **usuários conectados**, associando o ID da sessão (`sid`) a um nome de usuário e uma cor.
- Manter um **histórico de mensagens** para buscar o contexto quando uma mensagem é respondida.
- Processar eventos como `connect`, `disconnect`, `join`, `message` e `typing`.
- Transmitir (`broadcast`) mensagens e eventos para todos os clientes conectados.

### `index.html`

Este arquivo é a interface do chat. Ele contém três partes principais:
1.  **HTML**: A estrutura da janela de chat, a lista de mensagens e o formulário de envio.
2.  **CSS**: Todo o código de estilo para os balões de mensagem, cores, layout responsivo e animações.
3.  **JavaScript**: A lógica do lado do cliente. Ele se conecta ao servidor Socket.IO, envia eventos (como novas mensagens) e escuta por eventos vindos do servidor para atualizar a interface (adicionar novas mensagens, mostrar o indicador de "digitando...", etc.).

### `login.html`

Uma página simples com um formulário que pede um nome de usuário. Ao submeter, o usuário é redirecionado para a página de chat (`/chat`) com seu nome.

---

## ⚙️ Como Executar o Projeto

### 1. Pré-requisitos

Certifique-se de ter o **Python 3** instalado. Você precisará instalar as bibliotecas Flask e Flask-SocketIO.

```bash
# Instale as dependências necessárias
pip install Flask Flask-SocketIO
```

### 2. Iniciando o Servidor

Navegue até a pasta do projeto no seu terminal e execute o arquivo `app.py`.

```bash
python app.py
```

Você verá uma mensagem indicando que o servidor está rodando, geralmente em `http://0.0.0.0:5000`.

### 3. Acessando o Chat

#### No mesmo computador:

Abra seu navegador e acesse `http://localhost:5000` ou `http://127.0.0.1:5000`.

#### Em outro dispositivo (Celular, Tablet, etc.):

1.  **Conecte na mesma rede**: Certifique-se de que o dispositivo e o computador que está rodando o servidor estejam conectados na **mesma rede Wi-Fi**.
2.  **Descubra o IP local do computador**:
    - **Windows**: Abra o Prompt de Comando (CMD) e digite `ipconfig`. Procure pelo "Endereço IPv4".
    - **macOS/Linux**: Abra o Terminal e digite `ifconfig` ou `ip addr`. Procure pelo endereço `inet`.
3.  **Acesse no navegador do dispositivo**: Abra o navegador no seu celular ou tablet e digite o endereço IP encontrado, seguido da porta `:5000`.
    - Exemplo: `http://192.168.1.5:5000`

> **⚠️ Problemas de Conexão?**
> Se você não conseguir se conectar a partir de outro dispositivo, o problema é quase sempre o **Firewall** do seu computador (Windows Defender ou de um antivírus). Ele pode estar bloqueando conexões na porta `5000`. Você precisa criar uma **regra de entrada** para permitir conexões TCP na porta 5000.

<footer class="app-footer">
    <p>© 2025 DuduTri. Todos os direitos reservados.</p>
    <p>Contato: <a href="mailto:est.teodoro@gmail.com">est.teodoro@gmail.com</a></p>
</footer>