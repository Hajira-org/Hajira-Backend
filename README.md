
[![Auto Changelog](https://github.com/Hajira-org/Hajira-Backend/actions/workflows/changelog.yml/badge.svg)](https://github.com/Hajira-org/Hajira-Backend/actions/workflows/changelog.yml)

# Hajira Backend
A Node.js + Express + MongoDB backend for the Hajira platform — a marketplace for connecting people with short-term jobs, similar to Uber but for work.  


## Features Include :
- **Authentication & Authorization**
  - User registration & login (JWT-based)
  - Role-based access (Job Seeker, Job Poster,)
  
- **User Management**
  - Profile creation & editing
  - Profile picture and basic details
  - Location storage

- **Job Management**
  - Create, update, delete job postings
  - View available jobs
  - Apply for jobs

- **Real Time Communication**
  - Chat with Users in real time
  - Chat with AI for job posting updates and ask for reccomendations.

- **Locator System**
  - Jobs filtered by location
  - Integration-ready for geolocation (Leaflet.js)

## Database Structure (privacy focused)
  - For the database we decided to isolate different items such as users, their messages, the jobs posted and applied jobs, this ensures the only link to the users and jobs     is their id therefore minimizing any leaks and making the database faster in retrieval.


##  Changelog
All notable changes are documented in the [CHANGELOG.md](./CHANGELOG.md).
