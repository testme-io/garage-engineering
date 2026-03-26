# The Green Dashboard Paradox: Why Your Metrics Look Fine While Users Suffer

> 


### Hi Testers! 👋

I want to start a short series about something that dramatically changed how we debug performance issues. I call this approach Ephemeral Observability.

This is not about replacing Grafana or Kibana. They are great for monitoring.

But sometimes… they are the wrong tools for debugging.

&nbsp;

---

### The situation: “Green Dashboard” paradox

In one of the SaaS project I worked on, we hit a strange situation.

&nbsp;

Everything looked perfectly healthy on the dashboard:

* Latency Average: ~150ms (perfect)

* Error Rate: < 0.1% (solid)

* SLA: 99.9% (all green)

But at the same time… support was exploding.

&nbsp;

Around 2% of users reported that the app felt “completely broken”.

It wasn’t a global slowdown — it was happening only on specific user flows in our workflow management tool.

A user would apply a complex filter or update a task status… and nothing happened for ~3 seconds.

&nbsp;

No error.

No loading indicator.

Just a dead screen.

From the system’s perspective, the request was still processing.  

From the user’s perspective, it looked like nothing happened.

👉 No feedback = no trust.

&nbsp;

So what did users do?

Right. They clicked again.  

And again.  

And again.

And every click made it worse.

&nbsp;

This is where things got messy.

Multiple requests started overlapping.  

Some actions were executed twice.  

Some responses arrived late and overwrote newer state.

From the user’s perspective, the system wasn’t just “slow” — it was lying to them.

&nbsp;


Support was flooded with:

“I click and nothing happens”  

“My data disappears and reappears”  

“The system is unusable today”

Meanwhile… the dashboard was calmly showing a <span class="cmd">perfect green line</span>.

&nbsp;

---

### The Math of why we were blind

Imagine just 100 requests:

* 98 fast requests (100ms) — switching between tabs, reading task descriptions, checking notifications

* 2 slow requests (3 seconds) — applying a complex filter or updating a task status

&nbsp;

The average?

👉 ~158ms

On a dashboard, an +8ms shift looks like normal jitter. 

No alerts. 
Everything stays beautifully green.

&nbsp;

---

### “Wait, why didn’t alerts fire?”

Because nothing was technically “wrong” at system level.

* Alerts were based on average latency thresholds

* Trigger point was ~+50% degradation

* What we had was only ~5%

&nbsp;

And more importantly:

👉 we were aggregating all endpoints together

Fast endpoints diluted the slow ones.

So the system looked stable… while one critical path was burning.

&nbsp;

---

### Why this becomes a Real Problem

Now scale that up.

We were analyzing a focused slice of traffic (~3.5M requests/day, peak window).

That “tiny” 2% meant:

👉 ~70,000 broken user journeys every day

And not just any users.

These were users hitting high-value flows (complex reports, bulk updates, status transitions).

&nbsp;

---


### The Paradox

👉 Dashboard: “Everything is fine (+8ms jitter)” 

👉 User: “I literally can’t complete my action”


What was really happening?

![The Moment of Truth](assets/images/observability/Doctor_Who.jpg)

After digging deeper, we realized two things became obvious:

&nbsp;

`1. The Aggregation Trap`

Most monitoring pipelines look like this:

Service → Storage → Aggregation → Dashboard

And aggregation hides the real story.

We were looking at:

👉 “Average latency across all endpoints”

But the problem was surgical:

/api/v1/tasks/list → 100ms  
/api/v1/user/profile → 80ms  
/api/v1/tasks/filter → 3000ms

In the global average…

👉 the pain of /tasks/filter was diluted almost to zero

&nbsp;

`2. The Infrastructure Tax`

When we tried to investigate deeper, the process looked like this:

* request logs from DevOps

* wait for export (usually a time-sliced dataset)

* run queries in centralized systems

* wait again

The real bottleneck wasn’t just “slow queries”.

It was the exploration loop:

Every hypothesis → new query → new wait (on shared infrastructure, high-cardinality data)

👉 (and every wait kills your debugging flow)

👉 That’s how RCA turns into a ~4-hour process


&nbsp;

---
### The goal

We needed something different:

* no waiting

* no dependency on shared infra

* safe (logs contain sensitive data)

* fast enough for real exploration

Ideally:

👉 any engineer can analyze millions of records locally in seconds

&nbsp;

---

### The Idea

Instead of bringing engineers to the data…

👉 bring the data to the engineer

&nbsp;

So I built a small portable analytics stack:

`uv` — instant environment setup

`DuckDB` — in-process OLAP (3.5M rows in ~0.8s on a laptop)

`Marimo` — reactive interface (like Excel + Python)

&nbsp;

---

### The Result

Once you have a focused dataset:

* RCA analysis: hours → < 1 minute

* Bug discovery: 15+ hidden regressions

* Workflow: performance checks before PR, not after incidents

* Infrastructure: zero changes, runs locally


&nbsp;

---

### A Small Realization

Traditional observability answers predefined questions.

But debugging starts with questions nobody planned for.

And most of those questions sound like:

👉 “what’s wrong with this specific path?”

This is what I call `Ephemeral Observability`

&nbsp;

---

In the next posts I’ll show:

* how to analyze millions of logs locally 

* how to isolate slow endpoints in seconds 

* how to build a performance diff workflow
&nbsp;

---

### Reproduce it yourself

Theory is boring without practice

**I’ll share the dataset + the exact tools (uv, DuckDB, Marimo) to reproduce this analysis locally in the next post**

Stay tuned — we are just getting started in the `Garage`