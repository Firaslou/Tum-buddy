# TUM Buddy

**TUM Buddy** is an AI-powered academic assistant for TUM students.  
It brings together multiple student-focused agents in one interface to help with:

- discovering relevant events and hackathons
- getting course and subject guidance
- checking transport disruptions around Munich
- finding student jobs and HiWi opportunities
- analyzing a CV to improve career matching

The app combines a lightweight frontend with a Node.js backend, Dify-powered AI routes, and a Python-based CV extraction tool.

---

## 🚀 Live Demo

👉 https://tum-buddy-393109800536.europe-west1.run.app/

---

## 🧠 What TUM Buddy does

TUM Buddy is built as a **multi-agent student companion** rather than a single chatbot.

### 1. Event Scout
Finds upcoming events based on interests, city, time range, and context.

- Uses Dify AI backend
- Supports chat & workflow modes
- Maintains conversational context

---

### 2. Subject Guide
Provides tailored academic guidance for specific subjects.

Useful for:
- study strategies
- exam preparation
- course direction

---

### 3. Transport Detector
Delivers AI-generated transport insights for Munich.

- Monitors disruptions
- Auto-refreshes data
- Uses dedicated AI agent

---

### 4. Career Scout
Matches students with relevant opportunities.

Sources include:
- TUM HiWi listings
- TUM chair job pages
- external student job platforms

Includes ranking logic based on:
- skills
- interests
- preferences

---

### 5. CV Analyzer
Extracts structured data from uploaded CVs.

Detects:
- degree & field
- technical skills
- interests
- languages
- job preferences

---

## 🤖 AI Features

### Dify-powered assistants
- Event Scout
- Transport Detector
- Subject Guide  

Each supports:
- `chat` mode  
- `workflow` mode  

---

### Prompt-based orchestration
Structured prompts are built from:
- interests
- location
- notes
- degree
- subject

---

### Streaming support
Handles streamed AI responses and combines them for UI rendering.

---

### Multi-agent design
Instead of one chatbot, TUM Buddy uses specialized agents:
- events
- academics
- transport
- careers

---

### CV intelligence pipeline
1. Upload CV  
2. Extract text  
3. Detect sections  
4. Infer profile  
5. Return structured data  

---

## 🏗️ Architecture

### Frontend
- Static web app (HTML, CSS, JS)
- Dashboard interface
- Form-based interaction
- Dynamic result rendering

---

### Backend
Node.js server that:
- serves frontend
- handles API routes
- integrates Dify AI
- protects API keys
- processes CVs
- ranks job opportunities

---

### Python CV Extraction
Uses:

```txt
pypdf
