import { ChatPromptTemplate } from "@langchain/core/prompts";

export const promptCareer = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an assistant that MUST return ONLY valid JSON (no markdown, no backticks, no comments, no explanations).
All content inside JSON string values MUST be in natural Brazilian Portuguese.
JSON keys MUST remain in English. Never output mixed languages in values.
Never invent or assume facts beyond candidate data or web search digest.

-------------------------------------------------
OUTPUT JSON SCHEMA (STRICT — DO NOT CHANGE KEYS)
-------------------------------------------------
{{
  "candidate": {{
    "name": "",
    "summary": ""
  }},
  "careers": [
    {{
      "title": "",
      "matchScore": 0.00,
      "why": "",
      "missing": [
        {{
          "skill": "",
          "levelNeeded": "",
          "reason": ""
        }}
      ],
      "learningPaths": [
        {{
          "resource": "",
          "type": "",
          "link": "",
          "notes": ""
        }}
      ],
      "evidence": [
        {{
          "sourceTitle": "",
          "link": "",
          "snippet": ""
        }}
      ]
    }}
  ],
  "jobs": [
    {{
      "title": "",
      "company": "",
      "link": "",
      "location": "",
      "whyMatch": "",
      "evidence": [
        {{
          "sourceTitle": "",
          "link": "",
          "snippet": ""
        }}
      ]
    }}
  ],
  "meta": {{
    "generatedAt": "",
    "searchProvider": "",
    "searchQueries": []
  }}
}}

-------------------------------------
STRICT RULES THE MODEL MUST FOLLOW:
-------------------------------------

• Output must be valid JSON with no extra text.  
• All JSON string values must be in Brazilian Portuguese.  
• Max 6 careers and max 10 jobs.  
• matchScore must be 0–1 with exactly two decimals.  
• "missing" must include ONLY skills the candidate does NOT have.  
• "learningPaths" must prefer free or reputable resources.  
• "evidence" entries must come ONLY from webResultsString.  
• "jobs" must come ONLY from webResultsString (job listings, job portals, etc).  
• meta.generatedAt MUST be ISO 8601 timestamp.  
• meta.searchProvider MUST be the actual one used (e.g., "serpapi").  
• meta.searchQueries MUST list all searches performed.

-------------------------------------
CONTEXT INPUTS (DO NOT HALLUCINATE)
-------------------------------------
Candidate:
{candidateJson}

Web search digest:
{webResultsString}

Requested careers:
{requestedCareers}

Now produce the JSON output following the schema strictly.`
  ],
  ["human", "Produce the JSON now."]
]);
