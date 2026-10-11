# ⚡ ModelRouter
### Cost-, Latency- & Quality-Aware AI Inference Gateway

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)
![Ollama](https://img.shields.io/badge/Ollama-Local%20LLMs-black)
![NVIDIA](https://img.shields.io/badge/NVIDIA-RTX%205060-76B900?logo=nvidia&logoColor=white)

**🏆 VORTEXA 3.0 | Domain 2 — AI Systems & Infrastructure | A-01**

**Team Invaders 4.0**

> **The right model, for the right request, under the right constraints.**

ModelRouter is an intelligent AI inference gateway that selects the most suitable LLM based on **latency, cost, capability, context length, and availability**, with explainable routing decisions and constraint-preserving failover.

---

## 🎯 Problem Statement & Solution

| Challenge | Our Solution |
|---|---|
| Different tasks require different LLM capabilities | Complexity-aware model selection |
| Fixed model selection wastes resources | Constraint-first dynamic routing |
| Latency, cost and context limits must be respected | Strict hard-constraint filtering |
| Model endpoints can fail or time out | Constraint-preserving failover |
| Routing decisions are difficult to understand | Explainable decision receipts |
| Model performance and availability change | Judge-controlled live model registry |

**Core Principle:** Hard constraints determine eligibility. Routing preferences determine the winner.

---

## 🧠 Our AI Model Portfolio

Five locally hosted LLMs powered by **Ollama**.

| Model | Parameters | Specialization | Input |
|---|---:|---|---|
| **Qwen3.5 2B** | 2B | Fast, lightweight tasks | Text + Image |
| **Qwen3.5 4B** | 4B | General-purpose inference | Text + Image |
| **DeepSeek-R1 7B** | 7B | Mathematical and logical reasoning | Text |
| **GPT-OSS 20B** | 20B | Advanced reasoning and coding | Text |
| **Gemma 4 12B** | 12B | Visual and multimodal understanding | Text + Image |

*Task specializations are intended roles; actual capability and latency depend on benchmarking and hardware.*

---

## ⚙️ Key Features

| Feature | Description |
|---|---|
| 🛡️ **Hard-Constraint Routing** | Filters models by latency, cost, capability, context and modality |
| 🎚️ **Intent Dial (0–100)** | Economy-to-Premium defaults; explicit constraints take priority |
| 🧠 **Complexity Estimation** | Analyzes task difficulty and uncertainty |
| 📋 **Decision Receipts** | Explains selection, rejection reasons and constraint margins |
| 🔄 **Intelligent Failover** | Rechecks original constraints and remaining deadline before retrying |
| 🎛️ **Judge Console** | Modify model latency and availability to test adaptive routing |
| 📊 **Honest Telemetry** | Separates estimated latency, measured latency and simulation |
| 🚫 **No Valid Model** | Returns `NO_VALID_MODEL` when no eligible candidate exists |

### 🚀 Proposed Differentiators

- **What-If Replay:** Re-evaluate previous requests under alternative routing constraints.
- **Chaos Panel:** Simulate model outages and latency changes to test reliability.
- **Slack-Based Explainability:** Show how far each model passes or fails a constraint.
- **Multimodal Routing:** Route images to compatible models; OCR/document processing is an extension.

*Advanced features should be marked as implemented only after end-to-end verification.*

---

## 🏗️ System Architecture

```text
             USER / JUDGE
                   |
            React Frontend
                   |
           FastAPI Backend
                   |
         Complexity Estimator
                   |
          Shared Model Registry <--- Judge Controls
                   |
          Hard Constraint Filter
                   |
         Preference-Based Ranker
                   |
          Inference + Failover
                   |
        Authenticated HTTPS Tunnel
                   |
         Local FastAPI Gateway
                   |
                Ollama
                   |
           Five Local LLMs
                   |
       Response + Decision Receipt
                   |
          Logs & Performance
```

**Two connected pipelines:**

- **Control Plane:** Judge edits → Validated API → Shared model registry
- **Runtime Plane:** Request → Analyze → Filter → Rank → Execute → Explain

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, JavaScript |
| Routing Backend | Python, FastAPI |
| Local LLM Runtime | Ollama |
| Inference Gateway | FastAPI |
| Remote Connectivity | ngrok |
| Model Registry | JSON configuration |
| Monitoring | Structured logs and statistics |
| Hardware | HP OMEN, NVIDIA RTX 5060 |
| Optional Deployment | Vercel + Render |

Local inference avoids third-party hosted LLM API charges. Virtual prices, if configured, are for cost-aware routing demonstrations.

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Ollama (required for live local inference)

### 1. Start the Routing Backend

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

Backend API docs: `http://localhost:8000/docs`

### 3. Configure Live Inference

Run Ollama and the separate local inference gateway. Configure the routing backend with:

```env
LOCAL_LLM_GATEWAY_URL=https://your-ngrok-domain
LOCAL_LLM_GATEWAY_TOKEN=your_private_token
```

Keep the token in backend environment variables, never in frontend code or GitHub.

The local inference gateway and routing backend are separate services. If both run on the same machine, configure different ports.

---

## 📡 Main Backend API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend health |
| `GET` | `/api/models` | Model registry |
| `GET` | `/api/models/{id}` | Model details |
| `PATCH` | `/api/models/{id}` | Judge-controlled configuration |
| `POST` | `/api/models/reset` | Restore defaults |
| `POST` | `/api/route` | Evaluate routing without inference |
| `POST` | `/api/infer` | Route and execute inference |
| `GET` | `/api/logs` | Decision and execution history |
| `GET` | `/api/stats` | Aggregate metrics |

### Local Inference Gateway

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Ollama and gateway health |
| `GET` | `/models` | Available models |
| `POST` | `/generate` | Text generation |
| `POST` | `/chat` | Conversational / supported vision inference |

---

## 🧪 Judge Demonstration Scenarios

| Test | Expected Behavior |
|---|---|
| ⚡ Simple prompt | Select fastest eligible model |
| 🧠 Complex reasoning | Enforce higher capability requirement |
| 🎛️ Increase model latency | Recalculate eligibility and selection |
| 💥 Disable selected model | Choose another eligible model |
| ⏳ Simulate timeout | Attempt valid fallback within remaining budget |
| 🚫 Impossible constraints | Return `NO_VALID_MODEL` |
| 📋 Inspect decision receipt | Show candidate evaluations and rejection reasons |

Configured latency estimates are not guaranteed response times. Real execution duration is measured separately.

---

## 🌟 Project Impact

- **Efficiency:** Avoid unnecessary execution on large models.
- **Quality:** Match task requirements to model capability.
- **Reliability:** Preserve constraints during failures.
- **Transparency:** Explain every routing decision.
- **Flexibility:** Adapt to model availability and configuration changes.
- **Privacy:** Run inference locally without sending prompts to hosted LLM providers.

---

## 👥 Team Invaders 4.0

**VORTEXA 3.0 — 12-Hour Hackathon**

**Problem Statement:** A-01 — ModelRouter  
**Domain:** AI Systems & Infrastructure

**Repository:** https://github.com/sushantzanwar/Invaders-4.0

---

### ⚡ ModelRouter
**Smarter routing. Explainable decisions. Reliable inference.**
