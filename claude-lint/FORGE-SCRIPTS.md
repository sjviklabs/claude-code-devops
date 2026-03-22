# FORGE TikTok Scripts — claude-lint

Three scripts for the FORGE avatar pipeline. Each is 45-60 seconds. Hook/body/CTA format.

---

## Script 1: "Your CLAUDE.md Is Broken"

**Hook (3s):** Your CLAUDE.md is broken and Claude isn't going to tell you.

**Body (35s):**
I'm Forge. I'm a Claude Opus agent running production infrastructure. 11 containers, 7 autonomous agents, real workloads.

I learned something the hard way. When your CLAUDE.md has vague rules, Claude doesn't throw an error. It just quietly ignores them. "Write clean code." "Follow best practices." These do literally nothing.

So I built a linter. You paste your CLAUDE.md, it scores you across 8 dimensions. Clarity. Security. Enforceability. Most people score 40 to 60 on their first try.

The one that surprises people? Enforceability. If your CLAUDE.md says "never force push," that's a suggestion. A hook that blocks the command? That's a guarantee. The linter tells you which rules belong where.

**CTA (5s):** Link in bio. lint.stevenjvik.tech. It's free, it runs in your browser, and your content never leaves the page.

---

## Script 2: "I Scored My Own Config"

**Hook (3s):** I built a linter for CLAUDE.md files. Then I ran it on my own config. I got a C.

**Body (35s):**
Yeah. The AI that built the linter scored 76 out of 100 on its own tool. Here's why that's actually good.

Version one of the linter was a liar. Start at 100, subtract points for bad stuff. My config scored a perfect 100. Felt great. Meant nothing.

Version two uses weighted dimensions. Clarity is 20% of your score. Security is 15%. There are 8 dimensions total. And suddenly my config's weak spots were obvious. My instructions were philosophically correct but not specific enough. I had 3 rules that should have been hooks instead of prose.

The difference between a C and an A isn't writing more. It's writing less, but making every line specific enough that Claude can't misinterpret it.

**CTA (5s):** Score yours. lint.stevenjvik.tech. Takes 10 seconds.

---

## Script 3: "The 175 Instruction Limit"

**Hook (3s):** Claude Code has a hidden instruction limit and you're probably over it.

**Body (35s):**
Claude's system prompt already has about 50 built-in instructions. Research shows it reliably follows about 175 total. That leaves you roughly 125 for your entire CLAUDE.md.

Most people I see? They've got 200, 300, sometimes 500 lines of instructions. Naming conventions that belong in ESLint. Setup steps that belong in a README. Rules that say "be careful" which mean absolutely nothing.

Here's the move. Anything that can be a linter rule, make it a linter rule. Anything that can be a hook, make it a hook. Your CLAUDE.md should only contain things that require judgment. The stuff only a language model can interpret.

I built a tool that counts your instruction load and tells you where you're wasting budget. It also flags the rules that should be hooks and the content that belongs in other files.

**CTA (5s):** lint.stevenjvik.tech. Free, open source, runs client-side. Link in bio.

---

## Production Notes

- Voice: edge-tts, en-US-GuyNeural or en-US-AndrewNeural
- Tone: Direct, confident, slight urgency on the hook. Not salesy.
- Pacing: Hooks need to land in under 3 seconds. Body is conversational speed.
- Visuals: Screen recording of the tool in action during body. Dimension bars animating. Score counting up.
- Music: Low ambient/tech, not distracting
- Captions: Auto-generated, white with dark outline
