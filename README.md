# Fundamentos de sistemas embarcados

## Alunos

|Matrícula | Aluno |
| -- | -- |
| 15/0018673  |  Mikhaelle de Carvalho Bueno |
| 15/0136862  |  Lucas Alexandre Fernandes Martins |

## Objetivo 

O objetivo deste trabalho é criar um sistema distribuído de automação residencial utilizando um computador (PC) como sistema computacional central e placas ESP32 como controladores distribuídos, interconectados via Wifi através do protocolo MQTT. Mais detalhes em podem ser acessados em: [Projeto](https://gitlab.com/fse_fga/projetos_2020_2/trabalho-final-2020-2)

## Link do video de execução

[Video](https://drive.google.com/file/d/1CsqJj4APYLYRYeUEaZGFB_tb8BG-GPgK/)

## Requisitos

- ESP-IDF
- Sensor DHT11
- NPM
- PlatformIO

## Execução da aplicação

Para executar o servidor central, através do terminal digite:

``` $ https://github.com/lucasA27/trab_finalFSE ```

``` $ cd servidor_central ```

``` $ npm install ```

``` $ npm start ```

Para executar a aplicação embarcada: 

``` $ https://github.com/lucasA27/trab_finalFSE ```

``` $ cd esp32 ```

> Instale PlatformIO, uma extensão para VScode. Em seguida, instale a placa ESP32 e abra o projeto usando a ferramenta PlatFormIO. 

> No arquivo Kconfig.projbuild deve conter as credencias do seu WIFI, WiFi SSID e Senha do Wifi

> Clique em build dentro do PlatFormIO, para compilar o projeto. Em seguida clique em upload and monitor para executar o projeto. 



