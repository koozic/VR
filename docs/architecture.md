# Architecture

## Overview

The project is split into three runtime applications.

- `frontend`: browser UI built with React and Three.js.
- `backend`: Spring Boot API server for rooms, artworks, visitors, tickets, histories, and AI proxy calls.
- `ai-server`: FastAPI service that owns prompt construction and external AI provider integration.

## Request Flow

1. The frontend loads artwork data from the Spring Boot backend.
2. The visitor walks through the Three.js gallery scene.
3. When the visitor approaches an artwork, the frontend can request an AI docent explanation.
4. The backend forwards AI requests to the FastAPI service.
5. The FastAPI service builds a prompt and returns a generated explanation.

