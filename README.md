# Chatbot Project Overview

## Project Summary

This project implements a chatbot interface that allows users to interact with a bot. The bot processes user queries and responds with simulated typing animations to create a more natural and engaging conversation. Built with **React.js** for the frontend and styled with **TailwindCSS**, this chatbot integrates with a WebSocket server to send and receive messages in real-time. The bot responses are rendered with support for Markdown syntax, allowing rich text formatting like bold, italics, and links.

The backend is built with **Node.js**, leveraging **Socket.io** for real-time communication, **Multer** for file storage, and **PostgreSQL** for storing metadata.

![image](https://github.com/user-attachments/assets/91b1970a-33c2-480e-9808-a34fc7a7c90e)

![image](https://github.com/user-attachments/assets/06325229-0b75-4bb1-8c3f-55b9d2e867a6)

---

## Features

- **Interactive Chat Interface**: A real-time, responsive chat window where users can send messages and receive bot replies.
- **Typing Animation for Bot**: The bot simulates typing with a smooth animation before delivering its message, enhancing user interaction.
- **Rich Text Message Rendering**: User and bot messages can include rich text, such as bold, italic, or linked content, using **React Markdown**.
- **Real-Time Communication**: The chat operates in real-time, with the bot responding to user inputs as they occur.
- **Socket Integration**: WebSocket communication is utilized to ensure seamless interaction between the client and the server.
- **File Storage with Multer**: User files, such as documents, are stored locally using **Multer**.
- **Metadata Storage with PostgreSQL**: Metadata associated with the uploaded files, such as file names and timestamps, is stored in **PostgreSQL**.

---

## Technologies Used

### Frontend:
- **React.js**: The JavaScript library used to build the dynamic user interface and handle the state management.
- **TailwindCSS**: A utility-first CSS framework that simplifies styling and ensures responsiveness and flexibility in design.
- **React Markdown**: A library used to render Markdown content, allowing the bot to send formatted messages.
- **Socket.io**: A library for enabling real-time communication between the frontend and backend.

### Backend:
- **Node.js**: The JavaScript runtime used for building the server-side application.
- **Socket.io**: Enables real-time, bidirectional communication between the client and the server.
- **Multer**: Middleware for handling file uploads in **Node.js**, used for storing files on the server.
- **PostgreSQL**: A relational database management system used to store metadata related to uploaded files.
- **Local File Storage**: Files are stored locally on the server, with metadata being stored in the PostgreSQL database.

---

## Key Components

### Frontend: Chat Component

The **Chat** component serves as the heart of the application, handling the core logic for:
- **Displaying Messages**: It tracks and displays messages from both the user and the bot.
- **Typing Animation**: When the bot responds, its message appears letter by letter, mimicking a typing effect.
- **Sending User Messages**: It allows users to send messages, which are then emitted to the backend via WebSocket for processing.

### Backend: Real-Time Communication

The communication between the frontend and the backend is handled by **Socket.io**, which ensures that messages from the user are immediately sent to the server and that bot responses are delivered in real-time. This makes the conversation flow dynamic and uninterrupted.

### File Handling with Multer

Files uploaded by users, such as documents, are handled using **Multer**, which stores the files locally on the server. The metadata related to these files (e.g., filenames, upload times) is stored in **PostgreSQL** for easy access and management.

### Typing Animation

To create a natural interaction, the bot's responses are simulated to "type" out over a short period. This is done by updating the bot's message character by character, with a slight delay between each update, before displaying the complete response.

### Message Rendering with Markdown

Messages from both the user and the bot can include rich text formatting using **React Markdown**. This allows the bot to send messages with complex formatting, including bold text, lists, and hyperlinks, providing a more interactive and engaging experience for the user.

---

## Project Workflow

1. **User Input**: When the user sends a message, it is captured by the input field and displayed in the chat window.
2. **Message Emission**: The message is then sent to the backend via a WebSocket event.
3. **Bot Response**: The backend processes the message, and the bot generates a response.
4. **Typing Animation**: The bot’s message is displayed gradually with a typing animation before it appears fully.
5. **File Upload (if applicable)**: If the user uploads a file, it is processed by **Multer**, stored locally, and its metadata is saved in **PostgreSQL**.
6. **Rendering the Message**: The bot’s response is rendered on the screen with support for Markdown content.
7. **Continuous Interaction**: The user can continue sending messages, and the bot will respond in real-time, maintaining a fluid conversation.

---

## Running the Project

### Prerequisites

Before running the project, ensure the following are installed:
- **Node.js** and **npm** (or **yarn**)
- **PostgreSQL** for metadata storage
- **Multer** for file storage

### Steps to Run the Project:

1. Clone the repository and navigate to the project directory.
2. Install the required dependencies by running:
   ```bash
   npm install
   ```
3. Set up the **PostgreSQL** database and configure the connection to store metadata.
4. Start the server by running:
   ```bash
   npm start
   ```
5. Start the frontend by running:
   ```bash
   npm run start:frontend
   ```
6. Open the project in your browser at `http://localhost:3000` to begin interacting with the chatbot.

![Run the Project (Video)](path_to_video)  
*Video walkthrough of the project setup and running instructions*

---

## Potential Enhancements

- **User Authentication**: Integrating user authentication would allow users to have personalized experiences, such as saving chat history or preferences.
- **Advanced Query Parsing**: Enhancing the bot’s ability to handle more complex user queries and integrate with external APIs for dynamic data fetching.
- **Media and Emoji Support**: Allowing the bot and user to send images, GIFs, or emojis would further improve the interactivity of the conversation.
- **Smart Response System**: Implementing machine learning or natural language processing (NLP) models to provide more context-aware and meaningful responses from the bot.

---

## Conclusion

This chatbot project provides an engaging and interactive experience by combining modern web technologies like React, TailwindCSS, Socket.io, and Node.js. The use of typing animations and Markdown rendering enhances the realism of the conversation, while the backend's real-time response ensures smooth and continuous interactions. With Multer handling file uploads and PostgreSQL storing metadata, the project is designed to scale and support file interactions as well. This project is highly extensible, allowing for future improvements such as AI-powered responses or more advanced message handling.
