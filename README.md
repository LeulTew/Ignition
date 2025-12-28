# IGNITION(GOAL_BREAKER.EXE) 🚀

> **Tactical Objective Decomposition System**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-operational-green.svg)
![Stack](https://img.shields.io/badge/stack-Next.js_16_|_FastAPI_|_Gemini-black.svg)

**Stop dreaming. Start executing.**

**Deploy Site**: [https://ignition-ivory.vercel.app](https://ignition-ivory.vercel.app)

GOAL_BREAKER.EXE is a mission-control interface that strips away the fluff from your vague ideas and converts them into a precise, 5-step tactical execution plan. Powered by Google's Gemini AI, wrapped in a "Dark Technical" aesthetic, and engineered for operators who demand clarity.

---

## 📡 The Mission

You have a goal. It's vague. "Launch a startup." "Get fit." "Learn Amharic."
GOAL_BREAKER.EXE takes that signal, filters out the noise, and returns a **Tactical Breakdown**: five chronological, high-impact steps with a complexity score. It doesn't stop there—drill down into any step to generate specific subroutines.

## 📸 Visual Reconnaissance

### 🖥️ Desktop Command Center

> _Primary operating environment. Optimized for high-density information display._

![Main Interface](./docs/desktop_result.png)
_Figure 1: The active breakdown state showing a generated 5-step plan with complexity scoring._

<br/>

|               **Tactical Drill-Down**                |          **Historical Logs**           |
| :--------------------------------------------------: | :------------------------------------: |
| ![Subtasks](./docs/desktop_result_with_subtasks.png) | ![History](./docs/desktop_history.png) |
|           _Recursive sub-step generation._           |      _Persistent operation logs._      |

|            **Light Mode Variant**            |         **Initial State**          |
| :------------------------------------------: | :--------------------------------: |
| ![Light Mode](./docs/desktop_light_mode.png) | ![Empty State](./docs/desktop.png) |
|        _High-contrast daylight ops._         |      _Ready-state dot grid._       |

### 📱 Mobile Field Unit

> _Responsive interface for operators in the field._

|       **Cockpit View**       |              **History Drawer**              |
| :--------------------------: | :------------------------------------------: |
| ![Mobile](./docs/mobile.png) | ![Mobile History](./docs/mobile_history.png) |
| _Thumb-optimized controls._  |     _Slide-up access to past missions._      |

---

## ⚡ Operational Capabilities

### 🎯 Precision Breakdown

Input any objective. The system analyzes it and returns exactly **5 actionable steps**. No fluff. No "believe in yourself." Just execution.

- **Complexity Score**: Auto-calculated difficulty rating (1-10).
- **Tone**: "Dark Technical" (concise, professional, military-grade).

### 🔍 Deep Dive Subroutines

Click any step to activate the **Subroutine Drawer**. The system recursively breaks that single step into 3 specific tactical sub-actions.

- _Example_: Step: "Audit Market" -> Subroutines: "Analyze competitors," "Survey 100 users," "Map pricing models."

### 🛡️ Active Guardrails

We don't let garbage in. The `guardrails.py` module uses a dedicated Gemini Flash-Lite model to classify every input:

- **OK**: Proceeds to breakdown.
- **GIBBERISH**: Returns a "Signal Noise" protocol (e.g., "Clarify objective").
- **ABUSE**: Returns a "Hostile Input" protocol (e.g., "Terminate session").
  _Zero blank screens. Even errors are handled in-character._

### 🔊 Haptic Audio Layer

The interface feels alive.

- **Typing**: Mechanical key clicks.
- **Processing**: Low-frequency hum during AI generation.
- **Success**: Satisfying chime on completion.
- **Subroutine**: Distinct ping when drilling down.
  _(Toggleable via the Global Context pill on Desktop or Footer on Mobile)._

### 🌍 Bilingual Ops

Native support for **English** and **Amharic**.

- Switch languages instantly.
- The AI adapts the "Dark Technical" tone to Amharic (e.g., "የታክቲክ እቅድ" instead of just "Plan").

---

## 🧠 The Logic

How it works under the hood:

1.  **Ingestion**: User input hits the Next.js frontend and is relayed to the FastAPI backend.
2.  **Sanitization**: `guardrails.py` intercepts the payload.
3.  **Classification**: Gemini 2.0 Flash-Lite categorizes the intent.
4.  **Synthesis**:
    - If `OK`: `services.py` prompts Gemini 2.5 Flash for a structured JSON response.
    - If `Offline`: Deterministic fallback plans engage so the UI never breaks.
5.  **Rendering**: The frontend parses the JSON, animating the results into the dot-grid cockpit.

---

## 🛠️ Deployment Protocols

### Prerequisites

- Node.js 20+ & pnpm
- Python 3.10+
- Google Gemini API Key
- PostgreSQL Database (Neon/Local)

### 1. Clone & Initialize

```bash
git clone https://github.com/LeulTew/Ignition.git
cd Ignition
pnpm install
```

### 2. Backend Deployment (Render.com)

1. **Login** to [Render.com](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your **Ignition** repository.
4. Render will detect `render.yaml` and configure the service.
5. Provide your `GEMINI_API_KEY` and `DATABASE_URL` in the environment variables prompt.

### 3. Local Development

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
pnpm dev
```

---

## 🧪 Testing & QA

Ensure system integrity before deployment.

**Backend Verification**

```bash
cd backend
./venv/bin/python -m pytest
```

**Frontend Integrity**

```bash
cd frontend
pnpm lint
```

**Manual QA Matrix**
Consult [`docs/QA_CHECKLIST.md`](./docs/QA_CHECKLIST.md) for the full black-box testing procedure covering desktop, mobile, and edge cases.

---

## 🏗️ Tech Stack

| Layer          | Technology                                                          |
| :------------- | :------------------------------------------------------------------ |
| **Frontend**   | Next.js 16 (App Router), React 19, Tailwind CSS 4                   |
| **UI Library** | shadcn/ui, Radix Primitives, Lucide Icons                           |
| **Backend**    | FastAPI, Uvicorn, Pydantic                                          |
| **AI Core**    | Google Gemini 2.5 Flash (Logic), Gemini 2.0 Flash-Lite (Guardrails) |
| **Database**   | PostgreSQL, Prisma ORM                                              |
| **Audio**      | Web Audio API (Custom Synth)                                        |

---

## 📄 License

MIT License. Built for the builders.

[**View Release Plan**](./RELEASE_PLAN.md) | [**Report Bug**](https://github.com/LeulTew/Ignition/issues)
