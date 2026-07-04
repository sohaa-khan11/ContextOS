# Video Demo Voiceover Script: ContextOS

This is a word-for-word spoken script for the ContextOS demo video. Follow the bracketed instructions `[...]` to align physical actions on screen with the spoken script.

---

## Part 1: Intro (0:00 - 0:30)

**Speaker**: 
"Hello everyone! Today, we are excited to introduce ContextOS—a proactive, ambient memory layer that fixes one of the biggest frustrations in AI-assisted programming: context loss.

Every time you start a new chat with an assistant, you lose your architecture history, engineering decisions, and task lists. You have to write long context prompts or manage manual master prompt files. ContextOS fixes this by establishing a persistent, cross-platform knowledge graph of your project, roaming with you across any AI tool."

**Visual Action**: 
- `[OPEN THIS]` ContextOS Dashboard on `http://localhost:3000`.
- Hover cursor over the empty 3D spatial graph viewport and rotate the black background space slightly.

---

## Part 2: Extension Setup & Projects (0:30 - 1:00)

**Speaker**:
"It starts with our roaming context client: the ContextOS Chrome Extension.

Here in our dashboard, we have initialized a clean project workspace called 'Next-Gen AI Backend'. If we open the Chrome extension popup in the top right, we can log in and select this active project. Now, as we navigate across AI chat interfaces, the extension acts as our ambient capture listener."

**Visual Action**:
- `[CLICK HERE]` Click the extension icon in the Chrome toolbar to open the popup.
- Select the project 'Next-Gen AI Backend' from the dropdown list.
- Close the extension popup.

---

## Part 3: Ambient Suggestions & Save (1:00 - 2:00)

**Speaker**:
"Let’s put it to work. I’m starting a new session on ChatGPT, asking for an AI backend design recommendation.

As ChatGPT streams its response, the extension quietly monitors the completion of the text stream. Notice that it does not disrupt the typing flow, and it ignores diagrams, code blocks, and lists. 

As soon as the message finishes generating, our backend pipeline parses the text in the background. Look at this: right here, below the paragraph, an elegant, custom suggestions toolbar slides in!"

**Visual Action**:
- `[OPEN THIS]` A ChatGPT tab.
- `[TYPE THIS]` in the ChatGPT input box: *"Which Python web framework should I choose for an async AI backend, and why?"*
- `[CLICK HERE]` Press Enter to submit the prompt.
- `[WAIT]` Let the text stream finish completely.
- `[SHOW THIS]` Point the cursor to the inline suggestion toolbar that slides in below the first paragraph, showing `💡 Suggested Decision: Choose FastAPI over Flask...`

---

## Part 4: Interactive Reasoning & Capture (2:00 - 2:45)

**Speaker**:
"We can click the 'WHY?' button to inspect the AI's reasoning inline, without annoying page alerts. The toolbar expands to show the extraction rationale.

Let's click 'SAVE'. Behind the scenes, the text block is hashed for database deduplication, routed to Groq for entity mapping, and ingested as semantic relationships in Cognee Cloud. The button transitions to 'SAVED' and cleanly slides out."

**Visual Action**:
- `[CLICK HERE]` Click the **WHY?** button on the suggestion bar to toggle the inline explanation dropdown.
- `[CLICK HERE]` Click the **SAVE** button.
- `[WAIT]` Let the button transition to `✓ SAVED` and fade out, collapsing the paragraph bottom spacing back to normal.

---

## Part 5: Real-Time Spatial Dashboard (2:45 - 3:30)

**Speaker**:
"Let's check our dashboard. Without refreshing the page, our 3D spatial graph has immediately populated!

We can see the new nodes representing our Decisions, Concepts, and Facts. Decisions are rendered as distinct red octahedrons, and relationships are mapped as physical lines in our 3D space. As we continue chatting, this graph automatically grows, forming an organized, semantic map of our project."

**Visual Action**:
- `[OPEN THIS]` Switch back to the ContextOS Dashboard tab.
- Rotate the 3D graph to show the newly rendered red octahedrons and white lines connecting nodes.
- Hover over a node to highlight its project detail card.

---

## Part 6: Universal Recall & Injection (3:30 - 4:15)

**Speaker**:
"Now, let's look at the handoff. I want to continue this project inside a completely new chat.

We open our extension popup and click 'Continue Project'. ContextOS queries Cognee to traverse our Neo4j graph, fetches all related decisions and facts, and synthesizes them using Groq into a single, cohesive continuation prompt. The extension copies it to our clipboard and automatically injects it right into our text box!"

**Visual Action**:
- `[OPEN THIS]` Open a brand-new, empty ChatGPT tab (or Claude tab).
- `[CLICK HERE]` Open the Chrome Extension popup.
- `[CLICK HERE]` Click the **Continue Project** button.
- `[SHOW THIS]` Point to the text input box where the synthesized continuation prompt is automatically injected, showing a markdown outline of project decisions and tasks.

---

## Part 7: Outro (4:15 - 4:45)

**Speaker**:
"With ContextOS, you no longer have to worry about chat context fading away. Your project memory is persistent, queryable, and travels with you across the web.

Thank you so much, and we look forward to your feedback!"

**Visual Action**:
- `[SHOW THIS]` Hover over the 3D graph dashboard showing active connections.
- End recording.
