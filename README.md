# Mariner


RTT-based User Device & State Identification

---

## Idea
#### [Research Paper](https://arxiv.org/abs/2411.11194)

This project is inspired by recent academic research that shows **Round Trip Time (RTT) patterns** can be used to infer user-side properties without accessing device internals.

Primary reference:
- *“Inferring Mobile Device States from Network RTT Measurements”* (arXiv:2411.11194)

The paper demonstrates that subtle variations in RTT distributions correlate with:
- Device type (mobile vs desktop / WhatsApp Web)
- Mobile operating system
- App and device state (locked, unlocked, foreground app)

This project attempts to **replicate and simplify** those findings in a practical, application-level setup.

---
## Showcase:
1. Fill the form with target's whatsapp no in international format.
   ![Message](https://github.com/MyTricks-code/Mariner/blob/main/demo/messages.png)
   - `Silent payload` : This would not alert the target by sending messages without producing user-facing notifications or visible prompts.
   - `Count` : Number of messages to send. It is limmted to 10 to prevent unethical use.

2. After sending messages A RTT vs Count graph is plotted
	![Message](https://github.com/MyTricks-code/Mariner/blob/main/demo/rttsGraph.png)

3. The probality is callucated based on RTTs bands of differnt devices and there states
   ![Message](https://github.com/MyTricks-code/Mariner/blob/main/demo/probablity.png)
---

## Purpose

The goal of this project is to:

- Identify whether a user is on **mobile or web**
- Infer **mobile OS** (Android / iOS)
- Estimate **device state**:
  - Locked
  - Unlocked
  - WhatsApp in foreground

All of this is done using **only RTT samples**, without:
- Device permissions
- OS-level access
- Invasive fingerprinting

This can be useful for:
- Security research
- Network behavior analysis
- Academic replication
- Anti-abuse & anomaly detection (research-only)

---

## Setup

### Architecture
- **Frontend**: React (RTT visualization & control)
- **Backend**: Go
- **Messaging Layer**: WhatsApp (via whatsmeow)
- **Data**: RTT samples collected per message/receipt event
- 
#### Steps : 
1. clone the repository 
2. go to ./app and run `npm i` and then `npm run dev`
3. go to ./whatsapp_client and run `go mod tidy`
	after it run `go run` , in the same folder and connect via your WhatsApp locally
### Flow
1. Send a controlled batch of messages
2. Measure RTT for each send/ack event
3. Collect RTT samples into arrays
4. Apply probability-based classification
5. Output:
   - Most probable device/state
   - Confidence percentages for each category

### Requirements
- Node.js + React
- Go (whatsmeow)
- Stable network for controlled measurements

---

## Disclaimer

This project is for **educational and research purposes only**.  
No personal data is stored, and no user is tracked beyond anonymous RTT metrics.
