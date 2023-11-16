# ClearVue Service

A repository to maintain clearvue microservice.

## Requirements
- Node 14.17.2
- Redis rejson 6.0.9 (Not required now)
- MySQL 5.7.32
- Works on Linux, Windows


## Development Guideline

- Install typescript globally

    ```bash
    npm install -g typescript
    ```

- Install dependencies

    ```bash
    npm install
    ```

- Copy environment variables

    ```bash
    cp sample.env .env
    ```

- Compile and run the project locally

    ```bash
    npm run clean
    npm run build
    npm run dev
    ```

## Install New Package

- Install Development only Dependent package

    ```bash
    npm install <package-name> --save-dev
    ```

- Install production package

    ```bash
    npm install <package-name>
    ```
## Swagger Documentation

- For Json reference use swagger.json
- Use https://editor.swagger.io/ for compiling and realtime view
- Add needful EP with details in swagger.json under common folder

## Deployment

- use below command to create new build and deploy with docker-compose

    ```bash
    $ docker-compose up -d --build
    ```

