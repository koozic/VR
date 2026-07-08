# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
COPY shared/ /shared/

ARG VITE_API_BASE_URL=http://vr-curatortest002.duckdns.org:8080
ARG VITE_WS_BASE_URL=ws://vr-curatortest002.duckdns.org:8080/ws/gallery
ARG VITE_WEB_LLM_MODEL_ID=Qwen2.5-1.5B-Instruct-q4f16_1-MLC
ARG VITE_WEBRTC_STUN_URLS=stun:stun.l.google.com:19302
ARG VITE_WEBRTC_TURN_URLS
ARG VITE_WEBRTC_TURN_USERNAME
ARG VITE_WEBRTC_TURN_CREDENTIAL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_BASE_URL=${VITE_WS_BASE_URL}
ENV VITE_WEB_LLM_MODEL_ID=${VITE_WEB_LLM_MODEL_ID}
ENV VITE_WEBRTC_STUN_URLS=${VITE_WEBRTC_STUN_URLS}
ENV VITE_WEBRTC_TURN_URLS=${VITE_WEBRTC_TURN_URLS}
ENV VITE_WEBRTC_TURN_USERNAME=${VITE_WEBRTC_TURN_USERNAME}
ENV VITE_WEBRTC_TURN_CREDENTIAL=${VITE_WEBRTC_TURN_CREDENTIAL}

RUN npm run build

FROM tomcat:10.1-jre21-temurin

RUN rm -rf /usr/local/tomcat/webapps/* \
    && mkdir -p /usr/local/tomcat/webapps/ROOT/WEB-INF
COPY --from=build /app/dist /usr/local/tomcat/webapps/ROOT
COPY tomcat-web.xml /usr/local/tomcat/webapps/ROOT/WEB-INF/web.xml

EXPOSE 8080
