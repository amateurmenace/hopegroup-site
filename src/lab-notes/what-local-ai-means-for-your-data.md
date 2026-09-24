---
title: What "local AI" actually means for your organization's data
date: 2026-09-22
author: Stephen Walter
topics:
  - Local AI
  - Privacy
  - Tech stack
summary: A plain-language explanation of where your data goes when you use AI, what changes when a model runs on a machine you control, why we are pioneering that path without calling it our default yet, and the short checklist we use in the lab to decide.
featured: true
---
When people hear "AI," most picture a chat box that sends whatever you type to a company far away. For a lot of tasks that is fine. For a case file, a client list, a payroll question, or a grant budget, it is not.

"Local AI" means the model runs on a computer you control: a workstation in our lab, a server in your office, or the laptop already on your desk. Your data goes into the model and the answer comes back, and nothing leaves the building.

## What it changes

Three things.

**Where your data lives.** With a cloud tool, every prompt is a small export of your organization's information to a vendor. With a local model, the data never crosses the wall.

**Who can train on it.** Nobody. There is no vendor on the other end to build a product out of your client list.

**What it costs.** Electricity, not per-word fees. That sounds small until you try to automate something that runs a thousand times a day. Local models change what a small organization can afford to do.

## What it does not change

Local models are smaller than the largest commercial ones. For some tasks, long reasoning, polished writing, unusual languages, a frontier model is still better. We use those too, on our terms: business agreements that prohibit training on your data, no retention beyond the request, data minimized before it is sent, and a label in the interface so you always know which model answered.

## How we decide

The checklist we use in the lab fits on an index card.

1. **Does the task involve information about a person?** Local when we can, and minimized before it travels when we cannot.
2. **Would you be comfortable pasting it into a public website?** If not, local.
3. **Does the task need the very best writing or reasoning?** A frontier model, with the protections above, and a person reviewing the result.
4. **Can the answer affect someone's money, housing, health, or job?** A person decides. The model only drafts.

## What it looks like in practice

In our apps we are pioneering local models for the steps that touch sensitive data, starting where the task is small and the stakes are high. It is not yet our default for every task, and we say so: the largest commercial models still do most of the heavy lifting, under terms that prohibit training on your data. The steps that touch the public web, like Project Lookout scanning a procurement portal, can run anywhere, because that information is already public. The line is drawn around your data, not around convenience, and we move it outward as local models prove they can hold it.

If you want to see this running, come by the lab. We will show you the machine.
