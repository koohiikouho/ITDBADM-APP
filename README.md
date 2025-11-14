# template-repo <!-- omit from toc -->

![title](./assets/readme/title.jpg)

<!-- Refer to https://shields.io/badges for usage -->

![Year, Term, Course](https://img.shields.io/badge/AY2526--T1-qu1r0ra-blue) ![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)

A reusable GitHub repository template for programming projects.

Includes a standardized folder structure, README layout, and common configurations to speed up project setup and maintain consistency.

## Table of Contents <!-- omit from toc -->

- [1. Overview](#1-overview)
  - [1.1. Topic 1](#11-topic-1)
  - [1.2. Topic 2](#12-topic-2)
- [2. Getting Started](#2-getting-started)
  - [2.1. Prerequisites](#21-prerequisites)
  - [2.2. Installation](#22-installation)
  - [2.3. Running the Project](#23-running-the-project)
- [3. Usage](#3-usage)
  - [3.1. Use Case 1](#31-use-case-1)
  - [3.2. Use Case 2](#32-use-case-2)
- [4. References](#4-references)
  - [4.1. API](#41-api)
  - [4.2. Q\&A](#42-qa)
  - [4.3. Disclaimer](#43-disclaimer)

## 1. Overview

### 1.1. Topic 1

> [fill up]

### 1.2. Topic 2

> [fill up]

## 2. Getting Started

### 2.1. Prerequisites

#### Install pnpm or npm for the frontend

#### Install Python for the backend

- then install pip using `py -m ensurepip --upgrade` in a Windows terminal
- you may also opt to download the `get-pip.py` file online and run it with `py get-pip.py` in the directory it's located

### 2.2. Installation

#### Frontend stuff

#### Backend stuff

Activating the venv

- cd into the itdbadm-backend/ folder
- activate the venv by doing `env/Scripts/activate.bat` on Windows. `source env/bin/activate` for Unix users.

Installing the dependencies

- cd into the itdbadm-backend/backend/ folder
- do the command `pip install -r requirements.txt`. This will install all the required packages inside the txt file. Feel free to add if needed.

### 2.3. Running the Project

#### Frontend stuff

- inside itdbadm-frontend run `pnpm run dev` or `npm run dev`

#### Backend stuff

- inside itdbadm-backend/backend/ run `py manage.py runserver`

```http
  in settings.py, if you want to play with the database and models, remember to change the USER and PASSWORD to your local sql server. DO NOT USE THE CCSCLOUD SERVER CREDENTIALS FOR THIS.
```

```http
Stop both servers using Ctrl+C
```

## 3. Usage

### 3.1. Use Case 1

> [fill up]

### 3.2. Use Case 2

> [fill up]

## 4. References

### 4.1. API

> [fill up]

### 4.2. Q&A

> [fill up]

### 4.3. Disclaimer

> [!WARNING]
>
> ![ChatGPT](https://img.shields.io/badge/ChatGPT-74aa9c?logo=openai&logoColor=white) ![Claude](https://img.shields.io/badge/Claude-D97757?logo=claude&logoColor=white)
>
> Parts of this project were generated or assisted by AI tools, including OpenAI's [ChatGPT](https://chatgpt.com/) and Anthropic's [Claude](https://www.anthropic.com/claude). While care has been taken to review and verify the generated outputs, it may still contain errors. Please review the code critically and contribute improvements where necessary.
